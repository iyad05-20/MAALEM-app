import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, requireArtisan, AuthRequest } from '../middleware/auth.middleware.js';
import { getFirestore } from '../services/firebase.service.js';
import crypto from 'crypto';

const router = Router();

// ============================================================================
// POST /api/orders - Créer une commande
// ============================================================================
router.post('/', verifyFirebaseToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const db = getFirestore();
        if (!db) return res.status(503).json({ success: false, error: 'Firestore not initialized' });

        const user = authReq.user!;
        const { category, title, description, imageUrl, city, urgency, targetedArtisans, clarityScore } = req.body;

        if (!category) {
            return res.status(400).json({ success: false, error: 'Category is required' });
        }

        const orderId = crypto.randomUUID();

        const orderCity = city || user.profile?.city || 'Marrakech';
        
        // Si targetedArtisans non fournis, on fait une requête pour cibler des artisans de la même ville
        let finalTargetedArtisans = targetedArtisans || [];
        if (finalTargetedArtisans.length === 0) {
            const artisansSnap = await db.collection('artisans')
                .where('category', '==', category)
                .where('city', '==', orderCity)
                .limit(5)
                .get();
            
            // Fallback: If no artisan in the exact city, just match category
            if (artisansSnap.empty) {
                const fallbackSnap = await db.collection('artisans')
                    .where('category', '==', category)
                    .limit(5)
                    .get();
                finalTargetedArtisans = fallbackSnap.docs.map((doc: any) => doc.id);
            } else {
                finalTargetedArtisans = artisansSnap.docs.map((doc: any) => doc.id);
            }
        }

        const newOrder = {
            id: orderId,
            clientId: user.uid,
            userName: user.profile?.name || 'Client',
            userAvatar: user.profile?.avatar || '',
            category,
            title: title || `Demande de ${category}`,
            description: description || '',
            imageUrl: imageUrl || '',
            city: orderCity,
            status: "EN ATTENTE D'EXPERT",
            urgency: urgency || 'Normale',
            clarityScore: clarityScore || 0,
            targetedArtisans: finalTargetedArtisans,
            isDirect: req.body.isDirect || false,
            searchRadius: 1,
            createdAt: new Date().toISOString()
        };

        await db.collection('orders').doc(orderId).set(newOrder);

        res.status(201).json({ success: true, order: newOrder });
    } catch (error: any) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================================================
