import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { saveOrphanRequest } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const supportOptions = ["Education", "Medical", "Shelter", "Financial"];

export default function OrphanRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [guardian, setGuardian] = useState("");
  const [supportTypes, setSupportTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const toggleSupport = (s: string) => {
    setSupportTypes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || supportTypes.length === 0 || !description) {
      toast({ title: "Missing fields", description: "Please fill required fields.", variant: "destructive" });
      return;
    }
    saveOrphanRequest({
      id: Date.now().toString(),
      name,
      age: parseInt(age),
      guardian: guardian || undefined,
      supportTypes,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: user?.id || "",
    });
    toast({ title: "Request submitted", description: "Your support request is pending approval." });
    navigate("/dashboard/orphan");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link to="/dashboard/orphan" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold font-display mb-2 text-foreground">Support Request</h1>
        <p className="text-muted-foreground mb-8">Tell us what support you need.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-foreground">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Age</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Guardian (optional)</Label>
              <Input value={guardian} onChange={(e) => setGuardian(e.target.value)} placeholder="Guardian name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Required Support</Label>
            <div className="flex flex-wrap gap-2">
              {supportOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSupport(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                    supportTypes.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your needs in detail..." rows={4} />
          </div>
          <Button variant="hero" size="lg" className="w-full" type="submit">
            Submit Request
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
