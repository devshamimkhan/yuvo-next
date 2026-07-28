"use client";

import { useEffect } from "react";
import { markAllNewsletterAsRead } from "@/app/admin/newsletter/actions";

export default function NewsletterMarkRead() {
  useEffect(() => {
    markAllNewsletterAsRead().catch(() => {});
  }, []);

  return null;
}
