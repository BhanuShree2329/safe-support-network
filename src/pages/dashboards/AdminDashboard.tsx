import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart, Users, CheckCircle, XCircle, FileText, Building2, ShieldAlert, Ban,
  RotateCcw, Clock, AlertTriangle, ScrollText, Info, X, Link2, Star, Eye,
  Trash2, RefreshCw, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { User, ConsentRecord, SecurityAlert } from "@/contexts/AuthContext";
import {
  getAllUsers, updateUserStatus, getCareRequests, getOrphanRequests,
  updateCareRequest, updateOrphanRequest, suspendUser, unsuspendUser,
  getSecurityAlerts, resolveSecurityAlert, getAuditLog, addAuditEntry,
  getUserById, matchNGOForRequest, getWellBeingReminders, acknowledgeWellBeing,
  getDeletedRecords, restoreCareRequest, restoreOrphanRequest,
  softDeleteCareRequest, softDeleteOrphanRequest,
  verifyNGO, getNGOProfile, getCaretakerProfile, addCaretakerViolation,
  type CareRequest, type OrphanRequest, type AuditEntry, type Priority,
} from "@/lib/mockData";
import { Input } from "@/components/ui/form-elements";
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

const priorityConfig: Record<Priority, { color: string; border: string; bg: string; icon: string }> = {
  LOW: { color: "text-success", border: "border-success/30", bg: "bg-success/5", icon: "🟢" },
  MEDIUM: { color: "text-warning", border: "border-warning/30", bg: "bg-warning/5", icon: "🟡" },
  HIGH: { color: "text-accent", border: "border-accent/30", bg: "bg-accent/5", icon: "🟠" },
  SEVERE: { color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5", icon: "🔴" },
};

type TabId = "priority" | "users" | "care" | "orphan" | "security" | "consent" | "audit" | "wellbeing" | "deleted";

// Profile modal component
function ProfileModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const user = getUserById(userId);
  if (!user) return null;
  const isCaretaker = user.role === "caretaker";
  const isNGO = user.role === "ngo";
  const caretakerProfile = isCaretaker ? getCaretakerProfile(userId) : null;
  const ngoProfile = isNGO ? getNGOProfile(userId) : null;

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-display text-card-foreground">User Profile</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium text-card-foreground">{user.name}</p></div>
            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-card-foreground">{user.email}</p></div>
            <div><p className="text-xs text-muted-foreground">Role</p><p className="font-medium text-card-foreground capitalize">{user.role}</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p><p className={`font-medium capitalize ${statusBadge[user.status]?.includes("success") ? "text-success" : "text-card-foreground"}`}>{user.status}</p></div>
            <div><p className="text-xs text-muted-foreground">Registered</p><p className="text-sm text-card-foreground">{new Date(user.createdAt).toLocaleDateString()}</p></div>
            {user.lastLogin && <div><p className="text-xs text-muted-foreground">Last Login</p><p className="text-sm text-card-foreground">{new Date(user.lastLogin).toLocaleString()}</p></div>}
            {user.loginDevice && <div><p className="text-xs text-muted-foreground">Device</p><p className="text-sm text-card-foreground">{user.loginDevice}</p></div>}
            <div><p className="text-xs text-muted-foreground">Failed Attempts</p><p className="text-sm text-card-foreground">{user.failedAttempts}</p></div>
          </div>
          {caretakerProfile && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm font-bold text-card-foreground mb-2">Caretaker Stats</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-card-foreground">{caretakerProfile.trustScore}</p>
                  <p className="text-xs text-muted-foreground">Trust Score</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-card-foreground">{caretakerProfile.completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-destructive">{caretakerProfile.violations.length}</p>
                  <p className="text-xs text-muted-foreground">Violations</p>
                </div>
              </div>
            </div>
          )}
          {ngoProfile && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm font-bold text-card-foreground mb-2">NGO Stats</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-card-foreground">{ngoProfile.currentOccupancy}/{ngoProfile.capacity}</p>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className={`text-lg font-bold ${ngoProfile.verified ? "text-success" : "text-warning"}`}>{ngoProfile.verified ? "Yes" : "No"}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-card-foreground">{ngoProfile.complianceChecklist.filter(c => c.met).length}/{ngoProfile.complianceChecklist.length}</p>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                </div>
              </div>
            </div>
          )}
          {user.activityLog && user.activityLog.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm font-bold text-card-foreground mb-2">Recent Activity</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {user.activityLog.slice(-10).reverse().map((a, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    {a.action} {a.device && `(${a.device})`} — {new Date(a.timestamp).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// NGO Link modal
function NGOLinkModal({ request, type, onClose, onLink }: {
  request: CareRequest | OrphanRequest;
  type: "care" | "orphan";
  onClose: () => void;
  onLink: (ngoId: string) => void;
}) {
  const matches = matchNGOForRequest((request as CareRequest).helpType || "general");
  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border shadow-elevated max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-display text-card-foreground">Link to NGO</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {matches.length === 0 ? (
          <p className="text-muted-foreground text-sm">No verified NGOs with capacity available.</p>
        ) : (
          <div className="space-y-2">
            {matches.map(m => (
              <div key={m.userId} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Suitability Score: {m.score}</p>
                </div>
                <Button size="sm" variant="hero" onClick={() => { onLink(m.userId); onClose(); }}>Link</Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, getConsentHistory } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [careReqs, setCareReqs] = useState<CareRequest[]>([]);
  const [orphanReqs, setOrphanReqs] = useState<OrphanRequest[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [tab, setTab] = useState<TabId>("priority");
  const [profileModal, setProfileModal] = useState<string | null>(null);
  const [ngoLinkModal, setNgoLinkModal] = useState<{ request: any; type: "care" | "orphan" } | null>(null);
  const [wellBeingReminders, setWellBeingReminders] = useState<CareRequest[]>([]);

  const load = () => {
    setAllUsers(getAllUsers());
    setCareReqs(getCareRequests());
    setOrphanReqs(getOrphanRequests());
    setAlerts(getSecurityAlerts());
    setConsentRecords(getConsentHistory());
    setAuditLog(getAuditLog());
    setWellBeingReminders(getWellBeingReminders());
  };

  useEffect(() => { load(); }, []);

  const pendingUsers = allUsers.filter((u) => u.status === "pending");
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  const handleUserAction = (userId: string, status: "approved" | "rejected") => {
    updateUserStatus(userId, status);
    const u = getUserById(userId);
    if (status === "approved" && u?.role === "ngo") verifyNGO(userId);
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

  const handleLinkNGO = (requestId: string, ngoId: string, type: "care" | "orphan") => {
    if (type === "care") {
      updateCareRequest(requestId, { assignedNGO: ngoId });
    } else {
      updateOrphanRequest(requestId, { assignedNGO: ngoId });
    }
    addAuditEntry({ userId: user?.id || "", userName: user?.name || "", action: `Linked ${type} request to NGO`, target: `${requestId} -> ${ngoId}` });
    toast({ title: "NGO linked successfully" });
    load();
  };

  const handleSoftDelete = (id: string, type: "care" | "orphan") => {
    if (type === "care") softDeleteCareRequest(id);
    else softDeleteOrphanRequest(id);
    toast({ title: "Record soft-deleted" });
    load();
  };

  const handleRestore = (id: string, type: "care" | "orphan") => {
    if (type === "care") restoreCareRequest(id);
    else restoreOrphanRequest(id);
    toast({ title: "Record restored" });
    load();
  };

  // Group requests by priority
  const careByPriority = (p: Priority) => careReqs.filter(r => r.priority === p);
  const orphanByPriority = (p: Priority) => orphanReqs.filter(r => r.priority === p);

  const deletedRecords = getDeletedRecords();

  const tabs: { id: TabId; label: string; count: number; icon: React.ElementType }[] = [
    { id: "priority", label: "Priority", count: careReqs.filter(r => r.priority === "SEVERE" || r.priority === "HIGH").length + orphanReqs.filter(r => r.priority === "SEVERE" || r.priority === "HIGH").length, icon: AlertTriangle },
    { id: "users", label: "Users", count: pendingUsers.length, icon: Users },
    { id: "care", label: "Care", count: careReqs.length, icon: Heart },
    { id: "orphan", label: "Orphan", count: orphanReqs.length, icon: Building2 },
    { id: "wellbeing", label: "Well-being", count: wellBeingReminders.length, icon: Bell },
    { id: "security", label: "Security", count: unresolvedAlerts.length, icon: ShieldAlert },
    { id: "consent", label: "Consent", count: consentRecords.length, icon: ScrollText },
    { id: "audit", label: "Audit", count: auditLog.length, icon: Clock },
    { id: "deleted", label: "Deleted", count: deletedRecords.careRequests.length + deletedRecords.orphanRequests.length, icon: Trash2 },
  ];

  const renderRequestCard = (r: CareRequest | OrphanRequest, type: "care" | "orphan") => {
    const isCare = type === "care";
    const care = r as CareRequest;
    const orphan = r as OrphanRequest;
    const p = priorityConfig[r.priority] || priorityConfig.LOW;
    const ngoUser = (isCare ? care.assignedNGO : orphan.assignedNGO) ? getUserById((isCare ? care.assignedNGO : orphan.assignedNGO)!) : null;

    return (
      <motion.div key={r.id} variants={item}
        className={`rounded-2xl border p-5 shadow-card ${p.bg} ${p.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm">{p.icon}</span>
              <h3 className="font-bold text-card-foreground">
                {isCare ? `${care.elderName} — ${care.helpType}` : `${orphan.name}, age ${orphan.age}`}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.color} ${p.bg}`}>{r.priority}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[r.status] || "bg-muted text-muted-foreground"}`}>{r.status}</span>
            </div>
            {isCare && care.medicalAlerts && care.medicalAlerts.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {care.medicalAlerts.map(m => (
                  <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{m}</span>
                ))}
              </div>
            )}
            {!isCare && (
              <div className="flex flex-wrap gap-1 mb-1">
                {orphan.supportTypes.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">{r.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isCare && `${care.location} · Age ${care.age} · Risk: ${care.riskLevel}`}
              {!isCare && orphan.guardian && `Guardian: ${orphan.guardian}`}
              {ngoUser && ` · NGO: ${ngoUser.name}`}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setProfileModal(r.userId)} className="gap-1 text-xs h-7">
              <Info className="w-3.5 h-3.5" /> Info
            </Button>
            {r.status === "pending" && (
              <Button size="sm" variant="hero" onClick={() => isCare ? handleCareApprove(r.id) : handleOrphanApprove(r.id)} className="text-xs h-7">
                Approve
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setNgoLinkModal({ request: r, type })} className="gap-1 text-xs h-7">
              <Link2 className="w-3.5 h-3.5" /> Link NGO
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleSoftDelete(r.id, type)} className="gap-1 text-xs h-7 text-destructive">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
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

          {/* ========== PRIORITY TAB ========== */}
          {tab === "priority" && (
            <div className="space-y-8">
              {(["SEVERE", "HIGH", "MEDIUM", "LOW"] as Priority[]).map(priority => {
                const carePriority = careByPriority(priority);
                const orphanPriority = orphanByPriority(priority);
                const total = carePriority.length + orphanPriority.length;
                const config = priorityConfig[priority];
                return (
                  <motion.div key={priority} variants={container} initial="hidden" animate="show">
                    <div className={`flex items-center gap-3 mb-4 pb-2 border-b-2 ${config.border}`}>
                      <span className="text-xl">{config.icon}</span>
                      <h2 className={`text-lg font-bold font-display ${config.color}`}>{priority} Priority</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.color}`}>{total} issues</span>
                    </div>
                    {total === 0 ? (
                      <div className="bg-card rounded-2xl border border-border p-6 text-center">
                        <p className="text-muted-foreground text-sm">No {priority.toLowerCase()} priority issues.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {carePriority.map(r => renderRequestCard(r, "care"))}
                        {orphanPriority.map(r => renderRequestCard(r, "orphan"))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ========== USERS TAB ========== */}
          {tab === "users" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
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
                            <Button size="sm" variant="ghost" onClick={() => setProfileModal(u.id)} className="gap-1">
                              <Info className="w-4 h-4" /> Info
                            </Button>
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
                        <Button size="sm" variant="ghost" onClick={() => setProfileModal(u.id)} className="gap-1">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
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
              ) : careReqs.map(r => renderRequestCard(r, "care"))}
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
              ) : orphanReqs.map(r => renderRequestCard(r, "orphan"))}
            </motion.div>
          )}

          {/* ========== WELL-BEING TAB ========== */}
          {tab === "wellbeing" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Well-being Check Reminders</h2>
              {wellBeingReminders.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <Bell className="w-10 h-10 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">All well-being checks are up to date.</p>
                </div>
              ) : wellBeingReminders.map(r => (
                <motion.div key={r.id} variants={item} className="bg-warning/5 rounded-2xl border border-warning/20 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-card-foreground">{r.elderName} — {r.helpType}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Last checked: {r.wellBeingLastChecked ? new Date(r.wellBeingLastChecked).toLocaleDateString() : "Never"}</p>
                      <p className="text-xs text-muted-foreground">Assigned caretaker: {r.assignedTo ? getUserById(r.assignedTo)?.name || "Unknown" : "None"}</p>
                    </div>
                    <Button size="sm" variant="default" onClick={() => { acknowledgeWellBeing(r.id); load(); }}>
                      Mark Checked
                    </Button>
                  </div>
                </motion.div>
              ))}
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
              ) : alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((a) => (
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
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setProfileModal(a.userId)} className="gap-1 text-xs">
                        <Info className="w-3.5 h-3.5" /> Info
                      </Button>
                      {!a.resolved && (
                        <Button size="sm" variant="outline" onClick={() => handleResolveAlert(a.id)}>Resolve</Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
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
              ) : consentRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((c) => {
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
              })}
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
              ) : auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((e) => (
                <motion.div key={e.id} variants={item} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-card-foreground">{e.userName}</span>
                    <span className="text-muted-foreground"> — {e.action}</span>
                    {e.target && <span className="text-xs text-muted-foreground"> (target: {e.target})</span>}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ========== DELETED TAB ========== */}
          {tab === "deleted" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Soft-Deleted Records (Recoverable)</h2>
              {deletedRecords.careRequests.length === 0 && deletedRecords.orphanRequests.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <Trash2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No deleted records.</p>
                </div>
              ) : (
                <>
                  {deletedRecords.careRequests.map(r => (
                    <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between opacity-70">
                      <div>
                        <p className="font-medium text-card-foreground">{r.elderName} — {r.helpType}</p>
                        <p className="text-xs text-muted-foreground">Care Request · {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleRestore(r.id, "care")} className="gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Restore
                      </Button>
                    </div>
                  ))}
                  {deletedRecords.orphanRequests.map(r => (
                    <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between opacity-70">
                      <div>
                        <p className="font-medium text-card-foreground">{r.name} — Orphan Support</p>
                        <p className="text-xs text-muted-foreground">Orphan Request · {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleRestore(r.id, "orphan")} className="gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Restore
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {profileModal && <ProfileModal userId={profileModal} onClose={() => setProfileModal(null)} />}
      {ngoLinkModal && (
        <NGOLinkModal
          request={ngoLinkModal.request}
          type={ngoLinkModal.type}
          onClose={() => setNgoLinkModal(null)}
          onLink={(ngoId) => handleLinkNGO(ngoLinkModal.request.id, ngoId, ngoLinkModal.type)}
        />
      )}
    </div>
  );
}
