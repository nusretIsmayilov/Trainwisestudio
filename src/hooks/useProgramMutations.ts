import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRefresh } from "@/contexts/RefreshContext";
import { Program, ProgramStatus, ProgramCategory } from "@/types/program";
import { toast } from "sonner";
import { supabase as sb } from "@/integrations/supabase/client";
import { useTableMutations } from "./useMutationQueue";
import { queryKeys } from "@/lib/query-config";

interface CreateProgramData {
  name: string;
  description: string;
  category: ProgramCategory;
  status?: ProgramStatus;

  // ✅ YENİ EKLENENLER
  muscleGroups?: string[] | null;
  equipment?: string[] | null;
  benefits?: string | null;
  allergies?: string | null;

  assignedTo?: string | null;
  scheduledDate?: string;
  plan?: any;
}

interface UpdateProgramData extends CreateProgramData {
  id: string;
}

export const useProgramMutations = () => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { refreshAll } = useRefresh();
  const {
    insert: queueInsert,
    update: queueUpdate,
    remove: queueDelete,
  } = useTableMutations("programs");
  const { insert: queueMessageInsert } = useTableMutations("messages");
  const { insert: queueConversationInsert } =
    useTableMutations("conversations");

  const createProgram = async (
    data: CreateProgramData
  ): Promise<Program | null> => {
    if (!profile?.id) {
      toast.error("You must be logged in to create programs");
      return null;
    }

    try {
      setLoading(true);
      // If assigning to a customer, verify active contract exists
      if (data.assignedTo) {
        const { data: contractCheck, error: contractErr } = await supabase
          .from("contracts")
          .select("id")
          .eq("coach_id", profile.id)
          .eq("customer_id", data.assignedTo)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();
        if (contractErr) {
          console.error("Contract check failed:", contractErr);
          toast.error("Could not verify contract. Try again.");
          return null;
        }
        if (!contractCheck) {
          toast.error(
            "You can only assign programs to customers with an active contract."
          );
          return null;
        }
      }
      // Use mutation queue for offline support and scalability
      try {
        await queueInsert(
          {
            name: data.name,
            description: data.description,
            category: data.category,
            status: data.status || "draft",
            coach_id: profile.id,
            assigned_to: data.assignedTo || null,
            scheduled_date: data.scheduledDate || null,
            plan: data.plan || null,
            muscle_groups: data.muscleGroups ?? null,
            equipment: data.equipment ?? null,
            benefits: data.benefits ?? null,
            allergies: data.allergies ?? null,
          },
          {
            invalidateQueries: [
              queryKeys.programs(),
              queryKeys.coachPrograms(profile.id),
            ],
          }
        );

        // Return optimistic data
        const optimisticResult = {
          id: `temp_${Date.now()}`,
          name: data.name,
          description: data.description,
          category: data.category,
          status: data.status || "draft",
          coach_id: profile.id,
          assigned_to: data.assignedTo || null,
          scheduled_date: data.scheduledDate || null,
          plan: data.plan || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // If assigned to a client, queue system message notifying assignment
        if (optimisticResult.assigned_to) {
          try {
            // Find or create conversation (still need to check if exists)
            const { data: convo } = await sb
              .from("conversations")
              .select("id")
              .eq("coach_id", profile.id)
              .eq("customer_id", optimisticResult.assigned_to)
              .maybeSingle();

            let conversationId = convo?.id;
            if (!conversationId) {
              // Queue conversation creation
              await queueConversationInsert(
                {
                  coach_id: profile.id,
                  customer_id: optimisticResult.assigned_to,
                },
                {
                  invalidateQueries: [
                    queryKeys.conversations(optimisticResult.assigned_to),
                  ],
                }
              );
              // For optimistic return, generate temp ID
              conversationId = `temp_convo_${Date.now()}`;
            }

            if (conversationId) {
              // Queue message creation
              await queueMessageInsert(
                {
                  conversation_id: conversationId,
                  sender_id: profile.id,
                  content: `A new program "${data.name}" has been assigned to you.`,
                  type: "system",
                },
                {
                  invalidateQueries: [queryKeys.messages(conversationId)],
                }
              );
            }
          } catch (msgError) {
            console.warn(
              "Failed to queue message for program assignment:",
              msgError
            );
          }
        }

        toast.success("Program created successfully!");
        await refreshAll();

        // Transform the optimistic result to match our Program interface
        return {
          id: optimisticResult.id,
          name: optimisticResult.name,
          description: optimisticResult.description,
          status: optimisticResult.status as ProgramStatus,
          category: optimisticResult.category as ProgramCategory,
          createdAt: optimisticResult.created_at,
          updatedAt: optimisticResult.updated_at,
          assignedTo: optimisticResult.assigned_to,
          scheduledDate: optimisticResult.scheduled_date || undefined,
          plan: optimisticResult.plan || undefined,
        };
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn(
          "Queue failed, falling back to direct insert:",
          queueError
        );
        const { data: result, error } = await supabase
          .from("programs")
          .insert({
            name: data.name,
            description: data.description,
            category: data.category,
            status: data.status || "draft",
            coach_id: profile.id,
            assigned_to: data.assignedTo || null,
            scheduled_date: data.scheduledDate || null,
            plan: data.plan || null,
            muscle_groups: data.muscleGroups ?? null,
            equipment: data.equipment ?? null,
            benefits: data.benefits ?? null,
            allergies: data.allergies ?? null,
          })
          .select()
          .single();

        if (error) throw error;

        // If assigned to a client, send a system message notifying assignment
        if (result?.assigned_to) {
          try {
            // Find or create conversation
            const { data: convo } = await sb
              .from("conversations")
              .select("id")
              .eq("coach_id", profile.id)
              .eq("customer_id", result.assigned_to)
              .maybeSingle();
            let conversationId = convo?.id;
            if (!conversationId) {
              const { data: newConvo } = await sb
                .from("conversations")
                .insert({
                  coach_id: profile.id,
                  customer_id: result.assigned_to,
                })
                .select("id")
                .single();
              conversationId = newConvo?.id;
            }
            if (conversationId) {
              await sb.from("messages").insert({
                conversation_id: conversationId,
                sender_id: profile.id,
                content: `A new program "${result.name}" has been assigned to you.`,
                type: "system",
              });
            }
          } catch {}
        }

        toast.success("Program created successfully!");
        await refreshAll();

        // Transform the result to match our Program interface
        return {
          id: result.id,
          name: result.name,
          description: result.description,
          status: result.status as ProgramStatus,
          category: result.category as ProgramCategory,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
          assignedTo: result.assigned_to,
          scheduledDate: result.scheduled_date || undefined,
          plan: result.plan || undefined,
        };
      }
    } catch (err) {
      console.error("Error creating program:", err);
      toast.error("Failed to create program");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProgram = async (
    data: UpdateProgramData
  ): Promise<Program | null> => {
    if (!profile?.id) {
      toast.error("You must be logged in to update programs");
      return null;
    }

    try {
      setLoading(true);
      // If changing assignment, verify active contract exists
      if (data.assignedTo) {
        const { data: contractCheck, error: contractErr } = await supabase
          .from("contracts")
          .select("id")
          .eq("coach_id", profile.id)
          .eq("customer_id", data.assignedTo)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();
        if (contractErr) {
          console.error("Contract check failed:", contractErr);
          toast.error("Could not verify contract. Try again.");
          return null;
        }
        if (!contractCheck) {
          toast.error(
            "You can only assign programs to customers with an active contract."
          );
          return null;
        }
      }
      // Use mutation queue for offline support and scalability
      try {
        await queueUpdate(
          {
            name: data.name,
            description: data.description,
            category: data.category,
            status: data.status || "draft",
            assigned_to: data.assignedTo || null,
            scheduled_date: data.scheduledDate || null,
            plan: data.plan || null,
            muscle_groups: data.muscleGroups ?? null,
            equipment: data.equipment ?? null,
            benefits: data.benefits ?? null,
            allergies: data.allergies ?? null,
          },
          { id: data.id, coach_id: profile.id },
          {
            invalidateQueries: [
              queryKeys.program(data.id),
              queryKeys.programs(),
              queryKeys.coachPrograms(profile.id),
            ],
          }
        );

        toast.success("Program updated successfully!");
        await refreshAll();

        // Return optimistic data
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status || "draft",
          category: data.category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: data.assignedTo || undefined,
          scheduledDate: data.scheduledDate || undefined,
          plan: data.plan || undefined,
        };
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn(
          "Queue failed, falling back to direct update:",
          queueError
        );
        const { data: result, error } = await supabase
          .from("programs")
          .update({
            name: data.name,
            description: data.description,
            category: data.category,
            status: data.status || "draft",
            assigned_to: data.assignedTo || null,
            scheduled_date: data.scheduledDate || null,
            plan: data.plan || null,
            muscle_groups: data.muscleGroups ?? null,
            equipment: data.equipment ?? null,
            benefits: data.benefits ?? null,
            allergies: data.allergies ?? null,
          })
          .eq("id", data.id)
          .eq("coach_id", profile.id)
          .select()
          .single();

        if (error) throw error;

        toast.success("Program updated successfully!");
        await refreshAll();

        return {
          id: result.id,
          name: result.name,
          description: result.description,
          status: result.status as ProgramStatus,
          category: result.category as ProgramCategory,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
          assignedTo: result.assigned_to,
          scheduledDate: result.scheduled_date || undefined,
          plan: result.plan || undefined,
        };
      }
    } catch (err) {
      console.error("Error updating program:", err);
      toast.error("Failed to update program");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProgram = async (id: string): Promise<boolean> => {
    if (!profile?.id) {
      toast.error("You must be logged in to delete programs");
      return false;
    }

    try {
      setLoading(true);

      // Use mutation queue for offline support and scalability
      try {
        await queueDelete(
          { id, coach_id: profile.id },
          {
            invalidateQueries: [
              queryKeys.program(id),
              queryKeys.programs(),
              queryKeys.coachPrograms(profile.id),
            ],
          }
        );

        toast.success("Program deleted successfully!");
        return true;
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn(
          "Queue failed, falling back to direct delete:",
          queueError
        );
        const { error } = await supabase
          .from("programs")
          .delete()
          .eq("id", id)
          .eq("coach_id", profile.id);

        if (error) throw error;

        toast.success("Program deleted successfully!");
        return true;
      }
    } catch (err) {
      console.error("Error deleting program:", err);
      toast.error("Failed to delete program");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProgramById = async (id: string): Promise<Program | null> => {
    if (!profile?.id) return null;

    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", id)
        .eq("coach_id", profile.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status as ProgramStatus,
        category: data.category as ProgramCategory,

        // 🔥 EKSİK OLANLAR
        muscleGroups: data.muscle_groups,
        equipment: data.equipment,
        benefits: data.benefits,
        allergies: data.allergies,

        assignedTo: data.assigned_to,
        scheduledDate: data.scheduled_date
          ? data.scheduled_date.split("T")[0]
          : null,

        plan: data.plan || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error("Error fetching program:", err);
      return null;
    }
  };

  return {
    createProgram,
    updateProgram,
    deleteProgram,
    getProgramById,
    loading,
  };
};
