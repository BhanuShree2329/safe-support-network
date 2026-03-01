import { motion } from "framer-motion";
import { Shield, Heart, Users, Building2, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "Multi-role onboarding with OTP verification, password strength enforcement, and suspicious login detection.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Heart,
    title: "Elderly Care & Consent",
    description: "Risk classification, consent management, care lifecycle tracking, and emergency notifications.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: Users,
    title: "Caretaker Management",
    description: "Trust scoring, attendance verification, payment eligibility, and care completion certification.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: Building2,
    title: "NGO & Adoption",
    description: "Verification workflows, capacity alerts, adoption tracking, and inter-NGO transfers.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const modules = [
  "OTP-based account verification",
  "Consent validity checks",
  "Caretaker trust scoring",
  "NGO compliance tracking",
  "Audit-ready logging",
  "Role-based access control",
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">CareConnect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modules</a>
            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roles</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Secure · Ethical · Transparent
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight mb-6 text-foreground">
              Compassionate Care,{" "}
              <span className="text-gradient">Built on Trust</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A comprehensive platform connecting elderly individuals, caretakers, NGOs, and administrators with secure consent management and transparent care workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Start Registration <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="hero-outline" size="xl">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-foreground">Core Modules</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Five integrated modules working together for comprehensive care management.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold font-display mb-2 text-card-foreground">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modules Checklist */}
      <section id="modules" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-foreground">
                Enterprise-Grade Security & Ethics
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Every action is logged, every consent is immutable, and every role is enforced with zero-trust principles.
              </p>
              <Link to="/register">
                <Button variant="hero" size="lg">
                  Join CareConnect <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {modules.map((m) => (
                <motion.div
                  key={m}
                  variants={item}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-soft"
                >
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-medium text-card-foreground">{m}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-foreground">Built for Every Role</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Tailored experiences for each stakeholder in the care ecosystem.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { role: "Admin", desc: "Approve accounts, monitor security, manage system", icon: Shield, gradient: "gradient-hero" },
              { role: "Elderly", desc: "Manage consent, view care status, raise alerts", icon: Heart, gradient: "bg-destructive" },
              { role: "Caretaker", desc: "Accept tasks, log attendance, receive payments", icon: Users, gradient: "bg-info" },
              { role: "NGO", desc: "Track compliance, manage capacity, handle adoptions", icon: Building2, gradient: "gradient-warm" },
            ].map((r) => (
              <motion.div
                key={r.role}
                variants={item}
                className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${r.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <r.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold font-display mb-2 text-card-foreground">{r.role}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">CareConnect</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CareConnect. Compassionate care, built on trust.</p>
        </div>
      </footer>
    </div>
  );
}
