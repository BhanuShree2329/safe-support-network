import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Building2, CheckCircle, BarChart3, ArrowRightLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOrphanRequests, updateOrphanRequest, getCareRequests, updateCareRequest,
  type OrphanRequest, type CareRequest, type Priority,
  getNGOProfile, updateNGOProfile, updateComplianceItem, addTransferRequest,
  type NGOProfile, anonymizeChildName,
} from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  assigned: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
};

const priorityColors: Record<Priority, string> = {
  LOW: "bg-success/10 text-success",
  MEDIUM: "bg-warning/10 text-warning",
  HIGH: "bg-accent/10 text-accent",
  SEVERE: "bg-destructive/10 text-destructive",
};

const adoptionStageColors: Record<string, string> = {
  applied: "bg-info/10 text-info",
  verified: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  cooling_off: "bg-accent/10 text-accent",
  finalized: "bg-primary/10 text-primary",
};

type TabId = "orphans" | "elderly" | "compliance" | "analytics" | "transfers";

export default function NGODashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orphanReqs, setOrphanReqs] = useState<OrphanRequest[]>([]);
  const [careReqs, setCareReqs] = useState<CareRequest[]>([]);
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [tab, setTab] = useState<TabId>("orphans");

  const load = () => {
    setOrphanReqs(getOrphanRequests().filter((r) => r.assignedNGO === user?.id || r.status === "approved"));
    setCareReqs(getCareRequests().filter((r) => r.assignedNGO === user?.id || (r.status === "approved" && r.riskLevel === "high")));
    if (user) setProfile(getNGOProfile(user.id));
  };

  useEffect(() => { load(); }, [user]);

  const handleAcceptOrphan = (id: string) => {
    if (profile && profile.currentOccupancy >= profile.capacity) {
      toast({ title: "Capacity full!", description: "Cannot accept more requests.", variant: "destructive" });
      return;
    }
    updateOrphanRequest(id, { status: "assigned", assignedNGO: user?.id, adoptionStage: "applied" });
    if (profile) updateNGOProfile(user?.id || "", { currentOccupancy: profile.currentOccupancy + 1 });
    toast({ title: "Orphan support request accepted" });
    load();
  };

  const handleAcceptElderly = (id: string) => {
    updateCareRequest(id, { assignedNGO: user?.id, careLifecycle: "transferred" });
    if (profile) {
      updateNGOProfile(user?.id || "", {
        currentOccupancy: profile.currentOccupancy + 1,
        performanceStats: { ...profile.performanceStats, elderlyCaredFor: profile.performanceStats.elderlyCaredFor + 1 }
      });
    }
    toast({ title: "Elderly care accepted" });
    load();
  };

  const advanceAdoption = (req: OrphanRequest) => {
    const stages: OrphanRequest["adoptionStage"][] = ["applied", "verified", "approved", "cooling_off", "finalized"];
    const currentIdx = stages.indexOf(req.adoptionStage || "applied");
    if (currentIdx < stages.length - 1) {
      const next = stages[currentIdx + 1];
      const updates: Partial<OrphanRequest> = { adoptionStage: next };
      if (next === "cooling_off") {
        updates.coolingOffUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      if (next === "finalized") {
        if (req.coolingOffUntil && new Date(req.coolingOffUntil) > new Date()) {
          toast({ title: "Cooling-off period active", description: `Wait until ${new Date(req.coolingOffUntil).toLocaleDateString()}`, variant: "destructive" });
          return;
        }
        updates.status = "completed";
        if (profile) updateNGOProfile(user?.id || "", {
          performanceStats: { ...profile.performanceStats, adoptionsCompleted: profile.performanceStats.adoptionsCompleted + 1 }
        });
      }
      updateOrphanRequest(req.id, updates);
      toast({ title: `Adoption stage: ${next?.replace("_", " ")}` });
      load();
    }
  };

  const toggleCompliance = (idx: number) => {
    updateComplianceItem(user?.id || "", idx, !profile?.complianceChecklist[idx]?.met);
    load();
  };

  const capacityPct = profile ? Math.round((profile.currentOccupancy / profile.capacity) * 100) : 0;

  const tabs = [
    { id: "orphans" as TabId, label: "Orphan Requests" },
    { id: "elderly" as TabId, label: "Elderly Intake" },
    { id: "compliance" as TabId, label: "Compliance" },
    { id: "analytics" as TabId, label: "Analytics" },
    { id: "transfers" as TabId, label: "Transfers" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-sm mb-4">
            {user?.status === "pending" ? "⏳ Your NGO is pending verification." : "Manage orphan support, elderly intake, and compliance."}
          </p>

          {user?.status === "pending" ? (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-8 text-center">
              <ClipboardList className="w-12 h-12 text-warning mx-auto mb-4" />
              <p className="text-warning font-medium">Your NGO is awaiting admin verification.</p>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-card rounded-xl border border-border p-4 flex-1 min-w-[150px]">
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <p className="text-xl font-bold text-card-foreground">{profile?.currentOccupancy}/{profile?.capacity}</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full ${capacityPct >= 90 ? "bg-destructive" : capacityPct >= 70 ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${Math.min(capacityPct, 100)}%` }} />
                  </div>
                  {capacityPct >= 90 && <p className="text-xs text-destructive mt-1">⚠ Near full capacity!</p>}
                </div>
                <div className="bg-card rounded-xl border border-border p-4 flex-1 min-w-[120px]">
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className={`text-lg font-bold ${profile?.verified ? "text-success" : "text-warning"}`}>{profile?.verified ? "Yes ✓" : "Pending"}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 flex-1 min-w-[120px]">
                  <p className="text-xs text-muted-foreground">Adoptions</p>
                  <p className="text-xl font-bold text-card-foreground">{profile?.performanceStats.adoptionsCompleted ?? 0}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "gradient-hero text-primary-foreground shadow-elevated" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "orphans" && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold font-display mb-4 text-foreground">Orphan Support Requests</h2>
                  {orphanReqs.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                      <p className="text-muted-foreground">No orphan support requests available.</p>
                    </div>
                  ) : orphanReqs.map((r) => (
                    <div key={r.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-card-foreground">
                              {r.anonymized ? anonymizeChildName(r.name) : r.name}, age {r.age}
                            </h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                            {r.adoptionStage && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${adoptionStageColors[r.adoptionStage]}`}>
                                {r.adoptionStage.replace("_", " ")}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.supportTypes.map((t) => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {r.status === "approved" && (
                            <Button size="sm" variant="hero" onClick={() => handleAcceptOrphan(r.id)}>Accept</Button>
                          )}
                          {r.assignedNGO === user?.id && r.adoptionStage && r.adoptionStage !== "finalized" && (
                            <Button size="sm" variant="default" onClick={() => advanceAdoption(r)} className="text-xs">
                              Advance Stage
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "elderly" && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold font-display mb-4 text-foreground">Elderly Intake (High Risk)</h2>
                  {careReqs.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                      <p className="text-muted-foreground">No elderly intake requests available.</p>
                    </div>
                  ) : careReqs.map(r => (
                    <div key={r.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-card-foreground">{r.elderName}, age {r.age}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.location}</p>
                        </div>
                        {!r.assignedNGO && r.consentStatus === "active" && (
                          <Button size="sm" variant="hero" onClick={() => handleAcceptElderly(r.id)}>Accept Intake</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "compliance" && profile && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-display text-foreground">Compliance Checklist</h2>
                  <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
                    {profile.complianceChecklist.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={item.met} onChange={() => toggleCompliance(idx)} className="accent-primary w-4 h-4" />
                        <span className={`text-sm ${item.met ? "text-card-foreground" : "text-muted-foreground"}`}>{item.item}</span>
                        {item.met && <CheckCircle className="w-4 h-4 text-success" />}
                      </label>
                    ))}
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {profile.complianceChecklist.filter(c => c.met).length}/{profile.complianceChecklist.length} items completed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tab === "analytics" && profile && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-display text-foreground">Performance Analytics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card rounded-2xl border border-border p-6 text-center">
                      <p className="text-3xl font-bold text-primary">{profile.performanceStats.adoptionsCompleted}</p>
                      <p className="text-sm text-muted-foreground mt-1">Adoptions Completed</p>
                    </div>
                    <div className="bg-card rounded-2xl border border-border p-6 text-center">
                      <p className="text-3xl font-bold text-info">{profile.performanceStats.elderlyCaredFor}</p>
                      <p className="text-sm text-muted-foreground mt-1">Elderly Cared For</p>
                    </div>
                    <div className="bg-card rounded-2xl border border-border p-6 text-center">
                      <p className="text-3xl font-bold text-warning">{profile.performanceStats.transfersHandled}</p>
                      <p className="text-sm text-muted-foreground mt-1">Transfers Handled</p>
                    </div>
                  </div>
                </div>
              )}

              {tab === "transfers" && profile && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-display text-foreground">Inter-NGO Transfers</h2>
                  {profile.transferRequests.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-8 text-center">
                      <ArrowRightLeft className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No transfer requests.</p>
                    </div>
                  ) : profile.transferRequests.map(t => (
                    <div key={t.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{t.subjectName} ({t.type})</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${t.status === "approved" ? "bg-success/10 text-success" : t.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
