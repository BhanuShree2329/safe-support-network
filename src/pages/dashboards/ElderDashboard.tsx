import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, FileText, ShieldAlert, AlertTriangle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCareRequests, updateCareRequest, type CareRequest, type Priority } from "@/lib/mockData";
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

const riskColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

export default function ElderDashboard() {
  const { user, addConsentRecord } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CareRequest[]>([]);

  const load = () => setRequests(getCareRequests().filter((r) => r.userId === user?.id));
  useEffect(() => { load(); }, [user]);

  const withdrawConsent = (req: CareRequest) => {
    updateCareRequest(req.id, { consentStatus: "withdrawn", careLifecycle: "completed", status: "completed" });
    addConsentRecord("care_request", `Consent withdrawn for care request: ${req.helpType}`, "withdrawn");
    toast({ title: "Consent withdrawn", description: "All care actions have been stopped." });
    load();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Welcome, {user?.name}</h1>
              <p className="text-muted-foreground text-sm">Manage your care requests & consent</p>
            </div>
            <Link to="/care-request/new">
              <Button variant="hero" size="lg" className="gap-2"><Plus className="w-5 h-5" /> New Request</Button>
            </Link>
          </div>

          <h2 className="text-lg font-bold font-display mb-4 text-foreground">Your Care Requests</h2>
          {requests.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No care requests yet. Submit your first request.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-card-foreground">{r.helpType}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">{r.location} · {new Date(r.createdAt).toLocaleDateString()}</span>
                        <span className={`text-xs font-medium ${riskColors[r.riskLevel]}`}>Risk: {r.riskLevel}</span>
                        <span className="text-xs text-muted-foreground capitalize">Lifecycle: {r.careLifecycle?.replace("_", " ")}</span>
                      </div>
                      {r.medicalAlerts && r.medicalAlerts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.medicalAlerts.map(m => (
                            <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />{m}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.consentStatus === "withdrawn" && (
                        <p className="text-xs text-destructive mt-2 font-medium flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Consent Withdrawn
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {r.consentStatus === "active" && r.status !== "completed" && (
                        <Button size="sm" variant="destructive" onClick={() => withdrawConsent(r)} className="text-xs">
                          Withdraw Consent
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
