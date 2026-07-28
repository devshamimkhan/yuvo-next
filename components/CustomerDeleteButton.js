"use client";

import { useTransition } from "react";
import { deleteCustomerAction } from "@/app/admin/customers/actions";

export default function CustomerDeleteButton({ user }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="btn-danger-outline"
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete customer "${user.name}"? This action cannot be undone.`)) {
          return;
        }

        const formData = new FormData();
        formData.set("id", user.id);
        startTransition(() => deleteCustomerAction(formData));
      }}
    >
      <i className="fa-regular fa-trash-can" />
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
