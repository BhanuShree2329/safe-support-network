import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Users, CheckCircle, XCircle, FileText, Building2, ShieldAlert, Ban, RotateCcw, Clock, AlertTriangle, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { User, ConsentRecord, SecurityAlert } from "@/contexts/AuthContext";
import {
  getAllUsers, updateUserStatus, getCareRequests, getOrphanRequests,
  updateCareRequest, updateOrphanRequest, suspendUser, unsuspendUser,
  getSecurityAlerts, resolveSecurityAlert, getAuditLog, addAuditEntry,
} from "@/lib/mockData";
import type { CareRequest, OrphanRequest, AuditEntry } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const statusBadge: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  suspended: "bg-muted text-muted-foreground",
};

type TabId = "users" | "care" | "orphan" | "security" | "consent" | "audit";

export default function AdminDashboard() {
  const { user, getConsentHistory } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [careReqs, setCareReqs] = useState<CareRequest[]>([]);
  const [orphanReqs, setOrphanReqs] = useState<OrphanRequest[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [tab, setTab] = useState<TabId>("users");

  const load = () => {
    setAllUsers(getAllUsers());
    setCareReqs(getCareRequests());
    setOrphanReqs(getOrphanRequests());
    setAlerts(getSecurityAlerts());
    setConsentRecords(getConsentHistory());
    setAuditLog(getAuditLog());
  };

  useEffect(() => { load(); }, []);

  const pendingUsers = allUsers.filter((u) => u.status === "pending");
  const suspendedUsers = allUsers.filter((u) => u.status === "suspended");
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  const handleUserAction = (userId: string, status: "approved" | "rejected") => {
    updateUserStatus(userId, status);
    addAuditEntry({ userId: user?.id || "", userName: user?.name || "", action: `User ${status}`, target: userId });
    toast({ title: `User ${status}` });
    load();
  };

  const handleSuspend = (userId: string) => {
    suspendUser(userId);
    addAuditEntry({ userId: user?.id || "", userName: user?.name || "", action: "User suspended", target: userId });
    toast({ title: "User suspended" });
    load();
  };

  const handleUnsuspend = (userId: string) => {
    unsuspendUser(userId);
    addAuditEntry({ userId: user?.id || "", userName: user?.name || "", action: "User unsuspended", target: userId });
    toast({ title: "User reactivated" });
    load();
  };

  const handleResolveAlert = (alertId: string) => {
    resolveSecurityAlert(alertId);
    toast({ title: "Alert resolved" });
    load();
  };

  const handleCareApprove = (id: string) => {
    updateCareRequest(id, { status: "approved" });
    addAuditEntry({ userId: user?.id || "", userName: user?.name || "", action: "Care request approved", target: id });
    toast({ title: "Care request approved" });
    load();
  };

  const handleOrphanApprove = (id: string) => {
    updateOrphanRequest(id, { status: "approved" });
    addAuditEntry({ userId: user?.id || "", userName: user?.name || "", action: "Orphan request approved", target: id });
    toast({ title: "Orphan request approved" });
    load();
  };

  const tabs: { id: TabId; label: string; count: number; icon: React.ElementType }[] = [
    { id: "users", label: "Users", count: pendingUsers.length, icon: Users },
    { id: "care", label: "Care", count: careReqs.length, icon: Heart },
    { id: "orphan", label: "Orphan", count: orphanReqs.length, icon: Building2 },
    { id: "security", label: "Security", count: unresolvedAlerts.length, icon: ShieldAlert },
    { id: "consent", label: "Consent", count: consentRecords.length, icon: ScrollText },
    { id: "audit", label: "Audit", count: auditLog.length, icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mb-6">Manage users, requests, security, and compliance.</p>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "gradient-hero text-primary-foreground shadow-elevated" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary-foreground/20" : "bg-muted"}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ========== USERS TAB ========== */}
          {tab === "users" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              {/* Pending */}
              <div>
                <h2 className="text-lg font-bold font-display mb-4 text-foreground">Pending Approvals ({pendingUsers.length})</h2>
                {pendingUsers.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-8 text-center">
                    <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">All users reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map((u) => (
                      <motion.div key={u.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-card-foreground">{u.name}</h3>
                            <p className="text-sm text-muted-foreground">{u.email} · <span className="capitalize">{u.role}</span></p>
                            <p className="text-xs text-muted-foreground mt-1">Registered {new Date(u.createdAt).toLocaleDateString()}</p>
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
                    ))}
                  </div>
                )}
              </div>

              {/* All users list */}
              <div>
                <h2 className="text-lg font-bold font-display mb-4 text-foreground">All Users ({allUsers.length})</h2>
                <div className="space-y-2">
                  {allUsers.map((u) => (
                    <div key={u.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-card-foreground">{u.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[u.status]}`}>{u.status}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{u.role}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {u.email}
                          {u.lastLogin && ` · Last login: ${new Date(u.lastLogin).toLocaleString()}`}
                          {u.loginDevice && ` · ${u.loginDevice}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {u.status !== "suspended" && u.role !== "admin" && (
                          <Button size="sm" variant="outline" onClick={() => handleSuspend(u.id)} className="gap-1 text-destructive hover:text-destructive">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </Button>
                        )}
                        {u.status === "suspended" && (
                          <Button size="sm" variant="outline" onClick={() => handleUnsuspend(u.id)} className="gap-1 text-success hover:text-success">
                            <RotateCcw className="w-3.5 h-3.5" /> Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== CARE TAB ========== */}
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

          {/* ========== ORPHAN TAB ========== */}
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

          {/* ========== SECURITY TAB ========== */}
          {tab === "security" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Security Alerts</h2>
              {alerts.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <ShieldAlert className="w-12 h-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">No security alerts. System is secure.</p>
                </div>
              ) : (
                alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((a) => (
                  <motion.div key={a.id} variants={item}
                    className={`rounded-2xl border p-5 shadow-card ${a.resolved ? "bg-card border-border opacity-60" : "bg-destructive/5 border-destructive/20"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${a.resolved ? "text-muted-foreground" : "text-destructive"}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-card-foreground">{a.userName}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${a.type === "account_locked" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                              {a.type.replace("_", " ")}
                            </span>
                            {a.resolved && <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">resolved</span>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(a.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      {!a.resolved && (
                        <Button size="sm" variant="outline" onClick={() => handleResolveAlert(a.id)}>Resolve</Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ========== CONSENT TAB ========== */}
          {tab === "consent" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Consent History (Immutable Audit)</h2>
              {consentRecords.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No consent records yet.</p>
                </div>
              ) : (
                consentRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((c) => {
                  const owner = allUsers.find((u) => u.id === c.userId);
                  return (
                    <motion.div key={c.id} variants={item} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-card-foreground">{owner?.name || "Unknown"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "given" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {c.status}
                        </span>
                        <span className="text-xs text-muted-foreground">· {c.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(c.timestamp).toLocaleString()}</p>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ========== AUDIT LOG TAB ========== */}
          {tab === "audit" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Audit Log</h2>
              {auditLog.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No audit entries yet.</p>
                </div>
              ) : (
                auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((e) => (
                  <motion.div key={e.id} variants={item} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-card-foreground">{e.userName}</span>
                      <span className="text-muted-foreground"> — {e.action}</span>
                      {e.target && <span className="text-xs text-muted-foreground"> (target: {e.target})</span>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</span>
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
