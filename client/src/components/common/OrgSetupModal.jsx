import React, { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  createOrganizationSchema,
  ORGANIZATION_TYPES,
  USER_ROLES,
} from "@/schemas/authSchemas";

const ROLE_ORG_TYPE = {
  [USER_ROLES.STARTUP_USER]: ORGANIZATION_TYPES.STARTUP,
  [USER_ROLES.GOVERNMENT_USER]: ORGANIZATION_TYPES.GOVERNMENT_DEPT,
};

function labelForType(type) {
  if (type === ORGANIZATION_TYPES.GOVERNMENT_DEPT) return "Government department";
  if (type === ORGANIZATION_TYPES.STARTUP) return "Startup";
  return "Organization";
}

export function OrgSetupModal() {
  const { user, organization, isAuthenticated, isLoading, createOrganization } =
    useAuth();

  const requiredType = ROLE_ORG_TYPE[user?.role];
  const shouldOpen =
    isAuthenticated && !isLoading && !organization && Boolean(requiredType);

  const form = useForm({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: useMemo(
      () => ({
        name: "",
        type: requiredType || ORGANIZATION_TYPES.STARTUP,
        state: "Maharashtra",
        website: "",
      }),
      [requiredType]
    ),
  });

  React.useEffect(() => {
    if (requiredType) {
      form.setValue("type", requiredType);
    }
  }, [form, requiredType]);

  const onSubmit = async (values) => {
    try {
      await createOrganization({
        ...values,
        type: requiredType,
      });
      form.reset({
        name: "",
        type: requiredType,
        state: "Maharashtra",
        website: "",
      });
    } catch (error) {
      toast.error(error?.message || "Could not create organization workspace");
    }
  };

  if (!requiredType) return null;

  return (
    <Dialog open={shouldOpen} onOpenChange={() => undefined}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
            <Building2 className="h-5 w-5" />
          </div>
          <DialogTitle>Set Up Your Workspace</DialogTitle>
          <DialogDescription>
            Create the {labelForType(requiredType).toLowerCase()} profile linked to your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#10233F]" htmlFor="org-name">
              Organization Name
            </label>
            <Input
              id="org-name"
              placeholder={
                requiredType === ORGANIZATION_TYPES.STARTUP
                  ? "Example Innovations Pvt Ltd"
                  : "Department of..."
              }
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-[#DC2626]">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#10233F]" htmlFor="org-type">
                Type
              </label>
              <Input id="org-type" value={labelForType(requiredType)} disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#10233F]" htmlFor="org-state">
                State
              </label>
              <Input id="org-state" {...form.register("state")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#10233F]" htmlFor="org-website">
              Website
            </label>
            <Input
              id="org-website"
              placeholder="https://example.org"
              {...form.register("website")}
            />
            {form.formState.errors.website && (
              <p className="text-xs text-[#DC2626]">
                {form.formState.errors.website.message}
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
            Create Workspace
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default OrgSetupModal;
