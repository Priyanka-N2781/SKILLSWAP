import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // In a real app, we'd fetch a list of "chats" (users you have messages with)
  // For this MVP, we'll fetch all users except the current one to start a chat
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // Need to add this endpoint or just seed data
      return []; 
    }
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: [api.messages.list.path, selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      const res = await fetch(buildUrl(api.messages.list.path, { userId: selectedUser }));
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedUser,
    refetchInterval: 3000, // Poll for new messages every 3s
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.messages.send.path, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedUser, content: message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, selectedUser] });
    },
  });

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] gap-6">
      {/* Users List */}
      <Card className="w-80 hidden md:flex flex-col rounded-3xl border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-display font-bold">Messages</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Seeded users placeholder */}
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chats will appear here after a swap is accepted.
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col rounded-3xl border-border/50 overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <h3 className="font-bold">Chatting...</h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.map((msg: any) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      msg.senderId === user.id 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50 flex gap-2">
              <Input 
                placeholder="Type a message..." 
                className="rounded-xl"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage.mutate()}
              />
              <Button 
                size="icon" 
                className="rounded-xl h-10 w-10 shrink-0"
                onClick={() => sendMessage.mutate()}
                disabled={!message || sendMessage.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display font-bold">Your Conversations</h3>
            <p className="text-muted-foreground max-w-xs">
              Select a user from the sidebar or start a swap to begin messaging.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

import { MessageSquare } from "lucide-react";
