"use client";

import { signOut } from "next-auth/react";

function getInitials(name) {
  if (!name) return "AD";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminTopbarRight({ userName = "Admin" }) {
  const initials = getInitials(userName);

  return (
    <div className="topbar-right-group">
      <div className="avatar" title={userName}>
        {initials}
      </div>
      <button
        type="button"
        className="topbar-signout"
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Sign Out"
      >
        <i className="fa-solid fa-arrow-right-from-bracket" />
      </button>
    </div>
  );
}
