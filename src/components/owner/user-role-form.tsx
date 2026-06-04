"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { updateUserRoleAction } from "@/app/actions/owner";
import { OwnerActionStatus } from "@/components/owner/owner-action-status";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/supabase/types";

export function UserRoleForm({
  userId,
  role,
}: {
  userId: string;
  role: AppRole;
}) {
  const [state, formAction, isPending] = useActionState(updateUserRoleAction, {
    status: "idle" as const,
    message: "",
  });

  return (
    <form action={formAction} className="grid gap-2">
      <input name="user_id" type="hidden" value={userId} />
      <div className="flex items-center gap-2">
        <select
          className="h-9 rounded-full border border-line bg-white px-3 text-xs font-semibold outline-none focus:border-brand"
          defaultValue={role}
          name="role"
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="owner">Owner</option>
        </select>
        <Button disabled={isPending} size="sm" type="submit" variant="secondary">
          <Save className="size-3" />
          Save
        </Button>
      </div>
      <OwnerActionStatus state={state} />
    </form>
  );
}
