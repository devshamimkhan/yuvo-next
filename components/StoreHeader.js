"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function StoreHeader() {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header>
      <div className="container header-bar">
        <Link href="/" className="logo">
          <Image
            src="/assets/img/logo.png"
            alt="YUVO Fitness"
            width={116}
            height={40}
          />
        </Link>

        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((prev) => !prev)}
        >
          <i className={`fas ${navOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>

        <nav
          id="mainNav"
          className={navOpen ? "open" : ""}
          onClick={() => setNavOpen(false)}
        >
          <Link href="/" className={isActive("/") ? "active" : ""}>
            Home
          </Link>
          <Link
            href="/moveguide"
            className={isActive("/moveguide") ? "active" : ""}
          >
            Move
          </Link>
          <Link
            href="/products"
            className={isActive("/products") ? "active" : ""}
          >
            Products
          </Link>
          <Link href="/our-story" className={isActive("/our-story") ? "active" : ""}>
            Our Story
          </Link>
          <Link href="/moveguide" className="nav-cta">
            Join the Movement{" "}
            <i className="fas fa-chevron-right" aria-hidden="true"></i>
          </Link>
        </nav>
      </div>
    </header>
  );
}
