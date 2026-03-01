import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { saveCareRequest } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const helpTypes = ["Medical Assistance", "Daily Living Support", "Companionship", "Transportation", "Meal Preparation", "Physical Therapy"];

export default function CareRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [helpType, setHelpType] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !location || !helpType || !description) {
      toast({ title: "Missing fields", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    saveCareRequest({
      id: Date.now().toString(),
      elderName: name,
      age: parseInt(age),
      location,
      helpType,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: user?.id || "",
    });
    toast({ title: "Request submitted", description: "Your care request is pending approval." });
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
            <Label className="text-foreground">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your care needs in detail..." rows={4} />
          </div>
          <Button variant="hero" size="lg" className="w-full" type="submit">
            Submit Request
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
