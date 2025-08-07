import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription to project updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes on the projects table for this user
    const channel = supabase
      .channel('projects-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time project update received:', payload);
          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({
            queryKey: ["projects", user.id],
          });
        }
      )
      .subscribe();

    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async (): Promise<Project[]> => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }

      return data || [];
    },
    // Only run the query if we have a user
    enabled: !!user,
    // Keep the data fresh
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: Omit<ProjectInsert, 'user_id'>): Promise<Project> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...projectData,
          user_id: user.id,
          status: "draft",
          video_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
      toast.success("Проект успешно создан");
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      toast.error("Ошибка при создании проекта");
    },
  });
};

export const useUpdateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate & { id: string }): Promise<Project> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("projects")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id) // Ensure user can only update their own projects
        .select()
        .single();

      if (error) {
        console.error("Error updating project:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
      toast.success("Проект успешно обновлен");
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
      toast.error("Ошибка при обновлении проекта");
    },
  });
};

export const useDeleteProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", user.id); // Ensure user can only delete their own projects

      if (error) {
        console.error("Error deleting project:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
      toast.success("Проект успешно удален");
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      toast.error("Ошибка при удалении проекта");
    },
  });
};

export const useProject = (projectId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async (): Promise<Project | null> => {
      if (!user || !projectId) {
        return null;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id) // Ensure user can only access their own projects
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error("Error fetching project:", error);
        throw error;
      }

      return data;
    },
    // Only run the query if we have a user and projectId
    enabled: !!user && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Export types for use in components
export type { Project, ProjectInsert, ProjectUpdate, ProjectStatus };
