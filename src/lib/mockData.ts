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

export function getAllUsers() {
  return JSON.parse(localStorage.getItem("careconnect_users") || "[]");
}

export function updateUserStatus(userId: string, status: "approved" | "rejected") {
  const users = getAllUsers().map((u: any) => (u.id === userId ? { ...u, status } : u));
  localStorage.setItem("careconnect_users", JSON.stringify(users));
  const current = JSON.parse(localStorage.getItem("careconnect_user") || "null");
  if (current && current.id === userId) {
    localStorage.setItem("careconnect_user", JSON.stringify({ ...current, status }));
  }
}
