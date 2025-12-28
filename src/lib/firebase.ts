import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    Auth
} from "firebase/auth";

// Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// Lazy initialization to prevent build errors when env vars are missing
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

function getFirebaseApp(): FirebaseApp | null {
    if (typeof window === 'undefined') return null; // Skip during SSR/build
    if (!firebaseConfig.apiKey) return null; // Skip if no API key

    if (!app) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    return app;
}

function getFirebaseAuth(): Auth | null {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;

    if (!auth) {
        auth = getAuth(firebaseApp);
    }
    return auth;
}

function getGoogleProvider(): GoogleAuthProvider | null {
    if (!getFirebaseApp()) return null;

    if (!googleProvider) {
        googleProvider = new GoogleAuthProvider();
    }
    return googleProvider;
}

export { getFirebaseAuth as auth, getGoogleProvider as googleProvider, onAuthStateChanged };
export type { FirebaseUser };


// ==================== Auth Functions ====================

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
    const authInstance = getFirebaseAuth();
    const provider = getGoogleProvider();
    if (!authInstance || !provider) {
        throw new Error("Firebase is not configured. Please add Firebase environment variables.");
    }
    const result = await signInWithPopup(authInstance, provider);
    return result.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
        throw new Error("Firebase is not configured. Please add Firebase environment variables.");
    }
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    return result.user;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
        throw new Error("Firebase is not configured. Please add Firebase environment variables.");
    }
    const result = await createUserWithEmailAndPassword(authInstance, email, password);
    return result.user;
}

/**
 * Sign out
 */
export async function signOut() {
    const authInstance = getFirebaseAuth();
    if (!authInstance) return;
    await firebaseSignOut(authInstance);
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
    const authInstance = getFirebaseAuth();
    return authInstance?.currentUser ?? null;
}

