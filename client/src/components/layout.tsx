import { BottomNav } from "@/components/ui/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { GraduationCap, Home, BookOpen, Repeat, User, MessageSquare, LogOut, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user || location === "/auth") return <>{children}</>;

  const navLinks = [
    { href: "/home", icon: Home, label: "Dashboard" },
    { href: "/my-skills", icon: BookOpen, label: "My Skills" },
    { href: "/requests", icon: Repeat, label: "Requests" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-card px-4 py-8">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-primary/10 rounded-xl">
             <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-display font-bold">SkillSwap</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout.mutate()}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search skills, users..." 
              className="pl-10 h-10 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            </Button>
            
            <Link href="/profile">
              <div className="flex items-center gap-3 cursor-pointer pl-2 border-l border-border/50">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={user.profilePicture || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold leading-tight">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.department}</p>
                </div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
