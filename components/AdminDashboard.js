import Link from "next/link";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import { getTotalProductCountAction } from "@/app/admin/products/actions";
import { getTotalMoveGuidesCountAction } from "@/app/admin/moveguides/actions";
import { getNewsletterStatsAction, getNewsletterSubscribers } from "@/app/admin/newsletter/actions";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboard({ user }) {
  const name = user?.name || "Admin";

  let productCount = 0;
  let moveGuideCount = 0;
  let subscriberStats = { total: 0, today: 0, month: 0 };
  let recentSubscribers = [];

  try {
    [productCount, moveGuideCount, subscriberStats] = await Promise.all([
      getTotalProductCountAction(),
      getTotalMoveGuidesCountAction(),
      getNewsletterStatsAction(),
    ]);
  } catch {}

  try {
    const { items } = await getNewsletterSubscribers({ page: 1, limit: 10, sort: "newest" });
    recentSubscribers = items || [];
  } catch {}

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            Dashboard{" "}
            <span className="sub">Welcome back, {name}</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={name} />
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Products</span>
            <div className="stat-icon gold">
              <i className="fa-solid fa-box" />
            </div>
          </div>
          <div className="stat-value">{productCount}</div>
          <Link href="/admin/products" className="stat-change up">
            <i className="fa-solid fa-arrow-up" />
            View all
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Move Guides</span>
            <div className="stat-icon blue">
              <i className="fa-solid fa-compass" />
            </div>
          </div>
          <div className="stat-value">{moveGuideCount}</div>
          <Link href="/admin/moveguides" className="stat-change up">
            <i className="fa-solid fa-arrow-up" />
            View all
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Subscribers</span>
            <div className="stat-icon green">
              <i className="fa-regular fa-envelope" />
            </div>
          </div>
          <div className="stat-value">{subscriberStats.total}</div>
          <span className="stat-change up">
            <i className="fa-solid fa-arrow-up" />
            {subscriberStats.month > 0
              ? `${subscriberStats.month} this month`
              : "0 this month"}
          </span>
        </div>
      </section>

      <section className="chart-card orders-card">
        <div className="card-header">
          <h3>Recent Newsletter Subscribers</h3>
          <Link href="/admin/newsletter">View All →</Link>
        </div>
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSubscribers.length > 0 ? (
                recentSubscribers.map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.email}</td>
                    <td>
                      <span
                        className={`status ${
                          sub.status === "subscribed" ? "completed" : "cancelled"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td>{formatDate(sub.subscribedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#8a96a8" }}>
                    No subscribers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
