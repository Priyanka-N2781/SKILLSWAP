import { useState } from "react";
import { useSkills, useCreateSkill, useDeleteSkill } from "@/hooks/use-skills";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MySkillsPage() {
  const { user } = useAuth();
  // We can't filter by user on backend yet with current list API, 
  // so we'll fetch all and filter client side or backend should have /me/skills.
  // For simplicity assuming list returns everything and we filter:
  const { data: allSkills, isLoading } = useSkills();
  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "teach" as "teach" | "learn",
  });

  const mySkills = allSkills?.filter(s => s.userId === user?.id) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSkill.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({ title: "", description: "", category: "", type: "teach" });
      }
    });
  };

  return (
    <div className="p-4 md:p-0 min-h-screen">
      <div className="flex items-center justify-between mb-8 pt-10 md:pt-0">
        <div>
           <h1 className="text-2xl font-display font-bold">My Skills</h1>
           <p className="text-muted-foreground text-sm">Manage what you teach and learn.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2 hidden">
                <Label>I want to...</Label>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  placeholder="e.g. Advanced Python" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="rounded-xl"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Language">Language</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe what you offer or what you want to learn..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="rounded-xl min-h-[100px]"
                  required
                />
              </div>

              <Button type="submit" disabled={createSkill.isPending} className="w-full rounded-xl mt-4">
                {createSkill.isPending ? "Adding..." : "Add Skill"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 pb-20">
        {mySkills.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-muted rounded-3xl">
            <p className="text-muted-foreground">You haven't listed any skills yet.</p>
          </div>
        )}

        {mySkills.map((skill) => (
          <Card key={skill.id} className="rounded-2xl border-border/50">
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{skill.category}</span>
                </div>
                <h3 className="text-lg font-bold font-display">{skill.title}</h3>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => deleteSkill.mutate(skill.id)}
                disabled={deleteSkill.isPending}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
