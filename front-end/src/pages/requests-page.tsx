import { useSwaps, useUpdateSwapStatus } from "@/hooks/use-swaps";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, MessageSquare } from "lucide-react";

export default function RequestsPage() {
  const { user } = useAuth();
  const { data: swaps, isLoading } = useSwaps();
  const updateStatus = useUpdateSwapStatus();

  if (!user) return null;

  const incoming = swaps?.filter(s => s.receiverId === user.id) || [];
  const outgoing = swaps?.filter(s => s.requesterId === user.id) || [];

  return (
    <div className="p-4 md:p-0 min-h-screen">
       <div className="mb-6 pt-10 md:pt-0">
         <h1 className="text-2xl font-display font-bold">Swap Requests</h1>
         <p className="text-sm text-muted-foreground">Manage your skill exchange proposals.</p>
       </div>

       <Tabs defaultValue="incoming" className="w-full">
         <TabsList className="w-full bg-muted/50 rounded-xl p-1 mb-6">
           <TabsTrigger value="incoming" className="rounded-lg w-1/2">Incoming ({incoming.length})</TabsTrigger>
           <TabsTrigger value="outgoing" className="rounded-lg w-1/2">Sent ({outgoing.length})</TabsTrigger>
         </TabsList>

         <TabsContent value="incoming" className="space-y-4">
           {incoming.length === 0 && <p className="text-center text-muted-foreground py-10">No incoming requests.</p>}
           {incoming.map(swap => (
             <Card key={swap.id} className="rounded-2xl border-border/50">
               <CardContent className="p-5">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{swap.requester.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{swap.requester.name}</p>
                        <p className="text-xs text-muted-foreground">wants to swap for</p>
                      </div>
                    </div>
                    <StatusBadge status={swap.status} />
                 </div>
                 
                 <div className="bg-muted/30 p-3 rounded-xl mb-4">
                   <p className="text-sm font-medium text-primary mb-1">{swap.skill.title}</p>
                   <p className="text-sm italic text-muted-foreground">"{swap.message}"</p>
                 </div>

                 {swap.status === 'pending' && (
                   <div className="flex gap-2">
                     <Button 
                      className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => updateStatus.mutate({ id: swap.id, status: 'accepted' })}
                      disabled={updateStatus.isPending}
                     >
                       <Check className="w-4 h-4 mr-2" /> Accept
                     </Button>
                     <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10"
                      onClick={() => updateStatus.mutate({ id: swap.id, status: 'rejected' })}
                      disabled={updateStatus.isPending}
                     >
                       <X className="w-4 h-4 mr-2" /> Reject
                     </Button>
                   </div>
                 )}
               </CardContent>
             </Card>
           ))}
         </TabsContent>

         <TabsContent value="outgoing" className="space-y-4">
            {outgoing.length === 0 && <p className="text-center text-muted-foreground py-10">You haven't sent any requests.</p>}
            {outgoing.map(swap => (
              <Card key={swap.id} className="rounded-2xl border-border/50">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-3">
                     <div className="text-sm">
                       <span className="text-muted-foreground">To: </span>
                       <span className="font-medium">{swap.receiver.name}</span>
                     </div>
                     <StatusBadge status={swap.status} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{swap.skill.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{new Date(swap.createdAt!).toLocaleDateString()}</p>
                  
                  {swap.status === 'accepted' && (
                    <Button variant="secondary" className="w-full rounded-xl">
                      <MessageSquare className="w-4 h-4 mr-2" /> Message
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
         </TabsContent>
       </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  
  const icons = {
    pending: Clock,
    accepted: Check,
    rejected: X,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status as keyof typeof styles] || styles.pending}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
