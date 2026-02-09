import { BottomNav } from "@/components/ui/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { GraduationCap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  // Don't show layout on auth pages
  if (!user || location === "/auth") return <>{children}</>;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 md:pl-64">
      {/* Desktop Sidebar (Placeholder logic) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-card px-6 py-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-primary/10 rounded-xl">
             <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-display font-bold">SkillSwap</span>
        </div>
        {/* Reuse BottomNav logic ideally or map links here */}
        <nav className="space-y-2">
            {/* Desktop Nav Items */}
            <div className="text-muted-foreground text-sm">Navigation handled by mobile bottom bar for this demo</div>
        </nav>
      </aside>

      <main className="max-w-3xl mx-auto md:px-8 md:py-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
