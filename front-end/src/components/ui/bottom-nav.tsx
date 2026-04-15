import { Link, useLocation } from "wouter";
import { Home, BookOpen, Repeat, User } from "lucide-react";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/home", icon: Home, label: "Explore" },
    { href: "/my-skills", icon: BookOpen, label: "My Skills" },
    { href: "/requests", icon: Repeat, label: "Swaps" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom pb-2 pt-2 md:hidden">
      <div className="flex justify-around items-center h-14">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex-1">
              <div className="flex flex-col items-center justify-center h-full space-y-1 cursor-pointer group">
                <div className="relative">
                  <link.icon 
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
