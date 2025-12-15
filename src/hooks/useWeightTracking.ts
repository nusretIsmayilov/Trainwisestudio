import { useState, useEffect, useCallback } from "react"; // ✅ useCallback eklendi
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRefresh } from "@/contexts/RefreshContext";
import { useTableMutations } from "./useMutationQueue";
import { queryKeys } from "@/lib/query-config";

export interface WeightEntry {
  id: string;
  weight_kg: number;
  date: string;
  notes?: string;
  created_at: string;
}

export const useWeightTracking = () => {
  const { user } = useAuth();
  const { refreshAll } = useRefresh();
  const {
    insert: queueInsert,
    update: queueUpdate,
    upsert: queueUpsert,
    isOnline,
  } = useTableMutations("weight_entries");

  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weight entries"
      );
    } finally {
      setLoading(false);
    }
  };

  const addWeightEntry = async (weight: number, notes?: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const today = new Date().toISOString().split("T")[0];

      try {
        await queueUpsert(
          {
            user_id: user.id,
            weight_kg: weight,
            date: today,
            notes: notes || null,
          },
          "user_id,date",
          {
            invalidateQueries: [queryKeys.profile(user.id)],
          }
        );

        const optimisticData = {
          id: `temp_${Date.now()}`,
          user_id: user.id,
          weight_kg: weight,
          date: today,
          notes: notes || null,
          created_at: new Date().toISOString(),
        } as WeightEntry;

        setEntries((prev) => {
          const filtered = prev.filter((e) => e.date !== today);
          return [optimisticData, ...filtered];
        });

        if (isOnline) {
          await refreshAll();
        }

        return optimisticData;
      } catch (queueError) {
        console.warn(
          "Queue failed, falling back to direct operation:",
          queueError
        );

        const { data: existingEntry } = await supabase
          .from("weight_entries")
          .select("id")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();

        let data;
        if (existingEntry) {
          const { data: updatedData, error } = await supabase
            .from("weight_entries")
            .update({
              weight_kg: weight,
              notes,
            })
            .eq("id", existingEntry.id)
            .select()
            .single();

          if (error) throw error;
          data = updatedData;
        } else {
          const { data: newData, error } = await supabase
            .from("weight_entries")
            .insert({
              user_id: user.id,
              weight_kg: weight,
              date: today,
              notes,
            })
            .select()
            .single();

          if (error) throw error;
          data = newData;
        }

        setEntries((prev) => {
          const filtered = prev.filter((e) => e.date !== today);
          return [data, ...filtered];
        });

        await refreshAll();
        return data;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add weight entry"
      );
      throw err;
    }
  };

  const getLatestWeight = () => {
    return entries.length > 0 ? entries[0].weight_kg : null;
  };

  // ✅ FIX: stabilize function
  const getWeightTrend = useCallback(() => {
    console.log("getWeightTrend called with entries:", entries.length, entries);

    if (entries.length < 2) {
      return 0;
    }

    const latest = entries[0].weight_kg;
    const previous = entries[1].weight_kg;
    return latest - previous;
  }, [entries]);

  const getWeightHistory = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return entries
      .filter((entry) => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  return {
    entries,
    loading,
    error,
    addWeightEntry,
    getLatestWeight,
    getWeightTrend,
    getWeightHistory,
    refetch: fetchEntries,
  };
};
