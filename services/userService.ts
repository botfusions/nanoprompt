import { UserProfile, AdminDashboardUser } from '../src/types';
import { supabase } from '../src/lib/supabase';
import { z } from 'zod';
import DOMPurify from 'dompurify';

const STORAGE_KEY_SESSION = 'nb_session_email';

// Security: Rate Limiting Store (In-Memory)
// Note: In production, use Redis. This is a local simulation.
const rateLimitStore: Record<string, { count: number; windowStart: number }> = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 100;

// Security: Zod Validation Schema
const EmailSchema = z.string().email().min(3).max(100);

// Helper: Rate Limiter
const checkRateLimit = (ipOrKey: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore[ipOrKey];

  if (!record) {
    rateLimitStore[ipOrKey] = { count: 1, windowStart: now };
    return true;
  }

  if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Window expired, reset
    rateLimitStore[ipOrKey] = { count: 1, windowStart: now };
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Limit exceeded
  }

  record.count++;
  return true;
};

export const userService = {
  /**
   * Giriş yap veya yeni kayıt oluştur (Soft Auth).
   * Google şifresi istemez, sadece e-posta ile veritabanına bakar.
   * [SECURED]: Added Zod Validation, Sanitization, and Rate Limiting.
   */
  loginOrRegister: async (email: string): Promise<UserProfile | null> => {
    try {
      // 0. Security Checks
      // Fake IP check (client-side limit is weak, but better than nothing for this context)
      // In a real API, this would be req.ip
      const clientKey = 'client_browser_session';
      if (!checkRateLimit(clientKey)) {
        alert("Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.");
        return null;
      }

      // 1. Sanitization & Validation
      const sanitizedEmail = DOMPurify.sanitize(email.trim().toLowerCase());

      const result = EmailSchema.safeParse(sanitizedEmail);
      if (!result.success) {
        alert("Geçersiz e-posta formatı.");
        return null;
      }

      const cleanEmail = result.data;

      // 2. Önce kullanıcı veritabanında var mı bakalım
      let { data: profile, error } = await supabase
        .from('nano_profiles')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      // Özel Admin Mantığı: Eğer admin giriyorsa yetkileri tazele
      const adminEmail = process.env.VITE_ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const isAdminEmail = cleanEmail === adminEmail;

      if (profile) {
        // Kullanıcı bulundu
        // Eğer adminse ve kredisi azsa veya yetkisi yoksa düzelt
        if (isAdminEmail && (profile.credits < 100 || !profile.is_admin)) {
          const { data: updated } = await supabase
            .from('nano_profiles')
            .update({ credits: 100, is_admin: true })
            .eq('email', cleanEmail)
            .select()
            .single();
          if (updated) profile = updated;
        }

        localStorage.setItem(STORAGE_KEY_SESSION, cleanEmail);
        return {
          email: profile.email,
          credits: profile.credits,
          joinDate: new Date(profile.created_at).getTime(),
          isAdmin: profile.is_admin
        };
      } else {
        // Kullanıcı yok, YENİ KAYIT OLUŞTUR
        const newProfile = {
          email: cleanEmail,
          credits: isAdminEmail ? 100 : 20, // LUNCH PROMO: Admin ise 100, yeni kayıt ise 20 kredi
          is_admin: isAdminEmail,
          created_at: new Date().toISOString()
        };

        const { data: created, error: createError } = await supabase
          .from('nano_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;

        if (created) {
          localStorage.setItem(STORAGE_KEY_SESSION, cleanEmail);
          return {
            email: created.email,
            credits: created.credits,
            joinDate: new Date(created.created_at).getTime(),
            isAdmin: created.is_admin
          };
        }
      }
    } catch (err) {
      console.error("Supabase Auth Error:", err);
      alert("Veritabanına bağlanılamadı. Lütfen Supabase ayarlarınızı kontrol edin.");
      return null;
    }
    return null;
  },

  /**
   * Oturumdaki kullanıcının güncel bilgisini veritabanından çeker.
   */
  getUserProfile: async (email: string): Promise<UserProfile | null> => {
    // Validate email before query
    const result = EmailSchema.safeParse(email);
    if (!result.success) return null;

    const { data, error } = await supabase
      .from('nano_profiles')
      .select('*')
      .eq('email', result.data)
      .single();

    if (error || !data) return null;

    return {
      email: data.email,
      credits: data.credits,
      joinDate: new Date(data.created_at).getTime(),
      isAdmin: data.is_admin
    };
  },

  /**
   * Tarayıcıdaki oturum bilgisini okur (sadece e-posta stringi).
   */
  getSessionEmail: (): string | null => {
    return localStorage.getItem(STORAGE_KEY_SESSION);
  },

  /**
   * Kullanıcıdan belirtilen miktarda kredi düşer.
   * Veritabanında işlem yapar.
   */
  deductCredit: async (email: string, amount: number = 1): Promise<boolean> => {
    // Validate email
    const result = EmailSchema.safeParse(email);
    if (!result.success) return false;
    const cleanEmail = result.data;

    // Önce güncel krediyi al
    const { data: profile } = await supabase
      .from('nano_profiles')
      .select('credits')
      .eq('email', cleanEmail)
      .single();

    if (profile && profile.credits >= amount) {
      const newCredits = profile.credits - amount;

      const { error } = await supabase
        .from('nano_profiles')
        .update({ credits: newCredits })
        .eq('email', cleanEmail);

      return !error;
    }
    return false;
  },

  /**
   * ADMIN: Tüm kullanıcıları listeler.
   */
  getAllUsers: async (): Promise<AdminDashboardUser[]> => {
    const { data, error } = await supabase
      .from('nano_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as AdminDashboardUser[];
  },

  /**
   * ADMIN: Bir kullanıcıya kredi ekler.
   */
  adminAddCredits: async (targetEmail: string, amount: number): Promise<boolean> => {
    // Validate Email
    const result = EmailSchema.safeParse(targetEmail);
    if (!result.success) return false;
    const cleanEmail = result.data;

    const { data: profile } = await supabase
      .from('nano_profiles')
      .select('credits')
      .eq('email', cleanEmail)
      .single();

    if (!profile) return false;

    const newCredits = profile.credits + amount;

    const { error } = await supabase
      .from('nano_profiles')
      .update({ credits: newCredits })
      .eq('email', cleanEmail);

    return !error;
  },

  /**
   * ADMIN: Kullanıcıyı siler.
   */
  adminDeleteUser: async (targetEmail: string): Promise<boolean> => {
    // Validate Email
    const result = EmailSchema.safeParse(targetEmail);
    if (!result.success) return false;
    const cleanEmail = result.data;

    const { error } = await supabase
      .from('nano_profiles')
      .delete()
      .eq('email', cleanEmail);

    return !error;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }
};
