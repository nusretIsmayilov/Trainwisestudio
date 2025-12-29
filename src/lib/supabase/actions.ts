// src/lib/supabase/actions.ts
import { supabase } from "./client";
import { config } from "@/lib/config";
import { FORCE_PRODUCTION_URLS, logUrlUsage } from "@/lib/force-urls";

export async function sendMagicLink(email: string) {
  const redirectUrl = import.meta.env.PROD
    ? FORCE_PRODUCTION_URLS.MAGIC_LINK
    : `${config.appUrl}/onboarding/step-1`;

  logUrlUsage("Magic Link", redirectUrl);

  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function sendPasswordResetLink(email: string) {
  const redirectUrl = import.meta.env.PROD
    ? FORCE_PRODUCTION_URLS.PASSWORD_RESET
    : `${config.appUrl}/update-password`;

  logUrlUsage("Password Reset", redirectUrl);

  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
}

export async function updateUserPassword(password: string) {
  return await supabase.auth.updateUser({ password });
}

/**
 * 🚨 IMPORTANT
 * Signup sırasında profiles'a dokunmak AUTH'u bozar.
 * Bu fonksiyon artık DB'ye bakmaz.
 *
 * Supabase Auth zaten:
 * - user varsa → login
 * - yoksa → signup
 * davranışını yönetir.
 */
export async function checkUserExists(_email: string) {
  // ❌ profiles sorgusu KALDIRILDI
  return { exists: false, user: null };
}
