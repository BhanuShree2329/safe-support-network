import type { User, SecurityAlert } from "@/contexts/AuthContext";

// ─── Priority & Risk Types ──────────────────────────────
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "SEVERE";
export type RiskLevel = "low" | "medium" | "high";
export type CareLifecycle = "registered" | "under_care" | "transferred" | "completed";
export type ConsentStatus = "active" | "withdrawn" | "expired";

// ─── Care Requests ──────────────────────────────────────
export interface CareRequest {
  id: string;
  elderName: string;
  age: number;
  location: string;
  helpType: string;
  description: string;
  status: "pending" | "approved" | "assigned" | "completed";
  priority: Priority;
  riskLevel: RiskLevel;
  careLifecycle: CareLifecycle;
  consentStatus: ConsentStatus;
  medicalAlerts: string[];
  emergencyContact?: string;
  assignedTo?: string;
  assignedNGO?: string;
  wellBeingLastChecked?: string;
  wellBeingReminder?: boolean;
  createdAt: string;
  userId: string;
  deleted?: boolean;
}

// ─── Orphan Requests ────────────────────────────────────
export interface OrphanRequest {
  id: string;
  name: string;
  age: number;
  guardian?: string;
  supportTypes: string[];
  description: string;
  status: "pending" | "approved" | "assigned" | "completed";
  priority: Priority;
  anonymized?: boolean;
  assignedNGO?: string;
  adoptionStage?: "applied" | "verified" | "approved" | "cooling_off" | "finalized";
  coolingOffUntil?: string;
  createdAt: string;
  userId: string;
  deleted?: boolean;
}

// ─── Caretaker Data ─────────────────────────────────────
export interface CaretakerProfile {
  userId: string;
  trustScore: number; // 0-100
  completedTasks: number;
  totalFeedbackScore: number;
  feedbackCount: number;
  attendanceLog: { date: string; acknowledged: boolean }[];
  violations: { id: string; type: string; description: string; date: string }[];
  paymentRecords: { id: string; amount: number; status: "pending" | "eligible" | "paid" | "disputed"; careRequestId: string; date: string }[];
  completionCerts: { id: string; careRequestId: string; elderName: string; period: string; issuedAt: string }[];
  rejectionReasons: { careRequestId: string; reason: string; date: string }[];
}

// ─── NGO Data ───────────────────────────────────────────
export interface NGOProfile {
  userId: string;
  verified: boolean;
  capacity: number;
  currentOccupancy: number;
  complianceChecklist: { item: string; met: boolean }[];
  performanceStats: { adoptionsCompleted: number; elderlyCaredFor: number; transfersHandled: number };
  transferRequests: { id: string; type: "incoming" | "outgoing"; fromNGO?: string; toNGO?: string; subjectName: string; status: "pending" | "approved" | "rejected"; date: string }[];
}

// ─── Audit Entry ────────────────────────────────────────
export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target?: string;
  timestamp: string;
}

// ─── Storage Keys ───────────────────────────────────────
const CARE_KEY = "careconnect_care_requests";
const ORPHAN_KEY = "careconnect_orphan_requests";
const USERS_KEY = "careconnect_users";
const SECURITY_ALERTS_KEY = "careconnect_security_alerts";
const AUDIT_KEY = "careconnect_audit_log";
const CARETAKER_KEY = "careconnect_caretaker_profiles";
const NGO_KEY = "careconnect_ngo_profiles";
const DELETED_KEY = "careconnect_deleted_records";

// ─── Priority Auto-Assignment (Backend Simulation) ──────
export function assignPriority(age: number, helpType: string, medicalAlerts: string[], description: string): Priority {
  const desc = description.toLowerCase();
  if (medicalAlerts.length >= 3 || age >= 85 || desc.includes("emergency") || desc.includes("critical") || desc.includes("severe")) return "SEVERE";
  if (medicalAlerts.length >= 2 || age >= 75 || helpType === "Medical Assistance" || desc.includes("urgent")) return "HIGH";
  if (age >= 65 || medicalAlerts.length >= 1 || helpType === "Physical Therapy") return "MEDIUM";
  return "LOW";
}

export function assignOrphanPriority(age: number, supportTypes: string[], description: string): Priority {
  const desc = description.toLowerCase();
  if (supportTypes.length >= 3 || desc.includes("emergency") || desc.includes("critical") || age <= 3) return "SEVERE";
  if (supportTypes.length >= 2 || supportTypes.includes("Medical") || desc.includes("urgent") || age <= 6) return "HIGH";
  if (supportTypes.includes("Shelter") || age <= 10) return "MEDIUM";
  return "LOW";
}

