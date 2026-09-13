import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
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
import { forgotPasswordSchema } from "@/schemas/authSchemas";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await forgotPassword(values);
      form.reset({ email: values.email });
    } catch (error) {
      toast.error(error?.message || "Could not send password reset email");
    }
  };

  return (
    <section className="bg-[#F7F9FC] px-4 py-12 sm:py-16">
      <Card className="glass-card mx-auto max-w-md border-[#E2E8F0] shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive password reset instructions.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-[#1E3A65]">
              For account privacy, the same confirmation is shown even if the
              email is not registered.
            </div>

            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="text-xs font-semibold text-[#10233F]">
                Email
              </label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.org"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-[#DC2626]">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Reset Link
            </Button>

            <Button asChild variant="ghost" className="w-full gap-2">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default ForgotPasswordPage;
