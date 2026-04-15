import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@api";
import { type InsertSwapRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSwaps() {
  return useQuery({
    queryKey: [api.swaps.list.path],
    queryFn: async () => {
      const res = await fetch(api.swaps.list.path);
      if (!res.ok) throw new Error("Failed to fetch swaps");
      return api.swaps.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSwap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertSwapRequest, "requesterId" | "status">) => {
      const res = await fetch(api.swaps.create.path, {
        method: api.swaps.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to request swap");
      return api.swaps.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.swaps.list.path] });
      toast({ title: "Request Sent", description: "The user has been notified." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not send request.", variant: "destructive" });
    },
  });
}

export function useUpdateSwapStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "accepted" | "rejected" }) => {
      const url = buildUrl(api.swaps.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.swaps.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.swaps.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.swaps.list.path] });
      toast({ 
        title: `Request ${data.status === 'accepted' ? 'Accepted' : 'Rejected'}`, 
        description: data.status === 'accepted' ? "You can now chat with them!" : "Request rejected." 
      });
    },
  });
}
