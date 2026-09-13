import React, { useEffect, useMemo, useRef, useState } from "react";
import { MailCheck, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { verifyEmailSchema } from "@/schemas/authSchemas";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const [cooldown, setCooldown] = useState(60);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const otpValue = useMemo(() => otp.join(""), [otp]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const setDigit = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      setOtp((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    const digits = cleaned.slice(0, OTP_LENGTH - index).split("");
    setOtp((current) => {
      const next = [...current];
      digits.forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      return next;
    });

    const focusIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    setOtpError("");
  };

  const onKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setEmailError("");
    setOtpError("");

    const parsed = verifyEmailSchema.safeParse({ email, otp: otpValue });
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") setEmailError(issue.message);
        if (issue.path[0] === "otp") setOtpError(issue.message);
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyEmail(parsed.data);
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Could not verify email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendClick = () => {
    toast.info("Resend OTP requires a backend resend endpoint.");
    setCooldown(60);
  };

  return (
    <section className="bg-[#F7F9FC] px-4 py-12 sm:py-16">
      <Card className="glass-card mx-auto max-w-lg border-[#E2E8F0] shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-[#0F766E]">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
            <CardDescription>
              Enter the 6-digit OTP sent to your registered email.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="verify-email" className="text-xs font-semibold text-[#10233F]">
                Recipient Email
              </label>
              <Input
                id="verify-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError("");
                }}
                placeholder="you@example.org"
              />
              {emailError && <p className="text-xs text-[#DC2626]">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#10233F]">
                Verification Code
              </label>
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      inputRefs.current[index] = node;
                    }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={OTP_LENGTH}
                    value={digit}
                    onChange={(event) => setDigit(index, event.target.value)}
                    onKeyDown={(event) => onKeyDown(index, event)}
                    className={cn(
                      "h-12 rounded-lg border border-[#E2E8F0] bg-white text-center text-lg font-bold text-[#10233F] shadow-sm outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100",
                      otpError && "border-[#DC2626]"
                    )}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
              {otpError && <p className="text-xs text-[#DC2626]">{otpError}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Account
            </Button>

            <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#64748B] sm:flex-row">
              <span>
                {cooldown > 0
                  ? `Resend available in ${cooldown}s`
                  : "Did not receive the code?"}
              </span>
              <button
                type="button"
                className="font-semibold text-[#2563EB] disabled:text-[#94A3B8]"
                disabled={cooldown > 0}
                onClick={onResendClick}
              >
                Resend Code
              </button>
            </div>

            <p className="text-center text-xs text-[#64748B]">
              Already verified?{" "}
              <Link to="/login" className="font-semibold text-[#2563EB] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default VerifyEmailPage;
