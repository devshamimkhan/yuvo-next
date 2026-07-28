export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import NewsletterAdminClient from "@/components/NewsletterAdminClient";
import NewsletterMarkRead from "@/components/NewsletterMarkRead";
import { getNewsletterSubscribers, getNewsletterStatsAction } from "./actions";

export const metadata = {
  title: "Newsletter | YUVO",
};

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  let data = { items: [], total: 0, page: 1, totalPages: 0 };
  let stats = { total: 0, today: 0, month: 0 };
  let error = null;

  try {
    [data, stats] = await Promise.all([
      getNewsletterSubscribers({ page: 1, limit: 20, search: "", sort: "newest" }),
      getNewsletterStatsAction(),
    ]);
  } catch (err) {
    error = err.message;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            Newsletter
            <span className="sub">Manage your subscribers</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

      {error ? (
        <div className="error-state">
          <i className="fa-solid fa-triangle-exclamation" />
          <h3>Failed to load subscribers</h3>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <NewsletterMarkRead />
          <NewsletterAdminClient
            initialData={data}
            initialStats={stats}
          />
        </>
      )}
    </>
  );
}
