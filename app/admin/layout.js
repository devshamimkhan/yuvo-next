import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "Admin | YUVO",
};

/**
 * Admin layout — wraps all /admin/* pages.
 * Sidebar and footer remain mounted during navigation.
 * Only the page content (children) re-renders on route change.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="yuvo-admin-shell">
      <AdminSidebar />
      <main className="main-content">
        {children}
        <footer className="admin-footer">
          <span>© 2026 YUVO. All rights reserved.</span>
          <div className="links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
