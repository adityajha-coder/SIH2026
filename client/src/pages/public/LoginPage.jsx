import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { getRoleDashboardPath } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/schemas/authSchemas";
import logoImg from "@/assets/logo.png";

function GoogleIcon(props) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const DEMO_ACCOUNTS = {
  startup: {
    label: "Startup",
    email: "startup.demo@pragati-govx.in",
    password: "Demo@12345",
  },
  government: {
    label: "Government",
    email: "gov.demo@pragati-govx.in",
    password: "Demo@12345",
  },
  evaluator: {
    label: "Evaluator",
    email: "evaluator.demo@pragati-govx.in",
    password: "Demo@12345",
  },
};

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const returnPath = useMemo(
    () => location.state?.from || "",
    [location.state?.from]
  );

  const onDemoSelect = (key) => {
    const account = DEMO_ACCOUNTS[key];
    form.setValue("email", account.email, { shouldValidate: true });
    form.setValue("password", account.password, { shouldValidate: true });
    setUnverifiedEmail("");
  };

  const onSubmit = async (values) => {
    try {
      const session = await login(values);
      const target = returnPath || getRoleDashboardPath(session.user.role);
      navigate(target, { replace: true });
    } catch (error) {
      const message = error?.message || "Could not sign in";

      if (message.toLowerCase().includes("email not verified")) {
        setUnverifiedEmail(values.email);
      }

      toast.error(message);
    }
  };

  return (
    <section className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-[#F7F9FC] px-4 py-10 sm:py-16">
      <div className="w-full max-w-[420px] space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logoImg} alt="Pragati-GovX" className="h-10 w-auto" />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-lg tracking-tight text-[#10233F] leading-tight">
                Pragati-GovX
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#2563EB] uppercase">
                Government of Maharashtra
              </span>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="border border-[#E2E8F0] bg-white shadow-md rounded-2xl">
          <CardHeader className="space-y-1 pb-3 pt-6 px-6 sm:px-8 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-[#10233F]">
              Sign In
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-8 pb-6">
            <Button
              asChild
              variant="outline"
              className="w-full justify-center gap-2.5 h-10 border-[#CBD5E1] bg-white text-[#10233F] font-medium text-xs hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <a href={`${API_BASE_URL}/auth/google`}>
                <GoogleIcon />
                Continue with Google
              </a>
            </Button>

            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-[11px] uppercase tracking-wider text-slate-400">or sign in with email</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="text-xs font-semibold text-[#10233F]"
                >
                  Email Address
                </label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="h-10 text-sm"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-[#10233F]"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-10 text-sm pr-10"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#10233F] p-1"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {unverifiedEmail && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-[#92400E]">
                  Email verification is pending.
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="ml-1 font-semibold underline"
                  >
                    Verify now
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 gap-2 font-semibold bg-[#2563EB] hover:bg-blue-600 shadow-sm"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Sign In
              </Button>
            </form>

            <div className="pt-1 text-center">
              <p className="text-xs text-[#64748B]">
                New to Pragati-GovX?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Discreet Demo Fast-Fill Bar */}
        <div className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 text-center shadow-2xs">
          <p className="text-[11px] font-medium text-[#64748B] mb-2">
            Quick Demo Login:
          </p>
          <div className="flex items-center justify-center gap-2">
            {Object.entries(DEMO_ACCOUNTS).map(([key, account]) => (
              <button
                key={key}
                type="button"
                onClick={() => onDemoSelect(key)}
                className="text-[11px] px-2.5 py-1 rounded-md border border-slate-200 bg-white text-[#10233F] hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-200 transition-colors font-medium"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
