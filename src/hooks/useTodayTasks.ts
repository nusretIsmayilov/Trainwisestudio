import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export const useTodayTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) {
      setLoading(true); // 🔴 KRİTİK
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("program_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("scheduled_date", today)
        .order("order_index", { ascending: true });

      setTasks(data ?? []);
      setLoading(false);
    };

    fetchTasks();
  }, [user, today]);

  const activeTask =
    tasks.find((t) => t.status !== "completed") ?? null;

  const completeTask = async (taskId: string) => {
    const now = new Date().toISOString();

    await supabase
      .from("program_tasks")
      .update({
        status: "completed",
        completed_at: now,
      })
      .eq("id", taskId);

    // reload yok → state update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: "completed", completed_at: now }
          : t
      )
    );
  };

  return {
    tasks,
    activeTask,
    loading,
    completeTask,
  };
};
