import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCareRequests, updateCareRequest, CareRequest } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  assigned: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
};

export default function CaretakerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CareRequest[]>([]);

  const load = () => {
    const all = getCareRequests();
    setRequests(all.filter((r) => r.assignedTo === user?.id || r.status === "approved"));
  };

  useEffect(() => { load(); }, [user]);

  const handleAccept = (id: string) => {
    updateCareRequest(id, { status: "assigned", assignedTo: user?.id });
    toast({ title: "Request accepted" });
    load();
  };

  const handleComplete = (id: string) => {
    updateCareRequest(id, { status: "completed" });
    toast({ title: "Marked as completed" });
    load();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-sm mb-8">
            {user?.status === "pending" ? "⏳ Your account is pending admin approval." : "View and manage assigned care requests."}
          </p>

          {user?.status === "pending" ? (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-8 text-center">
              <ClipboardList className="w-12 h-12 text-warning mx-auto mb-4" />
              <p className="text-warning font-medium">Your account is awaiting admin approval.</p>
            </div>
          ) : (
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
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-card-foreground">{r.helpType}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{r.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{r.elderName} · {r.location}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {r.status === "approved" && (
                            <Button size="sm" variant="hero" onClick={() => handleAccept(r.id)}>Accept</Button>
                          )}
                          {r.status === "assigned" && r.assignedTo === user?.id && (
                            <Button size="sm" variant="default" onClick={() => handleComplete(r.id)} className="gap-1">
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
        </motion.div>
      </div>
    </div>
  );
}
