import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { SplashScreen } from "@/components/ui/splash-screen";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import MySkillsPage from "@/pages/my-skills-page";
import RequestsPage from "@/pages/requests-page";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoadingUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      setLocation("/auth");
    }
  }, [user, isLoadingUser, setLocation]);

  if (isLoadingUser) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!user) return null;

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={() => <ProtectedRoute component={HomePage} />} />
      <Route path="/home" component={() => <ProtectedRoute component={HomePage} />} />
      <Route path="/my-skills" component={() => <ProtectedRoute component={MySkillsPage} />} />
      <Route path="/requests" component={() => <ProtectedRoute component={RequestsPage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SplashScreen isVisible={showSplash} />
        <Toaster />
        <Layout>
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
