import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Shield, Users, Building2, Check, X, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-elements";
import { useAuth, Role } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const roles: { id: Role; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "admin", label: "Admin", icon: Shield, desc: "System administrator" },
  { id: "elder", label: "Elder", icon: Heart, desc: "Elderly individual" },
  { id: "caretaker", label: "Caretaker", icon: Users, desc: "Care provider" },
  { id: "ngo", label: "NGO", icon: Building2, desc: "Organization" },
  { id: "orphan", label: "Orphan", icon: Baby, desc: "Child in need" },
];

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score, label: "Fair", color: "bg-warning" };
  if (score <= 3) return { score, label: "Good", color: "bg-info" };
  return { score, label: "Strong", color: "bg-success" };
}

const requirements = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRegister = () => {
    if (!selectedRole || !name || !email || !password) return;
    register(name, email, password, selectedRole);
    toast({ title: "Account created!", description: "Please verify your OTP." });
    navigate("/otp-verify");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 text-center max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-20 h-20 rounded-3xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-extrabold font-display text-primary-foreground mb-4">Join CareConnect</h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Create your account and become part of a transparent, ethical care ecosystem.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-primary-foreground/10 animate-float" />
        <div className="absolute bottom-32 right-16 w-28 h-28 rounded-full bg-primary-foreground/5 animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "gradient-hero text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-border"} transition-all`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-bold font-display mb-2 text-foreground">Select Your Role</h1>
                <p className="text-muted-foreground mb-8">Choose the role that best describes you.</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {roles.slice(0, 4).map((r) => (
                    <button key={r.id} onClick={() => setSelectedRole(r.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${selectedRole === r.id ? "border-primary bg-primary/5 shadow-elevated" : "border-border bg-card hover:border-primary/30"}`}>
                      <r.icon className={`w-8 h-8 mb-3 ${selectedRole === r.id ? "text-primary" : "text-muted-foreground"}`} />
                      <h3 className="font-bold font-display text-card-foreground">{r.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelectedRole("orphan")}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 mb-6 ${selectedRole === "orphan" ? "border-primary bg-primary/5 shadow-elevated" : "border-border bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-4">
                    <Baby className={`w-8 h-8 ${selectedRole === "orphan" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <h3 className="font-bold font-display text-card-foreground">Orphan</h3>
                      <p className="text-xs text-muted-foreground mt-1">Child in need of support</p>
                    </div>
                  </div>
                </button>
                <Button variant="hero" size="lg" className="w-full" disabled={!selectedRole} onClick={() => setStep(2)}>Continue</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-bold font-display mb-2 text-foreground">Account Details</h1>
                <p className="text-muted-foreground mb-8">Fill in your information to create your account.</p>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label className="text-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="John Doe" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-border"}`} />
                          ))}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${strength.score <= 1 ? "text-destructive" : strength.score <= 2 ? "text-warning" : "text-success"}`}>{strength.label}</p>
                        <div className="mt-3 space-y-1.5">
                          {requirements.map((r) => (
                            <div key={r.label} className="flex items-center gap-2 text-xs">
                              {r.test(password) ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
                              <span className={r.test(password) ? "text-success" : "text-muted-foreground"}>{r.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="hero" size="lg" className="flex-1" onClick={() => setStep(3)} disabled={!name || !email || !password}>Continue</Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-bold font-display mb-2 text-foreground">Consent Agreement</h1>
                <p className="text-muted-foreground mb-8">Please read and confirm the following conditions.</p>
                <div className="space-y-4 mb-8">
                  <div onClick={() => setConsent1(!consent1)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${consent1 ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${consent1 ? "gradient-hero" : "border-2 border-border"}`}>
                        {consent1 && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-card-foreground mb-1">Terms of Service</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">I agree to the CareConnect Terms of Service, including data processing, role-based access policies, and platform usage guidelines.</p>
                      </div>
                    </div>
                  </div>
                  <div onClick={() => setConsent2(!consent2)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${consent2 ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${consent2 ? "gradient-hero" : "border-2 border-border"}`}>
                        {consent2 && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-card-foreground mb-1">Privacy & Consent Policy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">I understand that my consent history will be recorded, I can withdraw consent at any time, and my data will be handled according to our privacy policy.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                  <Button variant="hero" size="lg" className="flex-1" disabled={!consent1 || !consent2} onClick={handleRegister}>Create Account</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
