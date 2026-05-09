
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
                // First login (Google OAuth) — auto-create client profile
                const newProfile = {
                    id: uid,
                    uid: uid,
                    name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
                    email: user.email || '',
                    avatar: user.photoURL || '',
                    role: 'user',
                    profileComplete: false,
                    phone: null,
                    favorites: [],
                    createdAt: new Date().toISOString(),
                };
                await setDoc(docRef, newProfile);
                console.log(`✅ Auto-created profile for ${user.email} (first Google login)`);
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
                // Skip email verification check for Google OAuth users
                // (Google accounts are always verified)
                const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
                if (!isGoogleUser && !user.emailVerified) {
                    setShowVerifyEmail(true);
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
