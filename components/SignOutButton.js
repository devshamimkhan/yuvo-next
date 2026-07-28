"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
    >
      Sign out
    </button>
  );
}
