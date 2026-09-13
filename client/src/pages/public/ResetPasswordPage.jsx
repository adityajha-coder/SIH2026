import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
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
  resetPasswordSchema,
} from "@/schemas/authSchemas";
import { cn } from "@/lib/utils";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: searchParams.get("email") || "",
      token: searchParams.get("token") || "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordChecks = getPasswordChecks(form.watch("password"));

  const onSubmit = async (values) => {
    try {
      await resetPassword(values);
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Could not reset password");
    }
  };

  return (
    <section className="bg-[#F7F9FC] px-4 py-12 sm:py-16">
      <Card className="glass-card mx-auto max-w-lg border-[#E2E8F0] shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-[#0F766E]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
            <CardDescription>
              Use the reset token from your email to update account access.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-xs font-semibold text-[#10233F]">
                  Email
                </label>
                <Input id="reset-email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reset-token" className="text-xs font-semibold text-[#10233F]">
                  Reset Token
                </label>
                <Input id="reset-token" {...form.register("token")} />
                {form.formState.errors.token && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.token.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reset-password" className="text-xs font-semibold text-[#10233F]">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#10233F]"
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

            <div className="space-y-1.5">
              <label htmlFor="reset-confirm" className="text-xs font-semibold text-[#10233F]">
                Confirm Password
              </label>
              <Input
                id="reset-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-[#DC2626]">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:grid-cols-5">
              {passwordChecks.map((check) => (
                <div
                  key={check.label}
                  className={cn(
                    "rounded-md px-2 py-1 text-center text-[11px] font-semibold",
                    check.met
                      ? "bg-teal-50 text-[#0F766E]"
                      : "bg-white text-[#64748B]"
                  )}
                >
                  {check.label}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>

            <p className="text-center text-xs text-[#64748B]">
              Remembered access?{" "}
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

export default ResetPasswordPage;
