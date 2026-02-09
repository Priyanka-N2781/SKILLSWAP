import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Mail, Phone, Book, GraduationCap } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 md:p-0 min-h-screen">
      <div className="pt-10 md:pt-0 mb-8">
        <h1 className="text-2xl font-display font-bold mb-6">Profile</h1>
        
        <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-primary/80 to-secondary/80" />
          <CardContent className="pt-0 relative px-6 pb-6">
            <div className="absolute -top-12 left-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={user.profilePicture || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="mt-14">
              <h2 className="text-2xl font-bold font-display">{user.name}</h2>
              <div className="flex items-center text-muted-foreground mt-1 text-sm">
                <GraduationCap className="w-4 h-4 mr-1" />
                {user.department}, Year {user.year}
              </div>
            </div>

            <div className="mt-6 space-y-3">
               <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                 <div className="bg-background p-2 rounded-lg text-primary">
                    <Mail className="w-4 h-4" />
                 </div>
                 <div className="text-sm">
                   <p className="text-muted-foreground text-xs">Email</p>
                   <p className="font-medium">{user.email}</p>
                 </div>
               </div>

               <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                 <div className="bg-background p-2 rounded-lg text-primary">
                    <Phone className="w-4 h-4" />
                 </div>
                 <div className="text-sm">
                   <p className="text-muted-foreground text-xs">Phone</p>
                   <p className="font-medium">{user.phone}</p>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
           <h3 className="font-bold text-lg px-2">Account Settings</h3>
           <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-left font-normal" disabled>
              Edit Profile (Coming Soon)
           </Button>
           <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-left font-normal" disabled>
              Privacy Settings
           </Button>
           
           <Button 
            variant="destructive" 
            className="w-full h-12 rounded-xl mt-8 shadow-lg shadow-destructive/20"
            onClick={() => logout.mutate()}
          >
             <LogOut className="w-4 h-4 mr-2" /> Log Out
           </Button>
        </div>
      </div>
    </div>
  );
}
