import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "admin" | "elder" | "caretaker" | "ngo" | "orphan";

export interface ActivityLog {
  action: string;
  timestamp: string;
  device?: string;
  ip?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  type: string;
  description: string;
  status: "given" | "withdrawn";
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "pending" | "approved" | "rejected" | "suspended";
  lastLogin?: string;
  loginDevice?: string;
  failedAttempts: number;
  lockedUntil?: string;
  activityLog: ActivityLog[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { user: User | null; error?: string };
  register: (name: string, email: string, password: string, role: Role) => User;
  logout: () => void;
  verifyOTP: () => void;
  isOTPVerified: boolean;
  addConsentRecord: (type: string, description: string, status: "given" | "withdrawn") => void;
  getConsentHistory: (userId?: string) => ConsentRecord[];
}

const USERS_KEY = "careconnect_users";
const CREDS_KEY = "careconnect_creds";
const USER_KEY = "careconnect_user";
const OTP_KEY = "careconnect_otp_verified";
const CONSENT_KEY = "careconnect_consent_history";
const SECURITY_ALERTS_KEY = "careconnect_security_alerts";

export interface SecurityAlert {
  id: string;
  userId: string;
  userName: string;
  type: "suspicious_login" | "account_locked" | "role_mismatch";
  message: string;
  timestamp: string;
  resolved: boolean;
}

function getSecurityAlerts(): SecurityAlert[] {
  return JSON.parse(localStorage.getItem(SECURITY_ALERTS_KEY) || "[]");
}

function addSecurityAlert(alert: Omit<SecurityAlert, "id" | "timestamp" | "resolved">) {
  const alerts = getSecurityAlerts();
  alerts.push({
    ...alert,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    resolved: false,
  });
  localStorage.setItem(SECURITY_ALERTS_KEY, JSON.stringify(alerts));
}

export { getSecurityAlerts, addSecurityAlert };

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  if (/Mobile/i.test(ua)) return "Mobile Browser";
  if (/Chrome/i.test(ua)) return "Chrome Desktop";
  if (/Firefox/i.test(ua)) return "Firefox Desktop";
  if (/Safari/i.test(ua)) return "Safari Desktop";
  return "Unknown Browser";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    const otpVerified = localStorage.getItem(OTP_KEY);
    if (stored) setUser(JSON.parse(stored));
    if (otpVerified === "true") setIsOTPVerified(true);
  }, []);

  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    // Also update in users list
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const idx = users.findIndex((x) => x.id === u.id);
    if (idx >= 0) users[idx] = u;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const register = (name: string, email: string, password: string, role: Role): User => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      status: role === "admin" ? "approved" : "pending",
      failedAttempts: 0,
      activityLog: [{ action: "Account created", timestamp: new Date().toISOString(), device: getDeviceInfo() }],
      createdAt: new Date().toISOString(),
    };
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const creds = JSON.parse(localStorage.getItem(CREDS_KEY) || "{}");
    creds[email] = { password, userId: newUser.id };
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds));

    persistUser(newUser);
    setIsOTPVerified(false);
    localStorage.removeItem(OTP_KEY);
    return newUser;
  };

  const login = (email: string, password: string): { user: User | null; error?: string } => {
    const creds = JSON.parse(localStorage.getItem(CREDS_KEY) || "{}");
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    if (!creds[email]) return { user: null, error: "Invalid email or password." };

    const found = users.find((u) => u.id === creds[email].userId);
    if (!found) return { user: null, error: "Account not found." };

    // Check if account is suspended
    if (found.status === "suspended") {
      return { user: null, error: "Your account has been suspended. Contact admin." };
    }

    // Check if account is locked due to failed attempts
    if (found.lockedUntil) {
      const lockExpiry = new Date(found.lockedUntil);
      if (lockExpiry > new Date()) {
        const mins = Math.ceil((lockExpiry.getTime() - Date.now()) / 60000);
        return { user: null, error: `Account locked. Try again in ${mins} minute(s).` };
      }
      // Lock expired, reset
      found.failedAttempts = 0;
      found.lockedUntil = undefined;
    }

    if (creds[email].password !== password) {
      // Track failed attempt
      found.failedAttempts = (found.failedAttempts || 0) + 1;
      found.activityLog = [
        ...(found.activityLog || []),
        { action: "Failed login attempt", timestamp: new Date().toISOString(), device: getDeviceInfo() },
      ];

      // Lock after 5 failed attempts (15 min lockout)
      if (found.failedAttempts >= 5) {
        found.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        addSecurityAlert({
          userId: found.id,
          userName: found.name,
          type: "account_locked",
          message: `Account locked after ${found.failedAttempts} failed login attempts.`,
        });
      } else if (found.failedAttempts >= 3) {
        // Suspicious after 3 attempts
        addSecurityAlert({
          userId: found.id,
          userName: found.name,
          type: "suspicious_login",
          message: `${found.failedAttempts} failed login attempts detected.`,
        });
      }

      // Save updated user
      const idx = users.findIndex((u) => u.id === found.id);
      if (idx >= 0) users[idx] = found;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      return { user: null, error: "Invalid email or password." };
    }

    // Successful login
    found.failedAttempts = 0;
    found.lockedUntil = undefined;
    found.lastLogin = new Date().toISOString();
    found.loginDevice = getDeviceInfo();
    found.activityLog = [
      ...(found.activityLog || []),
      { action: "Successful login", timestamp: new Date().toISOString(), device: getDeviceInfo() },
    ];

    persistUser(found);
    setIsOTPVerified(false);
    localStorage.removeItem(OTP_KEY);
    return { user: found };
  };

  const logout = () => {
    if (user) {
      user.activityLog = [
        ...(user.activityLog || []),
        { action: "Logged out", timestamp: new Date().toISOString(), device: getDeviceInfo() },
      ];
      // Save activity to users list
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) users[idx] = user;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    setUser(null);
    setIsOTPVerified(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(OTP_KEY);
  };

  const verifyOTP = () => {
    setIsOTPVerified(true);
    localStorage.setItem(OTP_KEY, "true");
    if (user) {
      user.activityLog = [
        ...(user.activityLog || []),
        { action: "OTP verified", timestamp: new Date().toISOString() },
      ];
      persistUser(user);
    }
  };

  const addConsentRecord = (type: string, description: string, status: "given" | "withdrawn") => {
    if (!user) return;
    const records: ConsentRecord[] = JSON.parse(localStorage.getItem(CONSENT_KEY) || "[]");
    records.push({
      id: Date.now().toString(),
      userId: user.id,
      type,
      description,
      status,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(CONSENT_KEY, JSON.stringify(records));
  };

  const getConsentHistory = (userId?: string): ConsentRecord[] => {
    const records: ConsentRecord[] = JSON.parse(localStorage.getItem(CONSENT_KEY) || "[]");
    if (userId) return records.filter((r) => r.userId === userId);
    return records;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, verifyOTP, isOTPVerified, addConsentRecord, getConsentHistory }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
