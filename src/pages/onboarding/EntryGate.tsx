// src/pages/EntryGate.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function EntryGate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const decide = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      // 👇 KRİTİK KARAR AĞACI
      if (!profile.role) {
        navigate("/select-role", { replace: true });
      } else if (profile.role === "customer") {
        navigate("/onboarding/step-1", { replace: true });
      } else if (profile.role === "coach") {
        navigate("/coach/onboarding", { replace: true });
      }
    };

    decide();
  }, [user, navigate]);

  return null; // ya da loading spinner
}