export function classifyRisk(age: number, medicalAlerts: string[]): RiskLevel {
  if (age >= 80 || medicalAlerts.length >= 3) return "high";
  if (age >= 70 || medicalAlerts.length >= 1) return "medium";
  return "low";
}

// ─── Care Requests CRUD ─────────────────────────────────
export function getCareRequests(): CareRequest[] {
  return (JSON.parse(localStorage.getItem(CARE_KEY) || "[]") as CareRequest[]).filter(r => !r.deleted);
}

export function getAllCareRequestsIncludeDeleted(): CareRequest[] {
  return JSON.parse(localStorage.getItem(CARE_KEY) || "[]");
}

export function saveCareRequest(req: CareRequest) {
  const list = getAllCareRequestsIncludeDeleted();
  list.push(req);
  localStorage.setItem(CARE_KEY, JSON.stringify(list));
}

export function updateCareRequest(id: string, updates: Partial<CareRequest>) {
  const list = getAllCareRequestsIncludeDeleted().map((r) => (r.id === id ? { ...r, ...updates } : r));
  localStorage.setItem(CARE_KEY, JSON.stringify(list));
}

export function softDeleteCareRequest(id: string) {
  updateCareRequest(id, { deleted: true });
}

export function restoreCareRequest(id: string) {
  updateCareRequest(id, { deleted: false });
}

// ─── Orphan Requests CRUD ───────────────────────────────
export function getOrphanRequests(): OrphanRequest[] {
  return (JSON.parse(localStorage.getItem(ORPHAN_KEY) || "[]") as OrphanRequest[]).filter(r => !r.deleted);
}

export function getAllOrphanRequestsIncludeDeleted(): OrphanRequest[] {
  return JSON.parse(localStorage.getItem(ORPHAN_KEY) || "[]");
}

export function saveOrphanRequest(req: OrphanRequest) {
  const list = getAllOrphanRequestsIncludeDeleted();
  list.push(req);
  localStorage.setItem(ORPHAN_KEY, JSON.stringify(list));
}

export function updateOrphanRequest(id: string, updates: Partial<OrphanRequest>) {
  const list = getAllOrphanRequestsIncludeDeleted().map((r) => (r.id === id ? { ...r, ...updates } : r));
  localStorage.setItem(ORPHAN_KEY, JSON.stringify(list));
}

export function softDeleteOrphanRequest(id: string) {
  updateOrphanRequest(id, { deleted: true });
}

export function restoreOrphanRequest(id: string) {
  updateOrphanRequest(id, { deleted: false });
}

// ─── Users ──────────────────────────────────────────────
export function getAllUsers(): User[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function getUserById(userId: string): User | undefined {
  return getAllUsers().find(u => u.id === userId);
}

export function updateUserStatus(userId: string, status: "approved" | "rejected" | "suspended") {
  const users = getAllUsers().map((u) => (u.id === userId ? { ...u, status } : u));
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const current = JSON.parse(localStorage.getItem("careconnect_user") || "null");
  if (current && current.id === userId) {
    localStorage.setItem("careconnect_user", JSON.stringify({ ...current, status }));
  }
}

export function suspendUser(userId: string) { updateUserStatus(userId, "suspended"); }
export function unsuspendUser(userId: string) { updateUserStatus(userId, "approved"); }

// ─── Security Alerts ────────────────────────────────────
export function getSecurityAlerts(): SecurityAlert[] {
  return JSON.parse(localStorage.getItem(SECURITY_ALERTS_KEY) || "[]");
}

export function resolveSecurityAlert(alertId: string) {
  const alerts = getSecurityAlerts().map((a) => a.id === alertId ? { ...a, resolved: true } : a);
  localStorage.setItem(SECURITY_ALERTS_KEY, JSON.stringify(alerts));
}

// ─── Audit Log ──────────────────────────────────────────
export function getAuditLog(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
}

export function addAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const log = getAuditLog();
  log.push({ ...entry, id: Date.now().toString(), timestamp: new Date().toISOString() });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
}

// ─── Caretaker Profiles ─────────────────────────────────
export function getCaretakerProfile(userId: string): CaretakerProfile {
  const profiles: CaretakerProfile[] = JSON.parse(localStorage.getItem(CARETAKER_KEY) || "[]");
  const existing = profiles.find(p => p.userId === userId);
  if (existing) return existing;
  const newProfile: CaretakerProfile = {
    userId,
    trustScore: 50,
    completedTasks: 0,
    totalFeedbackScore: 0,
    feedbackCount: 0,
    attendanceLog: [],
    violations: [],
    paymentRecords: [],
    completionCerts: [],
    rejectionReasons: [],
  };
  profiles.push(newProfile);
  localStorage.setItem(CARETAKER_KEY, JSON.stringify(profiles));
  return newProfile;
}

