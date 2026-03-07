import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { saveOrphanRequest, assignOrphanPriority } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const supportOptions = ["Education", "Medical", "Shelter", "Financial"];

export default function OrphanRequestForm() {
  const { user, addConsentRecord } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [guardian, setGuardian] = useState("");
  const [supportTypes, setSupportTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [consentStep, setConsentStep] = useState(0);

  const toggleSupport = (s: string) => {
    setSupportTypes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || supportTypes.length === 0 || !description) {
      toast({ title: "Missing fields", description: "Please fill required fields.", variant: "destructive" });
      return;
    }
    if (consentStep < 2) {
      toast({ title: "Consent required", description: "Please complete both consent steps.", variant: "destructive" });
      return;
    }

    const ageNum = parseInt(age);
    const priority = assignOrphanPriority(ageNum, supportTypes, description);

    saveOrphanRequest({
      id: Date.now().toString(),
      name,
      age: ageNum,
      guardian: guardian || undefined,
      supportTypes,
      description,
      status: "pending",
      priority,
      createdAt: new Date().toISOString(),
      userId: user?.id || "",
    });
    addConsentRecord("orphan_request", `Consent given for orphan support request`, "given");
    toast({ title: "Request submitted", description: `Priority: ${priority}` });
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
                <button key={s} type="button" onClick={() => toggleSupport(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${supportTypes.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your needs in detail..." rows={4} />
          </div>

          {/* Two-step consent */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
            <Label className="text-foreground font-bold">Consent Acknowledgment</Label>
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={consentStep >= 1} onChange={(e) => setConsentStep(e.target.checked ? Math.max(consentStep, 1) : 0)}
                className="mt-1 accent-primary" />
              <p className="text-sm text-muted-foreground">I consent to share my information with authorized NGOs and support organizations.</p>
            </div>
            {consentStep >= 1 && (
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={consentStep >= 2} onChange={(e) => setConsentStep(e.target.checked ? 2 : 1)}
                  className="mt-1 accent-primary" />
                <p className="text-sm text-muted-foreground">I understand I can withdraw consent at any time and all support actions will be paused.</p>
              </div>
            )}
          </div>

          <Button variant="hero" size="lg" className="w-full" type="submit">Submit Request</Button>
        </form>
      </motion.div>
    </div>
  );
}
