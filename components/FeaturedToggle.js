"use client";

import { useTransition } from "react";
import { toggleFeaturedAction } from "@/app/admin/products/actions";
import { toast } from "react-hot-toast";

export default function FeaturedToggle({ product }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleFeaturedAction(product.id, !product.featured);
        toast.success(`Product ${!product.featured ? 'marked as featured' : 'unfeatured'} successfully.`);
      } catch (err) {
        toast.error(err.message || "Failed to update featured status.");
      }
    });
  };

  return (
    <button 
      type="button"
      onClick={handleToggle} 
      disabled={isPending}
      title={product.featured ? "Unfeature Product" : "Feature Product"}
      style={{
        background: 'none',
        border: 'none',
        cursor: isPending ? 'wait' : 'pointer',
        color: product.featured ? '#f59e0b' : '#9ca3af',
        fontSize: '20px',
        opacity: isPending ? 0.5 : 1,
        padding: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s ease, opacity 0.2s ease'
      }}
    >
      <i className={product.featured ? "fa-solid fa-star" : "fa-regular fa-star"} />
    </button>
  );
}
