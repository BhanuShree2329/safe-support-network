import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle, Star, Calendar, AlertTriangle, Award, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCareRequests, updateCareRequest, type CareRequest, type Priority,
  getCaretakerProfile, logAttendance, addRejectionReason, addFeedback,
  issueCompletionCert, addPaymentRecord, type CaretakerProfile,
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

type TabId = "requests" | "profile" | "payments" | "certs";

export default function CaretakerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [profile, setProfile] = useState<CaretakerProfile | null>(null);
  const [tab, setTab] = useState<TabId>("requests");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = () => {
    const all = getCareRequests();
    setRequests(all.filter((r) => r.assignedTo === user?.id || r.status === "approved"));
    if (user) setProfile(getCaretakerProfile(user.id));
  };

  useEffect(() => { load(); }, [user]);

  const handleAccept = (id: string) => {
    updateCareRequest(id, { status: "assigned", assignedTo: user?.id, careLifecycle: "under_care" });
    toast({ title: "Request accepted" });
    load();
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      toast({ title: "Reason required", variant: "destructive" });
      return;
    }
    addRejectionReason(user?.id || "", id, rejectReason);
    toast({ title: "Request rejected with reason" });
    setRejectingId(null);
    setRejectReason("");
    load();
  };

  const handleComplete = (req: CareRequest) => {
    updateCareRequest(req.id, { status: "completed", careLifecycle: "completed" });
    issueCompletionCert(user?.id || "", req.id, req.elderName, `${new Date(req.createdAt).toLocaleDateString()} - ${new Date().toLocaleDateString()}`);
    addPaymentRecord(user?.id || "", req.id, 500);
    toast({ title: "Marked as completed. Certificate issued!" });
    load();
  };

  const handleAttendance = () => {
    logAttendance(user?.id || "");
    toast({ title: "Attendance logged for today ✓" });
    load();
  };

  const todayAttended = profile?.attendanceLog.find(a => a.date === new Date().toISOString().split("T")[0]);

  const tabs = [
    { id: "requests" as TabId, label: "Requests" },
    { id: "profile" as TabId, label: "My Profile" },
    { id: "payments" as TabId, label: "Payments" },
    { id: "certs" as TabId, label: "Certificates" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-sm mb-4">
            {user?.status === "pending" ? "⏳ Your account is pending admin approval." : "View and manage assigned care requests."}
          </p>

          {user?.status === "pending" ? (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-8 text-center">
              <ClipboardList className="w-12 h-12 text-warning mx-auto mb-4" />
              <p className="text-warning font-medium">Your account is awaiting admin approval.</p>
            </div>
          ) : (
            <>
              {/* Trust Score & Attendance Bar */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 flex-1 min-w-[200px]">
                  <Star className="w-6 h-6 text-warning" />
                  <div>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                    <p className="text-xl font-bold text-card-foreground">{profile?.trustScore ?? 50}<span className="text-sm text-muted-foreground">/100</span></p>
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 flex-1 min-w-[200px]">
                  <Award className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Completed Tasks</p>
                    <p className="text-xl font-bold text-card-foreground">{profile?.completedTasks ?? 0}</p>
                  </div>
                </div>
                <Button variant={todayAttended ? "secondary" : "hero"} size="lg" className="gap-2" onClick={handleAttendance} disabled={!!todayAttended}>
                  <Calendar className="w-5 h-5" /> {todayAttended ? "Attended ✓" : "Log Attendance"}
                </Button>
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

              {tab === "requests" && (
                <>
                  <h2 className="text-lg font-bold font-display mb-4 text-foreground">Available & Assigned Requests</h2>
                  {requests.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                      <p className="text-muted-foreground">No requests available at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((r) => (
                        <div key={r.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-card-foreground">{r.helpType}</h3>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{r.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">{r.elderName} · {r.location} · Age {r.age}</p>
                              {r.medicalAlerts && r.medicalAlerts.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {r.medicalAlerts.map(m => (
                                    <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{m}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {r.status === "approved" && (
                                <>
                                  <Button size="sm" variant="hero" onClick={() => handleAccept(r.id)}>Accept</Button>
                                  {rejectingId === r.id ? (
                                    <div className="space-y-2">
                                      <Input placeholder="Reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="text-xs h-8" />
                                      <div className="flex gap-1">
                                        <Button size="sm" variant="destructive" onClick={() => handleReject(r.id)} className="text-xs h-7">Submit</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)} className="text-xs h-7"><X className="w-3 h-3" /></Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => setRejectingId(r.id)} className="text-xs">Reject</Button>
                                  )}
                                </>
                              )}
                              {r.status === "assigned" && r.assignedTo === user?.id && (
                                <Button size="sm" variant="default" onClick={() => handleComplete(r)} className="gap-1">
                                  <CheckCircle className="w-4 h-4" /> Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "profile" && profile && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-display text-foreground">Caretaker Profile</h2>
                  <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><p className="text-xs text-muted-foreground">Trust Score</p><p className="text-lg font-bold text-card-foreground">{profile.trustScore}</p></div>
                      <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-lg font-bold text-card-foreground">{profile.completedTasks}</p></div>
                      <div><p className="text-xs text-muted-foreground">Avg Feedback</p><p className="text-lg font-bold text-card-foreground">{profile.feedbackCount > 0 ? (profile.totalFeedbackScore / profile.feedbackCount).toFixed(1) : "N/A"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Violations</p><p className="text-lg font-bold text-destructive">{profile.violations.length}</p></div>
                    </div>
                    {profile.violations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-card-foreground mb-2">Violations</p>
                        {profile.violations.map(v => (
                          <div key={v.id} className="text-xs text-destructive bg-destructive/5 rounded p-2 mb-1 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> {v.type}: {v.description} ({new Date(v.date).toLocaleDateString()})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === "payments" && profile && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-display text-foreground">Payment Records</h2>
                  {profile.paymentRecords.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-8 text-center">
                      <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No payment records yet.</p>
                    </div>
                  ) : (
                    profile.paymentRecords.map(p => (
                      <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">₹{p.amount}</p>
                          <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${p.status === "paid" ? "bg-success/10 text-success" : p.status === "disputed" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                          {p.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "certs" && profile && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-display text-foreground">Completion Certificates</h2>
                  {profile.completionCerts.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-8 text-center">
                      <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No certificates yet. Complete care tasks to earn certificates.</p>
                    </div>
                  ) : (
                    profile.completionCerts.map(c => (
                      <div key={c.id} className="bg-card rounded-xl border border-primary/20 p-4 flex items-center gap-3">
                        <Award className="w-8 h-8 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-card-foreground">Care for {c.elderName}</p>
                          <p className="text-xs text-muted-foreground">{c.period}</p>
                          <p className="text-xs text-muted-foreground">Issued: {new Date(c.issuedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
