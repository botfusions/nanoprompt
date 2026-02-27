import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Check if the user is an admin based on email
 */
export function isAdmin(email?: string): boolean {
    if (!email) return false;
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
    return adminEmails.includes(email);
}

export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    twitter_url: string | null;
    created_at: string;
}

// ==================== Auth Functions ====================

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
            },
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Sign out
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("botsnano_profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }

    return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
        .from("botsnano_profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
    const { data } = await supabase
        .from("botsnano_profiles")
        .select("username")
        .eq("username", username)
        .single();

    return !data;
}
