import type { User, SecurityAlert } from "@/contexts/AuthContext";

export interface CareRequest {
  id: string;
  elderName: string;
  age: number;
  location: string;
  helpType: string;
  description: string;
  status: "pending" | "approved" | "assigned" | "completed";
  assignedTo?: string;
  createdAt: string;
  userId: string;
}

export interface OrphanRequest {
  id: string;
  name: string;
  age: number;
  guardian?: string;
  supportTypes: string[];
  description: string;
  status: "pending" | "approved" | "assigned" | "completed";
  assignedNGO?: string;
  createdAt: string;
  userId: string;
}

const CARE_KEY = "careconnect_care_requests";
const ORPHAN_KEY = "careconnect_orphan_requests";
const USERS_KEY = "careconnect_users";
const SECURITY_ALERTS_KEY = "careconnect_security_alerts";

// --- Care Requests ---
export function getCareRequests(): CareRequest[] {
  return JSON.parse(localStorage.getItem(CARE_KEY) || "[]");
}

export function saveCareRequest(req: CareRequest) {
  const list = getCareRequests();
  list.push(req);
  localStorage.setItem(CARE_KEY, JSON.stringify(list));
}

export function updateCareRequest(id: string, updates: Partial<CareRequest>) {
  const list = getCareRequests().map((r) => (r.id === id ? { ...r, ...updates } : r));
  localStorage.setItem(CARE_KEY, JSON.stringify(list));
}

// --- Orphan Requests ---
export function getOrphanRequests(): OrphanRequest[] {
  return JSON.parse(localStorage.getItem(ORPHAN_KEY) || "[]");
}

export function saveOrphanRequest(req: OrphanRequest) {
  const list = getOrphanRequests();
  list.push(req);
  localStorage.setItem(ORPHAN_KEY, JSON.stringify(list));
}

export function updateOrphanRequest(id: string, updates: Partial<OrphanRequest>) {
  const list = getOrphanRequests().map((r) => (r.id === id ? { ...r, ...updates } : r));
  localStorage.setItem(ORPHAN_KEY, JSON.stringify(list));
}

// --- Users ---
export function getAllUsers(): User[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function updateUserStatus(userId: string, status: "approved" | "rejected" | "suspended") {
  const users = getAllUsers().map((u) => (u.id === userId ? { ...u, status } : u));
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const current = JSON.parse(localStorage.getItem("careconnect_user") || "null");
  if (current && current.id === userId) {
    localStorage.setItem("careconnect_user", JSON.stringify({ ...current, status }));
  }
}

export function suspendUser(userId: string) {
  updateUserStatus(userId, "suspended");
}

export function unsuspendUser(userId: string) {
  updateUserStatus(userId, "approved");
}

// --- Security Alerts ---
export function getSecurityAlerts(): SecurityAlert[] {
  return JSON.parse(localStorage.getItem(SECURITY_ALERTS_KEY) || "[]");
}

export function resolveSecurityAlert(alertId: string) {
  const alerts = getSecurityAlerts().map((a) =>
    a.id === alertId ? { ...a, resolved: true } : a
  );
  localStorage.setItem(SECURITY_ALERTS_KEY, JSON.stringify(alerts));
}

// --- Audit Log ---
export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target?: string;
  timestamp: string;
}

const AUDIT_KEY = "careconnect_audit_log";

export function getAuditLog(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
}

export function addAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const log = getAuditLog();
  log.push({
    ...entry,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
}
