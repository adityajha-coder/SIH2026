import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Landmark,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
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
import {
  getPasswordChecks,
  registerSchema,
  USER_ROLES,
} from "@/schemas/authSchemas";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      userName: "",
      email: searchParams.get("email") || "",
      password: "",
      role: USER_ROLES.STARTUP_USER,
    },
  });

  const password = form.watch("password");
  const selectedRole = form.watch("role");
  const passwordChecks = getPasswordChecks(password);
  const metCount = passwordChecks.filter((c) => c.met).length;

  const onSubmit = async (values) => {
    try {
      await register(values);
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(error?.message || "Could not create account");
    }
  };

  return (
    <section className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-[#F7F9FC] px-4 py-10 sm:py-16">
      <div className="w-full max-w-[460px] space-y-5">
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
              Create Account
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Join Maharashtra’s Sovereign Innovation Procurement Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 sm:px-8 pb-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Role Selection Segmented Control */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#10233F]">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl">
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue("role", USER_ROLES.STARTUP_USER, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
                      selectedRole === USER_ROLES.STARTUP_USER
                        ? "bg-white text-[#10233F] shadow-sm font-semibold ring-1 ring-black/5"
                        : "text-[#64748B] hover:text-[#10233F]"
                    )}
                  >
                    <Building2 className={cn("h-4 w-4", selectedRole === USER_ROLES.STARTUP_USER ? "text-[#2563EB]" : "text-slate-400")} />
                    Startup Innovator
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue("role", USER_ROLES.GOVERNMENT_USER, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
                      selectedRole === USER_ROLES.GOVERNMENT_USER
                        ? "bg-white text-[#10233F] shadow-sm font-semibold ring-1 ring-black/5"
                        : "text-[#64748B] hover:text-[#10233F]"
                    )}
                  >
                    <Landmark className={cn("h-4 w-4", selectedRole === USER_ROLES.GOVERNMENT_USER ? "text-[#0F766E]" : "text-slate-400")} />
                    Government Officer
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B] pt-0.5 px-1">
                  {selectedRole === USER_ROLES.STARTUP_USER
                    ? "Apply to challenges, seek prior-turnover exemptions & pilot tech."
                    : "Post operational challenges, evaluate proposals & govern pilots."}
                </p>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-username"
                  className="text-xs font-semibold text-[#10233F]"
                >
                  Username
                </label>
                <Input
                  id="register-username"
                  autoComplete="username"
                  placeholder="e.g. aditya_jha"
                  className="h-10 text-sm"
                  {...form.register("userName")}
                />
                {form.formState.errors.userName && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.userName.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-email"
                  className="text-xs font-semibold text-[#10233F]"
                >
                  Official Email Address
                </label>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@organization.com"
                  className="h-10 text-sm"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-password"
                  className="text-xs font-semibold text-[#10233F]"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a secure password"
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

              {/* Compact Password Strength Indicator */}
              {password && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const active = metCount >= lvl;
                      return (
                        <div
                          key={lvl}
                          className={cn(
                            "h-full flex-1 rounded-full transition-all duration-300",
                            active
                              ? metCount <= 2
                                ? "bg-amber-500"
                                : metCount <= 4
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                              : "bg-slate-200"
                          )}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                    {passwordChecks.map((check) => (
                      <span
                        key={check.label}
                        className={cn(
                          "flex items-center gap-1 transition-colors",
                          check.met
                            ? "text-emerald-600 font-medium"
                            : "text-slate-400"
                        )}
                      >
                        {check.met ? (
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        ) : (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                        )}
                        {check.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 gap-2 font-semibold bg-[#2563EB] hover:bg-blue-600 shadow-sm mt-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Create Account
              </Button>
            </form>

            <div className="pt-1 text-center">
              <p className="text-xs text-[#64748B]">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default RegisterPage;
