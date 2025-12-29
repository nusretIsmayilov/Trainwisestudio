import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTaskHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("program_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("completed_at", { ascending: false });

      if (!error) {
        setHistory(data ?? []);
      }

      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  return { history, loading };
};
