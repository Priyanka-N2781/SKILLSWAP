import { useState } from "react";
import { useSkills, useCreateSwap } from "@/hooks/use-skills"; // wait, created dedicated hooks earlier
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
  const [activeTab, setActiveTab] = useState<"teach" | "learn">("teach");
  const [search, setSearch] = useState("");
  const { data: skills, isLoading } = useSkillsHook({ type: activeTab, search });
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
    <div className="p-4 md:p-0 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-10 md:pt-0">
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

      {/* Grid */}
      <div className="mt-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
             ))}
          </div>
        ) : skills?.length === 0 ? (
           <div className="text-center py-20">
             <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Briefcase className="w-10 h-10 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-medium">No skills found</h3>
             <p className="text-muted-foreground">Try changing your filters.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {skills?.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layoutId={`skill-${skill.id}`}
                >
                  <Card className="rounded-2xl border-border/50 hover:border-primary/50 transition-colors overflow-hidden group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 rounded-md px-2 py-1 font-medium text-xs uppercase tracking-wide">
                          {skill.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                           {new Date(skill.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">
                        {skill.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                        {skill.description}
                      </p>

                      <div className="flex items-center gap-3 pt-4 border-t border-dashed border-border">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={skill.user.profilePicture || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {skill.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{skill.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate flex items-center">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {skill.user.department} • Year {skill.user.year}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          className="rounded-xl px-4 h-9 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform"
                          onClick={() => setSelectedSkill(skill)}
                        >
                          Request
                        </Button>
                      </div>
                    </CardContent>
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
