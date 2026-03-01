import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Users, CheckCircle, XCircle, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, updateUserStatus, getCareRequests, getOrphanRequests, updateCareRequest, updateOrphanRequest } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/contexts/AuthContext";
import type { CareRequest, OrphanRequest } from "@/lib/mockData";
import DashboardHeader from "@/components/DashboardHeader";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [careReqs, setCareReqs] = useState<CareRequest[]>([]);
  const [orphanReqs, setOrphanReqs] = useState<OrphanRequest[]>([]);
  const [tab, setTab] = useState<"users" | "care" | "orphan">("users");

  const load = () => {
    setPendingUsers(getAllUsers().filter((u: User) => u.status === "pending"));
    setCareReqs(getCareRequests());
    setOrphanReqs(getOrphanRequests());
  };

  useEffect(() => { load(); }, []);

  const handleUserAction = (userId: string, status: "approved" | "rejected") => {
    updateUserStatus(userId, status);
    toast({ title: `User ${status}` });
    load();
  };

  const handleCareApprove = (id: string) => {
    updateCareRequest(id, { status: "approved" });
    toast({ title: "Care request approved" });
    load();
  };

  const handleOrphanApprove = (id: string) => {
    updateOrphanRequest(id, { status: "approved" });
    toast({ title: "Orphan request approved" });
    load();
  };

  const tabs = [
    { id: "users" as const, label: "Pending Users", count: pendingUsers.length, icon: Users },
    { id: "care" as const, label: "Care Requests", count: careReqs.length, icon: Heart },
    { id: "orphan" as const, label: "Orphan Requests", count: orphanReqs.length, icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mb-6">Manage users, care requests, and orphan support.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${tab === t.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
                <t.icon className={`w-6 h-6 mb-2 ${tab === t.id ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-2xl font-bold font-display text-card-foreground">{t.count}</p>
                <p className="text-sm text-muted-foreground">{t.label}</p>
              </button>
            ))}
          </div>

          {tab === "users" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Pending User Approvals</h2>
              {pendingUsers.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">All users have been reviewed.</p>
                </div>
              ) : (
                pendingUsers.map((u) => (
                  <motion.div key={u.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-card-foreground">{u.name}</h3>
                        <p className="text-sm text-muted-foreground">{u.email} · <span className="capitalize">{u.role}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="hero" onClick={() => handleUserAction(u.id, "approved")} className="gap-1">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUserAction(u.id, "rejected")} className="gap-1">
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {tab === "care" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">All Care Requests</h2>
              {careReqs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No care requests submitted yet.</p>
                </div>
              ) : (
                careReqs.map((r) => (
                  <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-card-foreground">{r.elderName} — {r.helpType}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{r.location} · Status: <span className="capitalize font-medium">{r.status}</span></p>
                      </div>
                      {r.status === "pending" && (
                        <Button size="sm" variant="hero" onClick={() => handleCareApprove(r.id)}>Approve</Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {tab === "orphan" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">All Orphan Support Requests</h2>
              {orphanReqs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orphan support requests submitted yet.</p>
                </div>
              ) : (
                orphanReqs.map((r) => (
                  <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-card-foreground">{r.name}, age {r.age}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.supportTypes.map((t) => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Status: <span className="capitalize font-medium">{r.status}</span></p>
                      </div>
                      {r.status === "pending" && (
                        <Button size="sm" variant="hero" onClick={() => handleOrphanApprove(r.id)}>Approve</Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
