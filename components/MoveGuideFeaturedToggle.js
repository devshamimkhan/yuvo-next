"use client";

import { useTransition } from "react";
import { toggleMoveGuideFeaturedAction } from "@/app/admin/moveguides/actions";
import { toast } from "react-hot-toast";

export default function MoveGuideFeaturedToggle({ guide }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleMoveGuideFeaturedAction(guide.id, !guide.featured);
        toast.success(`Move Guide ${!guide.featured ? 'marked as featured' : 'unfeatured'} successfully.`);
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
      title={guide.featured ? "Unfeature Guide" : "Feature Guide"}
      style={{
        background: 'none',
        border: 'none',
        cursor: isPending ? 'wait' : 'pointer',
        color: guide.featured ? '#f59e0b' : '#9ca3af',
        fontSize: '20px',
        opacity: isPending ? 0.5 : 1,
        padding: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s ease, opacity 0.2s ease'
      }}
    >
      <i className={guide.featured ? "fa-solid fa-star" : "fa-regular fa-star"} />
    </button>
  );
}
