import { useState } from "react";
import { useSwaps, useUpdateSwapStatus } from "@/hooks/use-swaps";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, MessageSquare, Video, ExternalLink, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RequestsPage() {
  const { user } = useAuth();
  const { data: swaps, isLoading } = useSwaps();
  const updateStatus = useUpdateSwapStatus();
  
  // State for accept dialog
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<any>(null);
  const [meetCode, setMeetCode] = useState("");
  const [meetType, setMeetType] = useState<"googlemeet" | "zoom">("googlemeet");
  const [meetTime, setMeetTime] = useState("");

  if (!user) return null;

  const incoming = swaps?.filter(s => s.receiverId === user.id) || [];
  const outgoing = swaps?.filter(s => s.requesterId === user.id) || [];

  const handleAcceptClick = (swap: any) => {
    setSelectedSwap(swap);
    setMeetCode("");
    setMeetType("googlemeet");
    setMeetTime("");
    setAcceptDialogOpen(true);
  };

  const handleConfirmAccept = () => {
    if (!selectedSwap || !meetCode || !meetTime) return;
    
    // Generate full meeting URL if just code provided
    let fullMeetCode = meetCode.trim();
    if (meetType === "googlemeet" && !fullMeetCode.includes("meet.google.com")) {
      fullMeetCode = `https://meet.google.com/${fullMeetCode.replace(/\s+/g, '-')}`;
    } else if (meetType === "zoom" && !fullMeetCode.includes("zoom.us")) {
      fullMeetCode = `https://zoom.us/j/${fullMeetCode.replace(/\s+/g, '')}`;
    }
    
    updateStatus.mutate(
      { 
        id: selectedSwap.id, 
        status: "accepted", 
        meetCode: fullMeetCode,
        meetType,
        meetTime 
      },
      {
        onSuccess: () => {
          setAcceptDialogOpen(false);
          setSelectedSwap(null);
          const landingUrl = meetType === 'googlemeet' ? 'https://meet.google.com/landing' : 'https://zoom.us/join';
          window.open(landingUrl, '_blank');
        }
      }
    );
  };

  const openMeetingLink = (meetCode: string) => {
    // If it's a zoom link or code, go to zoom join
    if (meetCode.includes('zoom.us') || (!meetCode.includes('meet.google.com') && !meetCode.includes('-'))) {
      window.open('https://zoom.us/join', '_blank');
    } else {
      // Default to Google Meet landing
      window.open('https://meet.google.com/landing', '_blank');
    }
  };

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
                   <p className="text-sm font-medium text-primary mb-1">{swap.skill?.title || "Deleted Skill"}</p>
                   <p className="text-sm italic text-muted-foreground">"{swap.message}"</p>
                 </div>

                 {swap.status === 'pending' && (
                   <div className="flex gap-2">
                     <Button 
                      className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleAcceptClick(swap)}
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

                 {swap.status === 'accepted' && swap.meetCode && (
                   <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mt-4 space-y-3">
                     <div className="flex items-center gap-2">
                       <Video className="w-4 h-4 text-green-600" />
                       <span className="text-sm font-medium text-green-700 dark:text-green-400">
                         Meeting Scheduled
                       </span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       {swap.meetType === 'googlemeet' ? 'Google Meet' : 'Zoom'} link to join the session
                     </p>
                     <div className="flex items-center gap-2">
                       <Button 
                         variant="secondary" 
                         className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                         onClick={() => openMeetingLink(swap.meetCode!)}
                       >
                         <ExternalLink className="w-4 h-4 mr-2" /> Join
                       </Button>
                       {swap.skill?.type === 'teach' && (
                         <Button 
                           variant="outline" 
                           onClick={() => updateStatus.mutate({ id: swap.id, status: 'completed' })}
                           disabled={updateStatus.isPending}
                           className="flex-1 rounded-xl border-green-200 text-green-700 hover:bg-green-100"
                         >
                           End Swap
                         </Button>
                       )}
                     </div>
                   </div>
                 )}
                 
                 {swap.status === 'accepted' && !swap.meetCode && swap.skill?.type === 'teach' && (
                   <Button 
                     variant="outline" 
                     className="w-full rounded-xl mt-4 border-green-200 text-green-700 hover:bg-green-100"
                     onClick={() => updateStatus.mutate({ id: swap.id, status: 'completed' })}
                     disabled={updateStatus.isPending}
                   >
                     End Swap
                   </Button>
                 )}

                 {swap.status === 'completed' && swap.skill?.type === 'teach' && (
                   <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center text-sm text-blue-700 dark:text-blue-400 font-medium">
                     Swap Completed
                   </div>
                 )}

                 {swap.status === 'completed' && swap.skill?.type === 'learn' && (
                   <Button 
                     className="w-full rounded-xl mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                     onClick={() => alert("Rating system coming soon!")}
                   >
                     <Star className="w-4 h-4 mr-2" /> Rate Swap
                   </Button>
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
                  <h3 className="font-bold text-lg mb-1">{swap.skill?.title || "Deleted Skill"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{new Date(swap.createdAt!).toLocaleDateString()}</p>
                  
                  {swap.status === 'accepted' && swap.meetCode && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Meeting Scheduled
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {swap.meetType === 'googlemeet' ? 'Google Meet' : 'Zoom'} link to join the session
                      </p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="secondary" 
                          className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => openMeetingLink(swap.meetCode!)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" /> Join
                        </Button>
                        {swap.skill?.type === 'learn' && (
                          <Button 
                            variant="outline" 
                            onClick={() => updateStatus.mutate({ id: swap.id, status: 'completed' })}
                            disabled={updateStatus.isPending}
                            className="flex-1 rounded-xl border-green-200 text-green-700 hover:bg-green-100"
                          >
                            End Swap
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {swap.status === 'accepted' && !swap.meetCode && swap.skill?.type === 'learn' && (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => updateStatus.mutate({ id: swap.id, status: 'completed' })}
                      disabled={updateStatus.isPending}
                    >
                      End Swap
                    </Button>
                  )}

                  {swap.status === 'completed' && swap.skill?.type === 'learn' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center text-sm text-blue-700 dark:text-blue-400 font-medium">
                      Swap Completed
                    </div>
                  )}

                  {swap.status === 'completed' && swap.skill?.type === 'teach' && (
                    <Button 
                      className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => alert("Rating system coming soon!")}
                    >
                      <Star className="w-4 h-4 mr-2" /> Rate Swap
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
         </TabsContent>
       </Tabs>

       {/* Accept Dialog with Meeting Code */}
       <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
         <DialogContent className="rounded-3xl sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="text-xl font-display">Accept & Schedule Meeting</DialogTitle>
             <DialogDescription>
               To accept this swap request, please provide a meeting link for the session.
             </DialogDescription>
           </DialogHeader>
           
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Meeting Platform</Label>
               <Select value={meetType} onValueChange={(v: "googlemeet" | "zoom") => setMeetType(v)}>
                 <SelectTrigger className="rounded-xl">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="googlemeet">Google Meet</SelectItem>
                   <SelectItem value="zoom">Zoom</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <Label>
                 {meetType === 'googlemeet' ? 'Google Meet Code' : 'Zoom Meeting ID'}
               </Label>
               <Input 
                 placeholder={meetType === 'googlemeet' ? 'e.g., abc-defg-hij' : 'e.g., 123 456 7890'}
                 value={meetCode}
                 onChange={(e) => setMeetCode(e.target.value)}
                 className="rounded-xl"
               />
               <p className="text-xs text-muted-foreground">
                 {meetType === 'googlemeet' 
                   ? 'Enter the meeting code (not the full URL)' 
                   : 'Enter the Zoom meeting ID'}
               </p>
             </div>
             <div className="space-y-2">
               <Label>Meeting Time</Label>
               <Input 
                 type="time"
                 value={meetTime}
                 onChange={(e) => setMeetTime(e.target.value)}
                 className="rounded-xl"
               />
             </div>
           </div>

           <DialogFooter>
             <Button variant="ghost" onClick={() => setAcceptDialogOpen(false)} className="rounded-xl">
               Cancel
             </Button>
             <Button 
               onClick={handleConfirmAccept} 
               disabled={!meetCode || !meetTime || updateStatus.isPending}
               className="rounded-xl"
             >
               {updateStatus.isPending ? "Accepting..." : "Accept & Send Link"}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  
  const icons = {
    pending: Clock,
    accepted: Check,
    rejected: X,
    completed: Check,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status as keyof typeof styles] || styles.pending}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
