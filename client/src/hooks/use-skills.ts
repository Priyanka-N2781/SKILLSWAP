import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSkill } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSkills(filters?: { type?: 'teach' | 'learn', category?: string, search?: string }) {
  const queryKey = [api.skills.list.path, filters?.type, filters?.category, filters?.search];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string manually since filters are optional
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.category && filters.category !== "All") params.append("category", filters.category);
      if (filters?.search) params.append("search", filters.search);
      
      const url = `${api.skills.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch skills");
      return api.skills.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertSkill, "userId">) => {
      const res = await fetch(api.skills.create.path, {
        method: api.skills.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create skill");
      return api.skills.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skills.list.path] });
      toast({ title: "Skill Added", description: "Your skill has been listed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not add skill.", variant: "destructive" });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.skills.delete.path, { id });
      const res = await fetch(url, { method: api.skills.delete.method });
      if (!res.ok) throw new Error("Failed to delete skill");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skills.list.path] });
      toast({ title: "Skill Removed", description: "The skill was deleted successfully." });
    },
  });
}
