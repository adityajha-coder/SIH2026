import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getRoleDashboardPath } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { handleOAuthToken } = useAuth();

  useEffect(() => {
    let active = true;

    async function completeOAuth() {
      try {
        const token = searchParams.get("token");
        const authError = searchParams.get("error");

        if (authError) {
          throw new Error("Google authentication failed");
        }

        const session = await handleOAuthToken(token);
        if (active) {
          navigate(getRoleDashboardPath(session.user.role), { replace: true });
        }
      } catch (callbackError) {
        const message = callbackError?.message || "Could not complete sign in";
        setError(message);
        toast.error(message);
      }
    }

    completeOAuth();
    return () => {
      active = false;
    };
  }, [handleOAuthToken, navigate, searchParams]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-[#F7F9FC] px-4 py-12">
      <div className="max-w-md space-y-4 text-center">
        {!error ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2563EB]" />
            <h1 className="text-xl font-bold text-[#10233F]">Completing Sign In</h1>
            <p className="text-sm text-[#64748B]">Loading your secure workspace session.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#10233F]">Authentication Failed</h1>
            <p className="text-sm text-[#64748B]">{error}</p>
            <Button asChild>
              <Link to="/login">Return to Sign In</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

export default AuthCallbackPage;
