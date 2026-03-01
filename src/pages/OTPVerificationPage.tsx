import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { user, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length === 6) {
      verifyOTP();
      toast({ title: "Verified!", description: "OTP verified successfully." });
      const role = user?.role || "elder";
      navigate(`/dashboard/${role}`);
    } else {
      toast({ title: "Invalid OTP", description: "Please enter all 6 digits.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold font-display mb-2 text-foreground">OTP Verification</h1>
        <p className="text-muted-foreground mb-2">Enter the 6-digit code sent to your email</p>
        <p className="text-xs text-muted-foreground mb-8">(Simulated: enter any 6 digits)</p>

        <div className="flex gap-3 justify-center mb-8">
          {otp.map((digit, i) => (
            <Input
              key={i}
              id={`otp-${i}`}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ""))}
              className="w-12 h-14 text-center text-xl font-bold"
              maxLength={1}
            />
          ))}
        </div>

        <Button variant="hero" size="lg" className="w-full mb-4" onClick={handleVerify}>
          Verify & Continue
        </Button>

        <p className="text-sm text-muted-foreground">
          Didn't receive code?{" "}
          <button className="text-primary font-medium hover:underline" onClick={() => toast({ title: "OTP Resent", description: "A new code has been sent." })}>
            Resend
          </button>
        </p>
      </motion.div>
    </div>
  );
}
