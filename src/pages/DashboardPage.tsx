import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Shield, Users, Building2, Activity, Bell, ClipboardCheck,
  AlertTriangle, FileCheck, UserCheck, Clock, Lock, BarChart3,
  ChevronRight, LogOut, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Active Users", value: "1,247", change: "+12%", icon: Users },
  { label: "Elderly Under Care", value: "384", change: "+5%", icon: Heart },
  { label: "Pending Approvals", value: "23", change: "-3", icon: ClipboardCheck },
  { label: "Active NGOs", value: "56", change: "+2", icon: Building2 },
];

const modules = [
  {
    title: "Authentication & Security",
    icon: Shield,
    items: ["OTP Verification", "Suspicious Login Detection", "Role Switch Prevention", "Account Activity Tracking"],
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Elderly Care & Consent",
    icon: Heart,
    items: ["Consent Validity Checks", "Risk Classification", "Emergency Notifications", "Well-being Reminders"],
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    title: "Caretaker Management",
    icon: Users,
    items: ["Trust Score System", "Attendance Verification", "Payment Eligibility", "Care Completion"],
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    title: "NGO & Adoption",
    icon: Building2,
    items: ["Verification Status", "Capacity Forecasting", "Adoption Tracking", "Compliance Checklist"],
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    title: "System & Integration",
    icon: Activity,
    items: ["Audit Logs", "Consent Immutability", "Data Anonymization", "Health Monitoring"],
    color: "text-success",
    bg: "bg-success/10",
  },
];

const recentActivity = [
  { action: "New caretaker registration pending approval", time: "2 min ago", icon: UserCheck, type: "info" },
  { action: "Suspicious login detected for user #4821", time: "15 min ago", icon: AlertTriangle, type: "warning" },
  { action: "Consent withdrawn by elderly user #1024", time: "1 hour ago", icon: FileCheck, type: "destructive" },
  { action: "NGO 'Hope Foundation' verified by admin", time: "3 hours ago", icon: Shield, type: "success" },
  { action: "Payment released to caretaker #2341", time: "5 hours ago", icon: Clock, type: "info" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">CareNest</span>
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
            <Link to="/">
              <Button variant="ghost" size="icon"><LogOut className="w-5 h-5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <motion.div key={s.label} variants={item} className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-success">{s.change}</span>
              </div>
              <p className="text-2xl font-bold font-display text-card-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modules */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold font-display mb-5 text-foreground">System Modules</h2>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              {modules.map((m) => (
                <motion.div key={m.title} variants={item} className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0`}>
                      <m.icon className={`w-6 h-6 ${m.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold font-display text-card-foreground">{m.title}</h3>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.items.map((i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{i}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Activity feed */}
          <div>
            <h2 className="text-xl font-bold font-display mb-5 text-foreground">Recent Activity</h2>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {recentActivity.map((a, idx) => (
                <motion.div key={idx} variants={item} className="bg-card rounded-xl p-4 shadow-soft border border-border">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      a.type === "warning" ? "bg-warning/10" : a.type === "destructive" ? "bg-destructive/10" : a.type === "success" ? "bg-success/10" : "bg-info/10"
                    }`}>
                      <a.icon className={`w-4 h-4 ${
                        a.type === "warning" ? "text-warning" : a.type === "destructive" ? "text-destructive" : a.type === "success" ? "text-success" : "text-info"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-card-foreground leading-snug">{a.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-xl font-bold font-display mb-5 text-foreground">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="hero" size="lg" className="w-full justify-start gap-3">
                  <ClipboardCheck className="w-5 h-5" /> Approval Queue (23)
                </Button>
                <Button variant="outline" size="lg" className="w-full justify-start gap-3">
                  <BarChart3 className="w-5 h-5" /> View Analytics
                </Button>
                <Button variant="outline" size="lg" className="w-full justify-start gap-3">
                  <Lock className="w-5 h-5" /> Security Alerts (2)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
