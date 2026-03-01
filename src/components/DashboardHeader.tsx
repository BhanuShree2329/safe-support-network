import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const roleBadges: Record<string, { label: string; classes: string }> = {
  elder: { label: "Elder", classes: "bg-destructive/10 text-destructive" },
  caretaker: { label: "Caretaker", classes: "bg-info/10 text-info" },
  ngo: { label: "NGO", classes: "bg-warning/10 text-warning" },
  admin: { label: "Admin", classes: "bg-primary/10 text-primary" },
  orphan: { label: "Orphan", classes: "bg-accent/10 text-accent" },
};

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const badge = roleBadges[user?.role || "elder"];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">CareConnect</span>
          </Link>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.classes}`}>{badge.label}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }}>
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
