import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Mail, Phone, Book, GraduationCap, Edit2, Shield, Settings, Bell, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const { data: skills } = useQuery({
    queryKey: ["/api/skills/me"],
    queryFn: async () => {
      const res = await fetch("/api/skills");
      const allSkills = await res.json();
      return allSkills.filter((s: any) => s.userId === user?.id);
    },
    enabled: !!user
  });

  const { data: swaps } = useQuery({
    queryKey: [api.swaps.list.path],
    enabled: !!user
  });

  if (!user) return null;

  const completedSwaps = swaps?.filter(s => s.status === 'accepted').length || 0;

  return (
    <div className="p-4 md:p-0 min-h-screen max-w-4xl mx-auto">
      <div className="pt-10 md:pt-0 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display font-bold">My Profile</h1>
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <Card className="md:col-span-2 rounded-3xl border-border/50 shadow-sm overflow-hidden h-fit">
            <div className="h-32 bg-gradient-to-r from-primary/80 via-primary to-secondary/80" />
            <CardContent className="pt-0 relative px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-16 mb-6">
                <Avatar className="w-32 h-32 border-4 border-background shadow-2xl shrink-0">
                  <AvatarImage src={user.profilePicture || undefined} />
                  <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 pb-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold font-display">{user.name}</h2>
                      <div className="flex items-center text-muted-foreground mt-1 text-base">
                        <GraduationCap className="w-5 h-5 mr-2 text-primary/70" />
                        {user.department} • Year {user.year}
                      </div>
                    </div>
                    <Badge className="w-fit rounded-full px-4 py-1 bg-primary/10 text-primary border-transparent">
                      Verified Student
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">About Me</h3>
                <p className="text-foreground/80 leading-relaxed">
                  {user.bio || "No bio added yet. Tell other students about your background and what you're looking to swap!"}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/30">
                   <div className="bg-background p-3 rounded-xl text-primary shadow-sm">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div className="min-w-0">
                     <p className="text-muted-foreground text-xs font-medium uppercase tracking-tight">Email</p>
                     <p className="font-semibold truncate">{user.email}</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/30">
                   <div className="bg-background p-3 rounded-xl text-primary shadow-sm">
                      <Phone className="w-5 h-5" />
                   </div>
                   <div className="min-w-0">
                     <p className="text-muted-foreground text-xs font-medium uppercase tracking-tight">Phone</p>
                     <p className="font-semibold truncate">{user.phone}</p>
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Stats & Settings */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-border/50 p-6 bg-primary text-primary-foreground shadow-xl shadow-primary/20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 fill-current" /> Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <p className="text-2xl font-bold">{skills?.length || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-80">Skills</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <p className="text-2xl font-bold">{completedSwaps}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-80">Swaps</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl px-4 hover:bg-muted">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notifications</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl px-4 hover:bg-muted">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Privacy</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl px-4 hover:bg-muted">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Settings</span>
                </Button>
              </CardContent>
            </Card>

            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-2xl shadow-lg shadow-destructive/20 font-bold gap-2"
              onClick={() => logout.mutate()}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* My Skills Preview Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-2xl font-display font-bold">My Skills</h3>
            <Button variant="link" className="text-primary font-bold">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills?.slice(0, 3).map((skill: any) => (
              <Card key={skill.id} className="rounded-2xl border-border/50 p-5 hover:border-primary/50 transition-all group">
                <Badge variant="secondary" className="mb-3 bg-primary/5 text-primary border-transparent">
                  {skill.category}
                </Badge>
                <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">{skill.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
              </Card>
            ))}
            {(!skills || skills.length === 0) && (
              <Card className="col-span-full rounded-2xl border-dashed border-2 border-border/50 p-8 flex flex-col items-center justify-center text-center">
                <Book className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-medium">No skills listed yet.</p>
                <Button variant="link" className="text-primary p-0 h-auto font-bold mt-1">Add your first skill</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
