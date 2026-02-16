import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSkills as useSkillsHook } from "@/hooks/use-skills"; 
import { useCreateSwap as useCreateSwapHook } from "@/hooks/use-swaps";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Briefcase, Filter, ArrowUpRight, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { type Skill, type User } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"teach" | "learn">("teach");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: skills, isLoading } = useSkillsHook({ 
    type: activeTab, 
    search, 
    category: selectedCategory === "All" ? undefined : selectedCategory 
  });
  
  // Filter out current user's skills from the dashboard
  const filteredSkills = skills?.filter(s => s.userId !== user?.id);
  const [selectedSkill, setSelectedSkill] = useState<(Skill & { user: User }) | null>(null);

  const requestSwap = useCreateSwapHook();
  const [message, setMessage] = useState("");

  const handleSwapRequest = () => {
    if (!selectedSkill) return;
    requestSwap.mutate({
      receiverId: selectedSkill.user.id,
      skillId: selectedSkill.id,
      message,
    }, {
      onSuccess: () => {
        setSelectedSkill(null);
        setMessage("");
      }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Categories Scroller */}
      <div className="mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 py-2">
        <div className="flex gap-2 min-w-max">
          {["All", "Programming", "Music", "Design", "Marketing", "Business", "Languages"].map((cat) => (
            <Button 
              key={cat} 
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm" 
              className={`rounded-full px-4 h-9 border-border/50 transition-all ${
                selectedCategory === cat ? "shadow-lg shadow-primary/20" : "hover:bg-primary/5 hover:border-primary/30"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 md:hidden">
         <div className="flex items-center justify-between mb-6">
           <div>
             <h1 className="text-2xl font-display font-bold">Discover Skills</h1>
             <p className="text-sm text-muted-foreground">Find students to swap skills with.</p>
           </div>
           <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
             <Filter className="w-4 h-4" />
           </Button>
         </div>

         <div className="relative mb-6">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
           <Input 
            placeholder="Search python, guitar, design..." 
            className="pl-10 h-12 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
           />
         </div>

         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
           <TabsList className="w-full h-12 bg-muted/50 p-1 rounded-xl grid grid-cols-2">
             <TabsTrigger value="teach" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
               Looking to Learn
             </TabsTrigger>
             <TabsTrigger value="learn" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
               Offering to Teach
             </TabsTrigger>
           </TabsList>
         </Tabs>
      </div>

      {/* Desktop Specific Tab Selector (Mobile handles this in the sticky header) */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Swap your expertise with fellow students.</p>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-80">
          <TabsList className="w-full h-11 bg-muted/50 p-1 rounded-xl grid grid-cols-2">
            <TabsTrigger value="teach" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              Learn
            </TabsTrigger>
            <TabsTrigger value="learn" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              Teach
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4 pb-20 md:pb-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
             ))}
          </div>
        ) : filteredSkills?.length === 0 ? (
           <div className="text-center py-20">
             <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Briefcase className="w-10 h-10 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-medium">No skills found</h3>
             <p className="text-muted-foreground">Try changing your filters.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSkills?.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layoutId={`skill-${skill.id}`}
                >
                  <Card className="rounded-3xl border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent rounded-full px-3 py-1 font-semibold text-[10px] uppercase tracking-wider">
                          {skill.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-lg">
                           {new Date(skill.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-display font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {skill.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-8 min-h-[40px]">
                        {skill.description}
                      </p>

                      <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                        <Avatar className="h-10 w-10 ring-2 ring-background ring-offset-2 ring-offset-border/50">
                          <AvatarImage src={skill.user.profilePicture || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {skill.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate leading-none mb-1">{skill.user.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate flex items-center">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {skill.user.department}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 border-t border-border/50">
                      <Button 
                        variant="ghost"
                        className="w-full rounded-none h-12 text-primary font-bold hover:bg-primary hover:text-white transition-all gap-2"
                        onClick={() => setSelectedSkill(skill)}
                      >
                        Request Swap <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={(o) => !o && setSelectedSkill(null)}>
        <DialogContent className="rounded-3xl p-6 sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="text-xl font-display">Request Swap</DialogTitle>
             <DialogDescription>
               Interested in {selectedSkill?.title}? Send a message to {selectedSkill?.user.name} to start the conversation.
             </DialogDescription>
           </DialogHeader>
           
           <div className="py-4">
             <Textarea 
               placeholder="Hi! I'd love to learn this. I can teach you..." 
               className="min-h-[120px] rounded-xl resize-none p-4"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
             />
           </div>

           <DialogFooter>
             <Button variant="ghost" onClick={() => setSelectedSkill(null)} className="rounded-xl">Cancel</Button>
             <Button onClick={handleSwapRequest} disabled={requestSwap.isPending || !message} className="rounded-xl">
               {requestSwap.isPending ? "Sending..." : "Send Request"}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
