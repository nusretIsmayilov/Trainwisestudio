import { supabase } from "./client";
import { config } from "@/lib/config";
import { FORCE_PRODUCTION_URLS, logUrlUsage } from "@/lib/force-urls";

export async function sendMagicLink(email: string) {
  // 🔒 SADECE BU SATIR EKLENDİ
  const baseUrl = config.appUrl.replace(/\/+$/, "");

  const redirectUrl = import.meta.env.PROD
    ? FORCE_PRODUCTION_URLS.MAGIC_LINK
    : `${baseUrl}/onboarding/step-0`;

  logUrlUsage("Magic Link", redirectUrl);

  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile?.role) {
    return { error: new Error("User role not found") };
  }

  return {
    user: data.user,
    role: profile.role,
  };
}

export async function sendPasswordResetLink(email: string) {
  const baseUrl = config.appUrl.replace(/\/+$/, "");

  const redirectUrl = import.meta.env.PROD
    ? FORCE_PRODUCTION_URLS.PASSWORD_RESET
    : `${baseUrl}/update-password`;

  logUrlUsage("Password Reset", redirectUrl);

  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
}

export async function updateUserPassword(password: string) {
  return await supabase.auth.updateUser({ password });
}

export async function checkUserExists(email: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .single();

    if (error && error.code === "PGRST116") {
      return { exists: false, user: null };
    }

    if (error) {
      throw error;
    }

    return { exists: true, user: data };
  } catch (error) {
    console.error("Error checking user existence:", error);
    return { exists: false, user: null };
  }
}
