import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LibraryCategory } from "@/mockdata/library/mockLibrary";
import { useTableMutations } from "./useMutationQueue";
import { queryKeys } from "@/lib/query-config";

export interface LibraryRow {
  id: string;
  coach_id: string;
  category: LibraryCategory;
  name: string;
  introduction: string | null;
  hero_image_url: string | null;
  details: any;
  created_at: string;
  updated_at: string;
}

export const useCoachLibrary = () => {
  const { user } = useAuth();
  const {
    insert: queueInsert,
    update: queueUpdate,
    remove: queueDelete,
  } = useTableMutations("library_items");
  const [items, setItems] = useState<LibraryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .eq("coach_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setItems((data || []) as LibraryRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const upsertItem = async (payload: Partial<LibraryRow> & { id?: string }) => {
    if (!user) throw new Error("Not authenticated");

    console.log("upsertItem çağrıldı – gelen payload:", payload);

    // details objesini category'ye göre oluşturuyoruz
    let details: Record<string, any> = {};

    if (payload.category === "exercise") {
      details = {
        muscleGroup: payload.muscleGroup || "",
        howTo: payload.howTo || [], // adımlar + medya array'i
        proTip: payload.proTip || "",
        whatToAvoid: payload.whatToAvoid || "",
      };
    } else if (payload.category === "recipe") {
      details = {
        allergies: payload.allergies || "",
        ingredients: payload.ingredients || [],
        stepByStep: payload.stepByStep || [],
        proTip: payload.proTip || "",
      };
    } else if (payload.category === "mental health") {
      details = {
        content: payload.content || [],
        proTip: payload.proTip || "",
      };
    }

    console.log("Oluşturulan details:", details);

    // Son payload'ı oluştur
    const finalPayload = {
      coach_id: user.id,
      category: payload.category as LibraryCategory,
      name: payload.name!,
      introduction: payload.introduction ?? null,
      hero_image_url:
        payload.hero_image_url ?? (payload as any).heroImageUrl ?? null,
      details,
    };

    try {
      if (payload.id) {
        // Update
        await queueUpdate(
          finalPayload,
          { id: payload.id, coach_id: user.id },
          { invalidateQueries: [queryKeys.coachLibrary(user.id)] },
        );
      } else {
        // Insert
        await queueInsert(finalPayload, {
          invalidateQueries: [queryKeys.coachLibrary(user.id)],
        });
      }

      await fetchItems();
      console.log("Upsert başarılı – kaydedilen veri:", finalPayload);
      return finalPayload;
    } catch (queueError) {
      console.warn(
        "Queue failed, falling back to direct operation:",
        queueError,
      );

      // Fallback direct operation
      try {
        if (payload.id) {
          const { data, error } = await supabase
            .from("library_items")
            .update(finalPayload)
            .eq("id", payload.id)
            .eq("coach_id", user.id)
            .select("*")
            .single();
          if (error) throw error;
          await fetchItems();
          return data as LibraryRow;
        } else {
          const { data, error } = await supabase
            .from("library_items")
            .insert(finalPayload)
            .select("*")
            .single();
          if (error) throw error;
          await fetchItems();
          return data as LibraryRow;
        }
      } catch (directError) {
        console.error("Direct operation HATASI:", directError);
        throw directError;
      }
    }
  };

  const removeItem = async (id: string) => {
    if (!user) throw new Error("Not authenticated");

    try {
      await queueDelete(
        { id, coach_id: user.id },
        { invalidateQueries: [queryKeys.coachLibrary(user.id)] },
      );
      await fetchItems();
      return true;
    } catch (queueError) {
      console.warn("Queue failed, falling back to direct delete:", queueError);
      const { error } = await supabase
        .from("library_items")
        .delete()
        .eq("id", id)
        .eq("coach_id", user.id);
      if (error) throw error;
      await fetchItems();
      return true;
    }
  };

  return { items, loading, error, refetch: fetchItems, upsertItem, removeItem };
};
