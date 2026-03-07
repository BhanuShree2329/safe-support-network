import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { saveCareRequest, assignPriority, classifyRisk } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const helpTypes = ["Medical Assistance", "Daily Living Support", "Companionship", "Transportation", "Meal Preparation", "Physical Therapy"];
const medicalAlertOptions = ["Mobility Issues", "Medication Dependency", "Cognitive Decline", "Heart Condition", "Diabetes", "Vision/Hearing Loss"];

export default function CareRequestForm() {
  const { user, addConsentRecord } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [helpType, setHelpType] = useState("");
  const [description, setDescription] = useState("");
  const [medicalAlerts, setMedicalAlerts] = useState<string[]>([]);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [consentStep, setConsentStep] = useState(0);

  const toggleMedical = (m: string) => {
    setMedicalAlerts(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !location || !helpType || !description) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (consentStep < 2) {
      toast({ title: "Consent required", description: "Please complete both consent steps.", variant: "destructive" });
      return;
    }

    const ageNum = parseInt(age);
    const priority = assignPriority(ageNum, helpType, medicalAlerts, description);
    const riskLevel = classifyRisk(ageNum, medicalAlerts);

    saveCareRequest({
      id: Date.now().toString(),
      elderName: name,
      age: ageNum,
      location,
      helpType,
      description,
      status: "pending",
      priority,
      riskLevel,
      careLifecycle: "registered",
      consentStatus: "active",
      medicalAlerts,
      emergencyContact: emergencyContact || undefined,
      createdAt: new Date().toISOString(),
      userId: user?.id || "",
    });
    addConsentRecord("care_request", `Consent given for care request: ${helpType}`, "given");
    toast({ title: "Request submitted", description: `Priority: ${priority} | Risk: ${riskLevel}` });
    navigate("/dashboard/elder");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link to="/dashboard/elder" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold font-display mb-2 text-foreground">Submit Care Request</h1>
        <p className="text-muted-foreground mb-8">Tell us what kind of care you need.</p>

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
              <Label className="text-foreground">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Type of Help</Label>
            <Select value={helpType} onValueChange={setHelpType}>
              <SelectTrigger><SelectValue placeholder="Select type of help" /></SelectTrigger>
              <SelectContent>
                {helpTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Medical Alerts</Label>
            <div className="flex flex-wrap gap-2">
              {medicalAlertOptions.map((m) => (
                <button key={m} type="button" onClick={() => toggleMedical(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${medicalAlerts.includes(m) ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-card text-muted-foreground hover:border-destructive/30"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Emergency Contact (optional)</Label>
            <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Phone or email" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your care needs in detail..." rows={4} />
          </div>

          {/* Two-step consent */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
            <Label className="text-foreground font-bold">Consent Acknowledgment</Label>
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={consentStep >= 1} onChange={(e) => setConsentStep(e.target.checked ? Math.max(consentStep, 1) : 0)}
                className="mt-1 accent-primary" />
              <p className="text-sm text-muted-foreground">I consent to share my personal and health information with authorized caretakers and NGOs for care purposes.</p>
            </div>
            {consentStep >= 1 && (
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={consentStep >= 2} onChange={(e) => setConsentStep(e.target.checked ? 2 : 1)}
                  className="mt-1 accent-primary" />
                <p className="text-sm text-muted-foreground">I understand I can withdraw consent at any time, which will immediately stop all care actions on my behalf.</p>
              </div>
            )}
          </div>

          <Button variant="hero" size="lg" className="w-full" type="submit">Submit Request</Button>
        </form>
      </motion.div>
    </div>
  );
}
