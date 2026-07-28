"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOutLink() {
  return (
    <button
      type="button"
      className="admin-signout"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <i className="fa-solid fa-arrow-right-from-bracket" />
      Sign Out
    </button>
  );
}
