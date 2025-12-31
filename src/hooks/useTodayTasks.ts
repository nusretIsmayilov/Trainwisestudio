import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export const useTodayTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;


    const fetchTasks = async () => {
      setLoading(true);

      const today = format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("program_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("scheduled_date", today);

      if (!error) {
        setTasks(data ?? []);
      }

      setLoading(false);
    };
    

    fetchTasks();
  }, [user]);

  return { tasks, loading };
};
