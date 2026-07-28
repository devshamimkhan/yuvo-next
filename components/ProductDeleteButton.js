"use client";

import { useTransition } from "react";
import { deleteProductAction } from "@/app/admin/products/actions";

export default function ProductDeleteButton({ product }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="btn-danger-outline"
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) {
          return;
        }

        const formData = new FormData();
        formData.set("id", String(product.id));
        startTransition(() => deleteProductAction(formData));
      }}
    >
      <i className="fa-regular fa-trash-can" />
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