export function updateCaretakerProfile(userId: string, updates: Partial<CaretakerProfile>) {
  const profiles: CaretakerProfile[] = JSON.parse(localStorage.getItem(CARETAKER_KEY) || "[]");
  const idx = profiles.findIndex(p => p.userId === userId);
  if (idx >= 0) {
    profiles[idx] = { ...profiles[idx], ...updates };
  } else {
    profiles.push({ ...getCaretakerProfile(userId), ...updates });
  }
  localStorage.setItem(CARETAKER_KEY, JSON.stringify(profiles));
}

export function calculateTrustScore(profile: CaretakerProfile): number {
  let score = 50;
  score += Math.min(profile.completedTasks * 5, 25);
  if (profile.feedbackCount > 0) {
    const avgFeedback = profile.totalFeedbackScore / profile.feedbackCount;
    score += (avgFeedback - 3) * 5; // -10 to +10 based on 1-5 scale
  }
  score -= profile.violations.length * 10;
  const recentAttendance = profile.attendanceLog.slice(-30);
  const attendedDays = recentAttendance.filter(a => a.acknowledged).length;
  if (recentAttendance.length > 0) {
    score += (attendedDays / recentAttendance.length) * 15;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function logAttendance(userId: string) {
  const profile = getCaretakerProfile(userId);
  const today = new Date().toISOString().split("T")[0];
  if (!profile.attendanceLog.find(a => a.date === today)) {
    profile.attendanceLog.push({ date: today, acknowledged: true });
    profile.trustScore = calculateTrustScore(profile);
    updateCaretakerProfile(userId, profile);
  }
}

export function addCaretakerViolation(userId: string, type: string, description: string) {
  const profile = getCaretakerProfile(userId);
  profile.violations.push({ id: Date.now().toString(), type, description, date: new Date().toISOString() });
  profile.trustScore = calculateTrustScore(profile);
  updateCaretakerProfile(userId, profile);
}

export function addPaymentRecord(userId: string, careRequestId: string, amount: number) {
  const profile = getCaretakerProfile(userId);
  profile.paymentRecords.push({ id: Date.now().toString(), amount, status: "pending", careRequestId, date: new Date().toISOString() });
  updateCaretakerProfile(userId, profile);
}

export function updatePaymentStatus(userId: string, paymentId: string, status: "eligible" | "paid" | "disputed") {
  const profile = getCaretakerProfile(userId);
  const payment = profile.paymentRecords.find(p => p.id === paymentId);
  if (payment) {
    payment.status = status;
    updateCaretakerProfile(userId, profile);
  }
}

export function issueCompletionCert(userId: string, careRequestId: string, elderName: string, period: string) {
  const profile = getCaretakerProfile(userId);
  profile.completionCerts.push({ id: Date.now().toString(), careRequestId, elderName, period, issuedAt: new Date().toISOString() });
  profile.completedTasks += 1;
  profile.trustScore = calculateTrustScore(profile);
  updateCaretakerProfile(userId, profile);
}

export function addRejectionReason(userId: string, careRequestId: string, reason: string) {
  const profile = getCaretakerProfile(userId);
  profile.rejectionReasons.push({ careRequestId, reason, date: new Date().toISOString() });
  updateCaretakerProfile(userId, profile);
}

export function addFeedback(userId: string, score: number) {
  const profile = getCaretakerProfile(userId);
  profile.totalFeedbackScore += score;
  profile.feedbackCount += 1;
  profile.trustScore = calculateTrustScore(profile);
  updateCaretakerProfile(userId, profile);
}

// ─── NGO Profiles ───────────────────────────────────────
const DEFAULT_COMPLIANCE: { item: string; met: boolean }[] = [
  { item: "Registered with government", met: false },
  { item: "Annual audit completed", met: false },
  { item: "Staff background checks", met: false },
  { item: "Child protection policy", met: false },
  { item: "Financial transparency report", met: false },
  { item: "Facility safety inspection", met: false },
];

export function getNGOProfile(userId: string): NGOProfile {
  const profiles: NGOProfile[] = JSON.parse(localStorage.getItem(NGO_KEY) || "[]");
  const existing = profiles.find(p => p.userId === userId);
  if (existing) return existing;
  const newProfile: NGOProfile = {
    userId,
    verified: false,
    capacity: 50,
    currentOccupancy: 0,
    complianceChecklist: DEFAULT_COMPLIANCE.map(c => ({ ...c })),
    performanceStats: { adoptionsCompleted: 0, elderlyCaredFor: 0, transfersHandled: 0 },
    transferRequests: [],
  };
  profiles.push(newProfile);
  localStorage.setItem(NGO_KEY, JSON.stringify(profiles));
  return newProfile;
}

export function updateNGOProfile(userId: string, updates: Partial<NGOProfile>) {
  const profiles: NGOProfile[] = JSON.parse(localStorage.getItem(NGO_KEY) || "[]");
  const idx = profiles.findIndex(p => p.userId === userId);
  if (idx >= 0) {
    profiles[idx] = { ...profiles[idx], ...updates };
  } else {
    profiles.push({ ...getNGOProfile(userId), ...updates });
  }
  localStorage.setItem(NGO_KEY, JSON.stringify(profiles));
}

export function verifyNGO(userId: string) {
  updateNGOProfile(userId, { verified: true });
}

export function updateComplianceItem(userId: string, itemIndex: number, met: boolean) {
  const profile = getNGOProfile(userId);
  if (profile.complianceChecklist[itemIndex]) {
    profile.complianceChecklist[itemIndex].met = met;
    updateNGOProfile(userId, { complianceChecklist: profile.complianceChecklist });
  }
}

export function addTransferRequest(userId: string, request: Omit<NGOProfile["transferRequests"][0], "id" | "date">) {
  const profile = getNGOProfile(userId);
  profile.transferRequests.push({ ...request, id: Date.now().toString(), date: new Date().toISOString() });
  updateNGOProfile(userId, { transferRequests: profile.transferRequests });
}

export function getAllNGOProfiles(): NGOProfile[] {
  return JSON.parse(localStorage.getItem(NGO_KEY) || "[]");
}

// ─── NGO Suitability Matching ───────────────────────────
export function matchNGOForRequest(helpType: string): { userId: string; name: string; score: number }[] {
  const users = getAllUsers().filter(u => u.role === "ngo" && u.status === "approved");
  const results: { userId: string; name: string; score: number }[] = [];
  for (const u of users) {
    const profile = getNGOProfile(u.id);
    if (!profile.verified) continue;
    const availableCapacity = profile.capacity - profile.currentOccupancy;
    if (availableCapacity <= 0) continue;
    let score = 50;
    score += Math.min(availableCapacity, 30);
    const complianceMet = profile.complianceChecklist.filter(c => c.met).length;
    score += complianceMet * 3;
    results.push({ userId: u.id, name: u.name, score });
  }
  return results.sort((a, b) => b.score - a.score);
}

// ─── Consent Helpers ────────────────────────────────────
export function isConsentActive(userId: string): boolean {
  const records = JSON.parse(localStorage.getItem("careconnect_consent_history") || "[]");
  const userRecords = records.filter((r: any) => r.userId === userId);
  if (userRecords.length === 0) return false;
  const latest = userRecords.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  return latest.status === "given";
}

// ─── Well-being Reminders ───────────────────────────────
export function getWellBeingReminders(): CareRequest[] {
  const requests = getCareRequests().filter(r => r.status === "assigned" && r.careLifecycle === "under_care");
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  return requests.filter(r => !r.wellBeingLastChecked || r.wellBeingLastChecked < threeDaysAgo);
}

export function acknowledgeWellBeing(requestId: string) {
  updateCareRequest(requestId, { wellBeingLastChecked: new Date().toISOString(), wellBeingReminder: false });
}

// ─── Soft Delete & Recovery ─────────────────────────────
export function getDeletedRecords(): { careRequests: CareRequest[]; orphanRequests: OrphanRequest[] } {
  return {
    careRequests: getAllCareRequestsIncludeDeleted().filter(r => r.deleted),
    orphanRequests: getAllOrphanRequestsIncludeDeleted().filter(r => r.deleted),
  };
}

// ─── Role Misuse Detection ──────────────────────────────
export function detectRoleMisuse(userId: string, attemptedAction: string): boolean {
  const user = getUserById(userId);
  if (!user) return true;
  const allowedActions: Record<string, string[]> = {
    admin: ["approve_user", "reject_user", "suspend_user", "approve_request", "resolve_alert", "view_audit", "manage_ngo"],
    elder: ["submit_care_request", "withdraw_consent", "view_own_requests"],
    caretaker: ["accept_request", "complete_request", "log_attendance", "reject_request"],
    ngo: ["accept_orphan_request", "update_compliance", "request_transfer", "manage_adoption"],
    orphan: ["submit_orphan_request", "view_own_requests"],
  };
  const allowed = allowedActions[user.role] || [];
  if (!allowed.includes(attemptedAction)) {
    addAuditEntry({ userId, userName: user.name, action: `ROLE MISUSE DETECTED: ${attemptedAction}`, target: user.role });
    return true;
  }
  return false;
}

// ─── Anonymize Child Profile ────────────────────────────
export function anonymizeChildName(name: string): string {
  if (!name || name.length <= 2) return "***";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}