// GET /api/orders - Lister les commandes
// ============================================================================
router.get('/', verifyFirebaseToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const db = getFirestore();
        if (!db) return res.status(503).json({ success: false, error: 'Firestore not initialized' });

        const user = authReq.user!;
        let snapshot;

        if (user.isArtisan) {
            snapshot = await db.collection('orders')
                .where('status', '==', "EN ATTENTE D'EXPERT")
                .orderBy('createdAt', 'desc')
                .get();
        } else {
            snapshot = await db.collection('orders')
                .where('clientId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();
        }

        const orders = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

        res.json({ success: true, orders });
    } catch (error: any) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================================================
// GET /api/orders/:id - Détail d'une commande
// ============================================================================
router.get('/:id', verifyFirebaseToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const db = getFirestore();
        if (!db) return res.status(503).json({ success: false, error: 'Firestore not initialized' });

        const { id } = req.params;
        const docSnap = await db.collection('orders').doc(id).get();

        if (!docSnap.exists) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const order = { id: docSnap.id, ...docSnap.data() } as any;

        const user = authReq.user!;
        if (!user.isArtisan && order.clientId !== user.uid) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        res.json({ success: true, order });
    } catch (error: any) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================================================
// PATCH /api/orders/:id/status - State Machine RBAC
// ============================================================================
router.patch('/:id/status', verifyFirebaseToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const db = getFirestore();
        if (!db) return res.status(503).json({ success: false, error: 'Firestore not initialized' });

        const { id } = req.params;
        const { status, artisanId, artisanName, artisanImage, artisanRating, assignedPrice, pendingReview } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }

        const docRef = db.collection('orders').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const order = docSnap.data() as any;
        const user = authReq.user!;

        // ─── Actors ───────────────────────────────────────────────────────────
        // isOrderOwner: support clientId (new orders via backend) and userId (legacy)
        const isOrderOwner      = order.clientId === user.uid || order.userId === user.uid;
        const isAssignedArtisan = order.artisanId === user.uid;

        // ─── State Machine ────────────────────────────────────────────────────
        // Defines all legal transitions and who is allowed to trigger them.
        // 'owner'   = the client who created the order
        // 'artisan' = the artisan currently assigned to the order
        const TRANSITIONS: Record<string, Array<{ to: string; who: 'owner' | 'artisan' }>> = {
            "EN ATTENTE D'EXPERT": [
                { to: 'En cours', who: 'owner'   }, // client accepts a quote
                { to: 'Annulé',   who: 'owner'   }, // client cancels
            ],
            'En cours': [
                { to: 'En attente de clôture', who: 'owner' }, // client signals work done
                { to: 'Annulé',                who: 'owner' }, // client cancels
            ],
            'En attente de clôture': [
                { to: 'Terminé',  who: 'artisan' }, // artisan confirms completion
                { to: 'En cours', who: 'owner'   }, // client contests → back in progress
            ],
        };

        const currentStatus = order.status as string;
        const allowedTransitions = TRANSITIONS[currentStatus] || [];
        const transition = allowedTransitions.find(t => t.to === status);

        // Reject unknown or illegal transitions
        if (!transition) {
            return res.status(400).json({
                success: false,
                error: `Transition "${currentStatus}" → "${status}" non autorisée`,
                allowedTransitions: allowedTransitions.map(t => t.to),
            });
        }

        // Verify the caller has the required role for this transition
        if (transition.who === 'owner' && !isOrderOwner) {
            return res.status(403).json({
                success: false,
                error: 'Seul le client propriétaire peut effectuer cette action',
            });
        }
        if (transition.who === 'artisan' && !isAssignedArtisan) {
            return res.status(403).json({
                success: false,
                error: "Seul l'artisan assigné peut effectuer cette action",
            });
        }

        // ─── Build Update Payload ─────────────────────────────────────────────
        const updates: Record<string, any> = {
            status,
            updatedAt: new Date().toISOString(),
        };

        if (status === 'En attente de clôture' && pendingReview) {
            updates.pendingReview = pendingReview;
        }

        // When client accepts a quote (EN ATTENTE → En cours), persist artisan details
        if (currentStatus === "EN ATTENTE D'EXPERT" && status === 'En cours') {
            if (artisanId)     updates.artisanId     = artisanId;
            if (artisanName)   updates.artisanName   = artisanName;
            if (artisanImage)  updates.artisanImage  = artisanImage;
            if (artisanRating) updates.artisanRating = artisanRating;
            if (assignedPrice) updates.assignedPrice = assignedPrice;
        }

        // ─── Execute Archive Transaction ──────────────────────────────────────
        if (status === 'Terminé') {
            const archiveRef = db.collection('archivedOrders').doc(id);
            const reviewId = `rev-${Date.now()}`;
            const reviewRef = db.collection('reviews').doc(reviewId);
            
            if (!order.artisanId) {
                return res.status(400).json({ success: false, error: 'Cannot complete order without artisan assigned' });
            }
            const artisanRef = db.collection('artisans').doc(order.artisanId);

            try {
                await db.runTransaction(async (t) => {
                    const artisanDoc = await t.get(artisanRef);
                    if (!artisanDoc.exists) {
                        throw new Error('Artisan does not exist');
                    }
                    const artisanData = artisanDoc.data() || {};
                    const currentRating = artisanData.rating || 0;
                    const totalJobs = artisanData.reviewsCount || artisanData.jobsDone || 0;
                    
                    let newRating = currentRating;
                    let newCount = totalJobs;
                    
                    const review = order.pendingReview;
                    let finalReviewData = null;

                    if (review) {
                        newCount = totalJobs + 1;
                        newRating = ((currentRating * totalJobs) + review.rating) / newCount;
                        
                        finalReviewData = {
                            id: reviewId,
                            artisanId: order.artisanId,
                            orderId: id,
                            userId: order.clientId || order.userId || 'unknown',
                            rating: review.rating,
                            comment: review.comment,
                            images: review.images || [],
                            createdAt: new Date().toISOString(),
                            userName: order.userName || 'Client Vork',
                            userAvatar: order.userAvatar || 'CV',
                            date: new Date().toLocaleDateString('fr-FR')
                        };
                        t.set(reviewRef, finalReviewData);
                    }

                    // Prepare archived order data (excluding pendingReview to avoid orphans)
                    const { pendingReview: _removedPending, ...orderWithoutReview } = order;
                    const archivedData = {
                        ...orderWithoutReview,
                        ...updates,
                        status: 'Terminé',
                        completedAt: new Date().toISOString(),
                        archivedAt: new Date().toISOString(),
                        finishRequestedBy: 'client',
                        reviewId: review ? reviewId : null,
                        resultImages: review?.images || [],
                        finalReview: finalReviewData
                    };

                    t.set(archiveRef, archivedData);

                    t.update(artisanRef, {
                        rating: Number(newRating.toFixed(2)),
                        reviewsCount: newCount,
                        jobsDone: (artisanData.jobsDone || 0) + 1
                    });

                    t.delete(docRef);
                });

                console.log(`[ORDERS] ARCHIVED ${id} by artisan ${user.uid}`);
                return res.json({ success: true, message: 'Commande terminée et archivée avec succès' });
            } catch (err: any) {
                console.error("Archive transaction failed:", err);
                return res.status(500).json({ success: false, error: 'Failed to archive order' });
            }
        }

        // ─── Standard Update ──────────────────────────────────────────────────
        await docRef.update(updates);

        console.log(`[ORDERS] ${currentStatus} → ${status} | order=${id} | by=${user.uid} (${isOrderOwner ? 'owner' : 'artisan'})`);
        res.json({ success: true, message: 'Status updated', from: currentStatus, to: status });
    } catch (error: any) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
