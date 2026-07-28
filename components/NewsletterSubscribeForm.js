"use client";

import { useRef, useEffect } from "react";
import { useActionState } from "react";
import { toast } from "react-hot-toast";
import { subscribeNewsletter } from "@/app/admin/newsletter/actions";

export default function NewsletterSubscribeForm({ placeholder, buttonText }) {
  const inputRef = useRef(null);
  const [state, formAction, isPending] = useActionState(subscribeNewsletter, null);

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(state.message, { icon: "✅" });
      if (inputRef.current) inputRef.current.value = "";
    } else if (state.status === "duplicate") {
      toast(state.message, { icon: "⚠️" });
    } else if (state.status === "validation_error") {
      toast.error(state.message, { icon: "❌" });
    } else if (state.status === "server_error") {
      toast.error(state.message, { icon: "❌" });
    }
  }, [state]);

  return (
    <form action={formAction} className="join-form">
      <label className="email-field">
        <span className="sr-only">{placeholder}</span>
        <input
          ref={inputRef}
          type="email"
          name="email"
          placeholder={placeholder}
          required
          disabled={isPending}
        />
        <i className="fa-regular fa-envelope" aria-hidden="true"></i>
      </label>
      <button className="join-btn" type="submit" disabled={isPending}>
        {isPending ? (
          <><i className="fa-solid fa-spinner fa-spin" /> Sending…</>
        ) : (
          <>{buttonText} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i></>
        )}
      </button>
    </form>
  );
}
