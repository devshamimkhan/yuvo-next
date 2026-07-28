"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSignOutLink from "@/components/AdminSignOutLink";
import { MdSettingsSuggest } from "react-icons/md";

export default function AdminSidebar({ productCount = 0, moveGuideCount = 0, customerCount = 0, unreadNewsletterCount = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Auto-detect the active route from the current pathname
  const active = pathname?.startsWith("/admin/products") ? "products"
    : pathname?.startsWith("/admin/moveguides") ? "moveguides"
    : pathname?.startsWith("/admin/customers") ? "customers"
    : pathname?.startsWith("/admin/newsletter") ? "newsletter"
    : pathname?.startsWith("/admin/media") ? "media"
    : pathname?.startsWith("/admin/settings/footer") ? "settings_footer"
    : pathname?.startsWith("/admin/settings") ? "settings"
    : "dashboard";

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Image src="/assets/img/logo.png" alt="YUVO" width={116} height={40} />
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main</div>
          <Link
            href="/admin/dashboard"
            className={active === "dashboard" ? "active" : ""}
          >
            <i className="fa-solid fa-gauge-high" /> Dashboard
          </Link>
          <Link
            href="/admin/media"
            className={active === "media" ? "active" : ""}
          >
            <i className="fa-solid fa-images" /> Media
          </Link>
          <Link
            href="/admin/moveguides"
            className={active === "moveguides" ? "active" : ""}
          >
            <i className="fa-solid fa-person-running" /> Move Guides
            <span className="count">{moveGuideCount}</span>
          </Link>
          <div className="nav-label">eCommerce</div>
          <Link
            href="/admin/products"
            className={active === "products" ? "active" : ""}
          >
            <i className="fa-solid fa-boxes-stacked" /> Products
            <span className="count">{productCount}</span>
          </Link>

          <Link
            href="/admin/customers"
            className={active === "customers" ? "active" : ""}
          >
            <i className="fa-regular fa-user" /> Users
            <span className="count">{customerCount}</span>
          </Link>


          <div className="nav-label">Content</div>
          <Link
            href="/admin/newsletter"
            className={active === "newsletter" ? "active" : ""}
          >
            <i className="fa-regular fa-envelope" /> Newsletter
            {unreadNewsletterCount > 0 && (
              <span className="count red">{unreadNewsletterCount > 99 ? "99+" : unreadNewsletterCount}</span>
            )}
          </Link>

          <a href="#">
            <i className="fa-regular fa-file-lines" /> Pages
          </a>

          <div className="nav-label">Settings</div>
          <Link
            href="/admin/settings/general"
            className={active === "settings" ? "active" : ""}
          >
            <i className="fa-solid fa-gear" /> General
          </Link>
          <Link
            href="/admin/settings/footer"
            className={active === "settings_footer" ? "active" : ""}
          >
            <MdSettingsSuggest className="text-xl"/> Footer
          </Link>
          <a href="#">
            <i className="fa-solid fa-palette" />Appearance
          </a>
          <a href="#">
            <i className="fa-regular fa-file-lines" />SEO & Analytics
          </a>
        </nav>

        <div className="sidebar-footer">
          <AdminSignOutLink />
        </div>
      </aside>

      <button
        type="button"
        className="menu-toggle floating-menu-toggle"
        aria-label="Toggle sidebar"
        onClick={() => setSidebarOpen(true)}
      >
        <i className="fa-solid fa-bars" />
      </button>
    </>
  );
}
