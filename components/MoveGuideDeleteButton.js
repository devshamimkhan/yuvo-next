"use client";

import { useTransition } from "react";
import { deleteMoveGuideAction } from "@/app/admin/moveguides/actions";

export default function MoveGuideDeleteButton({ guide }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="btn-danger-outline"
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete "${guide.title}"? This action cannot be undone.`)) {
          return;
        }

        const formData = new FormData();
        formData.set("id", String(guide.id));
        startTransition(() => deleteMoveGuideAction(formData));
      }}
    >
      <i className="fa-regular fa-trash-can" />
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
