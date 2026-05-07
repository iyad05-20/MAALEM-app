
import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase.config';
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { sanitizeFirestoreData, migrateUrl } from '../utils';

export const useAuthLogic = () => {
    const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [userRole, setUserRole] = useState<'user' | 'artisan'>('user');
    const [authLoading, setAuthLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('vork-theme');
        return saved === null ? true : saved === 'dark';
    });
    const [showVerifyEmail, setShowVerifyEmail] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);

    const loadUserProfileAndSubscribe = async (user: FirebaseUser): Promise<() => void> => {
        try {
            const uid = user.uid;

            // Check users collection first
            let docRef = doc(db, 'users', uid);
            let docSnap = await getDoc(docRef);
            let role: 'user' | 'artisan' = 'user';

            if (!docSnap.exists()) {
                // Check artisans collection
                docRef = doc(db, 'artisans', uid);
                docSnap = await getDoc(docRef);
                role = 'artisan';
            }

            if (!docSnap.exists()) {
                // First login (Google OAuth) — auto-create profile
                // Retrieve the role they selected before clicking the Google button
                const savedRole = localStorage.getItem('vork_pending_google_role') as 'user' | 'artisan' || 'user';
                role = savedRole;
                docRef = doc(db, role === 'artisan' ? 'artisans' : 'users', uid);

                const newProfile: any = {
                    id: uid,
                    uid: uid,
                    name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
                    email: user.email || '',
                    avatar: user.photoURL || '',
                    role: role,
                    profileComplete: false,
                    phone: null,
                    favorites: [],
                    createdAt: new Date().toISOString(),
                };

                // Add default artisan fields if necessary
                if (role === 'artisan') {
                    Object.assign(newProfile, {
                        category: 'Plomberie',
                        available: true,
                        rating: 5,
                        experience: 0,
                        jobsDone: 0,
                        about: "Expert Vork.",
                        services: ['Plomberie'],
                        portfolio: [],
                        reviews: [],
                        location: ''
                    });
                }

                await setDoc(docRef, newProfile);
                localStorage.removeItem('vork_pending_google_role');
                console.log(`✅ Auto-created ${role} profile for ${user.email} (Google login)`);
            }

            // Return the onSnapshot unsubscribe function to keep profile in sync
            return onSnapshot(docRef, (snap) => {
                if (snap.exists()) {
                    const data = sanitizeFirestoreData(snap.data());
                    const profileData = { ...data, id: snap.id };
                    profileData.image = migrateUrl(profileData.image || profileData.avatar);
                    setUserProfile(profileData);
                    setUserRole(role);
                    setFavorites(data.favorites || []);
                }
            });

        } catch (e) {
            console.error("Error loading profile:", e);
            return () => {}; // return empty unsubscribe on error
        }
    };

    useEffect(() => {
        let profileUnsubscribe: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = null;
            }

            setAuthUser(user);
            if (user) {
                // Skip email verification check for Google OAuth users (always verified)
                const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
                if (!isGoogleUser && !user.emailVerified) {
                    setShowVerifyEmail(true);
                } else {
                    setShowVerifyEmail(false);
                }
                profileUnsubscribe = await loadUserProfileAndSubscribe(user);
            } else {
                setUserProfile(null);
                setFavorites([]);
                setShowVerifyEmail(false);
            }
            setAuthLoading(false);
        });

        return () => {
            unsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            console.error("Logout error:", e);
        }
    };

    return {
        authUser,
        setAuthUser,
        userProfile,
        setUserProfile,
        userRole,
        setUserRole,
        authLoading,
        showVerifyEmail,
        setShowVerifyEmail,
        favorites,
        setFavorites,
        isDarkMode,
        setIsDarkMode,
        handleLogout
    };
};
