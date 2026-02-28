import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Plus, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getOrphanRequests, OrphanRequest } from "@/lib/mockData";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  assigned: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
};

export default function OrphanDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<OrphanRequest[]>([]);

  useEffect(() => {
    setRequests(getOrphanRequests().filter((r) => r.userId === user?.id));
  }, [user]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">CareNest</span>
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">Orphan</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Welcome, {user?.name}</h1>
              <p className="text-muted-foreground text-sm">Manage your support requests</p>
            </div>
            <Link to="/orphan-request/new">
              <Button variant="hero" size="lg" className="gap-2">
                <Plus className="w-5 h-5" /> New Request
              </Button>
            </Link>
          </div>

          <h2 className="text-lg font-bold font-display mb-4 text-foreground">Your Support Requests</h2>
          {requests.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support requests yet. Submit your first request.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.supportTypes.map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{r.description}</p>
                      {r.assignedNGO && (
                        <p className="text-xs text-primary mt-2 font-medium">NGO Assigned ✓</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
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
