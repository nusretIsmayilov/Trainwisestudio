import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCoachProfile = () => {
  const [open, setOpen] = useState(false);
  const [coachData, setCoachData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const openCoach = async (authorId?: string) => {
    if (!authorId) return;

    setOpen(true);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, bio, avatar_url, skills, certifications, socials"
        )
        .eq("id", authorId)
        .eq("role", "coach")
        .single();

      if (error) {
        console.error("Coach fetch error:", error);
        return;
      }

      setCoachData(data);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeCoach = () => {
    setOpen(false);
    setCoachData(null);
  };

  return {
    open,
    loading,
    coachData,
    openCoach,
    closeCoach,
    setOpen,
  };
};
