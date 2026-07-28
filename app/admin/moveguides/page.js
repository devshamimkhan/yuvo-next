export const dynamic = "force-dynamic";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MoveGuideDeleteButton from "@/components/MoveGuideDeleteButton";
import MoveGuideFeaturedToggle from "@/components/MoveGuideFeaturedToggle";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import { getMoveGuidesAction } from "./actions";

export const metadata = {
  title: "Admin Move Guides | YUVO",
};

export default async function AdminMoveGuidesPage({ searchParams }) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";
  const filters = {
    search: params?.search || "",
    status: params?.status || "all",
  };
  const guides = await getMoveGuidesAction(filters);

  return (
    <>
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" id="menuToggle" aria-label="Toggle sidebar">
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1>
              <span className="sub">Manage your guided routines</span>
            </h1>
          </div>
          <div className="topbar-right">
            <AdminTopbarRight userName={userName} />
          </div>
        </header>

        <form className="toolbar" action="/admin/moveguides">
          <div className="toolbar-left">
            <div className="search-cat">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                type="text" 
                id="guideSearch" 
                name="search" 
                placeholder="Search guides..." 
                defaultValue={filters.search} 
              />
            </div>
          </div>
          <div className="toolbar-right">
            <Link href="/admin/moveguides/create" className="btn-primary" id="addGuideBtn">
              <i className="fa-solid fa-plus"></i>
              Add Move Guide
            </Link>
          </div>
        </form>

        <section className="table-card">
          <div className="card-header">
            <h3>All Move Guides</h3>
            <span className="count-badge" id="guideCount">{guides.length} guides</span>
          </div>
          <div className="table-wrap">
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Guide</th>
                  <th>Total Time</th>
                  <th>Moves</th>
                  <th style={{ textAlign: "center" }}>Featured</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody id="guidesTableBody">
                {guides.length ? (
                  guides.map((guide) => {
                    const movesArr = Array.isArray(guide.moves) ? guide.moves : [];
                    const movesCount = movesArr.length;
                    const totalMins = movesArr.reduce((sum, m) => sum + (Number(m.stepTime) || 0), 0);
                    return (
                      <tr key={guide.id} data-id={guide.id}>
                        <td>
                          <div className="guide-cell">
                            <div className="guide-icon" style={guide.imageUrl ? { background: 'none', padding: 0, width: 44, height: 44, borderRadius: 8, overflow: 'hidden' } : {}}>
                              {guide.imageUrl ? (
                                <img src={guide.imageUrl} alt={guide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <i className="fa-regular fa-circle-play"></i>
                              )}
                            </div>
                            <div className="guide-info">
                              <h4>{guide.title}</h4>
                              <div className="guide-id">
                                {guide.description
                                  ? guide.description.substring(0, 50) + (guide.description.length > 50 ? "…" : "")
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{totalMins > 0 ? `${totalMins} sec` : "—"}</td>
                        <td className="moves-count">{movesCount} moves</td>
                        <td style={{ textAlign: "center" }}>
                          <MoveGuideFeaturedToggle guide={guide} />
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="actions" style={{ justifyContent: "flex-end" }}>
                            <Link href={`/admin/moveguides/${guide.id}/edit`} className="btn-edit edit-guide">
                              <i className="fa-regular fa-pen-to-square"></i> Edit
                            </Link>
                            <MoveGuideDeleteButton guide={guide} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "40px 0", color: "var(--yuvo-muted)" }}>
                      <i className="fa-regular fa-circle-play" style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}></i>
                      No move guides found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span id="paginationInfo">Showing {guides.length > 0 ? 1 : 0}–{guides.length} of {guides.length} guides</span>
            <div className="pages">
              <button disabled><i className="fa-solid fa-chevron-left"></i></button>
              <button className="active">1</button>
              <button disabled><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
        </section>

    </>
  );
}

