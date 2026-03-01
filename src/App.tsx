import { Toaster, SonnerToaster, TooltipProvider } from "@/components/ui/feedback";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import ElderDashboard from "./pages/dashboards/ElderDashboard";
import CaretakerDashboard from "./pages/dashboards/CaretakerDashboard";
import NGODashboard from "./pages/dashboards/NGODashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import OrphanDashboard from "./pages/dashboards/OrphanDashboard";
import CareRequestForm from "./pages/CareRequestForm";
import OrphanRequestForm from "./pages/OrphanRequestForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SonnerToaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/otp-verify" element={<OTPVerificationPage />} />
            <Route path="/dashboard/elder" element={<ElderDashboard />} />
            <Route path="/dashboard/caretaker" element={<CaretakerDashboard />} />
            <Route path="/dashboard/ngo" element={<NGODashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/orphan" element={<OrphanDashboard />} />
            <Route path="/care-request/new" element={<CareRequestForm />} />
            <Route path="/orphan-request/new" element={<OrphanRequestForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
