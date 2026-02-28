import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "admin" | "elder" | "caretaker" | "ngo" | "orphan";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User | null;
  register: (name: string, email: string, password: string, role: Role) => User;
  logout: () => void;
  verifyOTP: () => void;
  isOTPVerified: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("carenest_user");
    const otpVerified = localStorage.getItem("carenest_otp_verified");
    if (stored) setUser(JSON.parse(stored));
    if (otpVerified === "true") setIsOTPVerified(true);
  }, []);

  const register = (name: string, email: string, password: string, role: Role): User => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      status: role === "admin" ? "approved" : "pending",
    };
    // Save to users list
    const users: User[] = JSON.parse(localStorage.getItem("carenest_users") || "[]");
    users.push(newUser);
    localStorage.setItem("carenest_users", JSON.stringify(users));
    // Save credentials
    const creds = JSON.parse(localStorage.getItem("carenest_creds") || "{}");
    creds[email] = { password, userId: newUser.id };
    localStorage.setItem("carenest_creds", JSON.stringify(creds));
    // Set current user
    setUser(newUser);
    setIsOTPVerified(false);
    localStorage.setItem("carenest_user", JSON.stringify(newUser));
    localStorage.removeItem("carenest_otp_verified");
    return newUser;
  };

  const login = (email: string, password: string): User | null => {
    const creds = JSON.parse(localStorage.getItem("carenest_creds") || "{}");
    if (creds[email] && creds[email].password === password) {
      const users: User[] = JSON.parse(localStorage.getItem("carenest_users") || "[]");
      const found = users.find((u) => u.id === creds[email].userId);
      if (found) {
        setUser(found);
        setIsOTPVerified(false);
        localStorage.setItem("carenest_user", JSON.stringify(found));
        localStorage.removeItem("carenest_otp_verified");
        return found;
      }
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setIsOTPVerified(false);
    localStorage.removeItem("carenest_user");
    localStorage.removeItem("carenest_otp_verified");
  };

  const verifyOTP = () => {
    setIsOTPVerified(true);
    localStorage.setItem("carenest_otp_verified", "true");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, verifyOTP, isOTPVerified }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
