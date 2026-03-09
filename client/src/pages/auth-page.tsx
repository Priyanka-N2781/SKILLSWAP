import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Login Schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register Schema (extended for UI)
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { login, register, verify, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [showOtp, setShowOtp] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/home");
    }
  }, [user, setLocation]);

  // Login Form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  function onLogin(data: z.infer<typeof loginSchema>) {
    login.mutate(data);
  }

  // Register Form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      year: "1",
      department: "Computer Science",
    },
  });

  function onRegister(data: z.infer<typeof registerSchema>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    register.mutate(registerData, {
      onSuccess: (newUser) => {
        setRegisteredUserId(newUser.id);
        setShowOtp(true);
      },
    });
  }

  // OTP Verify
  function onVerify() {
    if (!registeredUserId) return;
    verify.mutate({ userId: registeredUserId, otp }, {
      onSuccess: () => {
        setShowOtp(false);
        setActiveTab("login"); // Switch to login after verify
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Welcome to SkillSwap
          </h1>
          <p className="mt-2 text-muted-foreground">Join your campus community today.</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/90">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email or Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="student@university.edu" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl text-md font-semibold mt-4" 
                      disabled={login.isPending}
                    >
                      {login.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="1234567890" {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@uni.edu" {...field} className="rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Dept" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                <SelectItem value="Engineering">Engineering</SelectItem>
                                <SelectItem value="Arts">Arts</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Medicine">Medicine</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl text-md font-semibold mt-4 bg-gradient-to-r from-primary to-primary/90 hover:to-primary" 
                      disabled={register.isPending}
                    >
                      {register.isPending ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center">Create Account <ArrowRight className="ml-2 w-4 h-4" /></span>}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* OTP Dialog */}
      <Dialog open={showOtp} onOpenChange={setShowOtp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              We sent a code to your email. (Simulated: Enter any 6 digits)
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
             <Input 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="123456" 
              className="text-center text-2xl tracking-widest h-14 rounded-xl"
              maxLength={6}
            />
            <Button onClick={onVerify} disabled={verify.isPending || otp.length < 4} className="h-12 rounded-xl">
              {verify.isPending ? "Verifying..." : "Verify Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
