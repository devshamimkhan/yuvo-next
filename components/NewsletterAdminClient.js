"use client";

import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { useActionState } from "react";
import { toast } from "react-hot-toast";
import {
  getNewsletterSubscribers,
  updateSubscriberStatusAction,
  deleteSubscriberAction,
  bulkUpdateSubscribersAction,
} from "@/app/admin/newsletter/actions";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2>Confirm</h2>
          <button className="modal-close" onClick={onCancel}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="modal-body" style={{ padding: "0 0 20px", gap: 16 }}>
          <p style={{ fontSize: 14, color: "var(--yuvo-text)", margin: 0 }}>{message}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" className="btn-primary" onClick={onConfirm} style={{ flex: 1, justifyContent: "center" }}>
              Confirm
            </button>
            <button type="button" className="btn-outline" onClick={onCancel} style={{ flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsletterAdminClient({ initialData, initialStats }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(initialData.items || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(null);
  const debounceRef = useRef(null);

  const [updateState, updateAction, updatePending] = useActionState(updateSubscriberStatusAction, null);
  const [deleteState, deleteAction] = useActionState(deleteSubscriberAction, null);
  const [bulkState, bulkAction, bulkPending] = useActionState(bulkUpdateSubscribersAction, null);

  const fetchSubscribers = useCallback((searchTerm, sortOrder, pageNum) => {
    setLoading(true);
    startTransition(async () => {
      try {
        const result = await getNewsletterSubscribers({
          page: pageNum,
          limit: 20,
          search: searchTerm,
          sort: sortOrder,
        });
        setItems(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
      } catch {
        toast.error("Failed to load subscribers.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // Debounced search with Enter key support
  const handleSearchChange = (value) => {
    setSearch(value);
    setSelectedIds([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSubscribers(value, sort, 1);
    }, 400);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      fetchSubscribers(search, sort, 1);
    }
  };

  // Sort change
  const handleSortChange = (value) => {
    setSort(value);
    setSelectedIds([]);
    setPage(1);
    fetchSubscribers(search, value, 1);
  };

  // Pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    setSelectedIds([]);
    fetchSubscribers(search, sort, p);
  };

  // Cleanup debounce
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Toast effects — refresh table after successful mutations
  useEffect(() => {
    if (!updateState?.message) return;
    if (updateState.success) { toast.success(updateState.message); fetchSubscribers(search, sort, page); }
    else toast.error(updateState.message);
  }, [updateState]);

  useEffect(() => {
    if (!deleteState?.message) return;
    if (deleteState.success) { toast.success(deleteState.message); fetchSubscribers(search, sort, page); }
    else toast.error(deleteState.message);
    setConfirmDelete(null);
  }, [deleteState]);

  useEffect(() => {
    if (!bulkState?.message) return;
    if (bulkState.success) { toast.success(bulkState.message); fetchSubscribers(search, sort, page); setSelectedIds([]); }
    else toast.error(bulkState.message);
    setConfirmBulk(null);
  }, [bulkState]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map((i) => i.id));
  };

  // Generate pagination range
  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i);
  }

  return (
    <>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Subscribers</span>
            <div className="stat-icon blue"><i className="fa-regular fa-envelope" /></div>
          </div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">New Today</span>
            <div className="stat-icon green"><i className="fa-regular fa-calendar-check" /></div>
          </div>
          <div className="stat-value">{initialStats?.today || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">New This Month</span>
            <div className="stat-icon gold"><i className="fa-regular fa-calendar" /></div>
          </div>
          <div className="stat-value">{initialStats?.month || 0}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-wrap" style={{ display: "flex", gap: 8, position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a96a8", fontSize: 13, zIndex: 1 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by email..."
              className="form-input"
              style={{ paddingLeft: 34, height: 40, width: 240 }}
            />
            {loading && (
              <i className="fa-solid fa-spinner fa-spin" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--yuvo-blue)", fontSize: 14 }} />
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <div className="toolbar-right">
          {selectedIds.length > 0 && (
            <>
              <span style={{ fontSize: 13, color: "var(--yuvo-muted)" }}>{selectedIds.length} selected</span>
              <button type="button" className="btn-outline btn-sm" disabled={bulkPending} onClick={() => setConfirmBulk({ action: "subscribe" })}>
                <i className="fa-solid fa-check" /> Subscribe
              </button>
              <button type="button" className="btn-outline btn-sm" disabled={bulkPending} onClick={() => setConfirmBulk({ action: "unsubscribe" })}>
                <i className="fa-solid fa-ban" /> Unsubscribe
              </button>
              <button type="button" className="btn-danger-outline btn-sm" disabled={bulkPending} onClick={() => setConfirmBulk({ action: "delete" })}>
                <i className="fa-solid fa-trash-can" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <section className="table-card">
        <div className="card-header">
          <h3>All Subscribers</h3>
          <span className="count-badge">{total} total</span>
        </div>
        <div className="table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === items.length && items.length > 0} />
                </th>
                <th>ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-table" style={{ padding: "20px 0" }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 20 }} />
                    <span style={{ display: "block", marginTop: 8 }}>Searching...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-table">
                    <i className="fa-regular fa-envelope-open" />
                    {search ? (
                      <>
                        No subscribers found for &quot;{search}&quot;
                        <span style={{ display: "block", marginTop: 6, fontSize: 13, color: "var(--yuvo-muted)" }}>
                          Try another email address or clear the search.
                        </span>
                      </>
                    ) : (
                      "No subscribers yet"
                    )}
                  </td>
                </tr>
              ) : (
                items.map((sub) => (
                  <tr key={sub.id} style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
                    <td>
                      <input type="checkbox" checked={selectedIds.includes(sub.id)} onChange={() => toggleSelect(sub.id)} />
                    </td>
                    <td className="id-cell">#{sub.id}</td>
                    <td>
                      <div className="product-cell">
                        <div className="thumb avatar-thumb" style={{ width: 36, height: 36, fontSize: 12 }}>
                          {sub.email[0].toUpperCase()}
                        </div>
                        <div className="info">
                          <h4>{sub.email}</h4>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${sub.status === "subscribed" ? "customer" : ""}`}
                        style={sub.status !== "subscribed" ? { background: "rgba(236,30,39,0.08)", color: "var(--yuvo-red)", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, display: "inline-flex" } : {}}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(sub.subscribedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td>
                      <div className="actions">
                        <form action={updateAction}>
                          <input type="hidden" name="id" value={sub.id} />
                          <input type="hidden" name="status" value={sub.status === "subscribed" ? "unsubscribed" : "subscribed"} />
                          <button type="submit" className="btn-edit" disabled={updatePending}>
                            <i className={`fa-solid ${sub.status === "subscribed" ? "fa-ban" : "fa-check"}`} />
                            {sub.status === "subscribed" ? "Unsubscribe" : "Subscribe"}
                          </button>
                        </form>
                        <button type="button" className="btn-danger-outline" onClick={() => setConfirmDelete(sub.id)}>
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <span>Page {page} of {totalPages}</span>
            <div className="pages">
              <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                <i className="fa-solid fa-chevron-left" />
              </button>
              {pages[0] > 1 && <span className="ellipsis">…</span>}
              {pages.map((p) => (
                <button key={p} onClick={() => goToPage(p)} className={p === page ? "active" : ""}>
                  {p}
                </button>
              ))}
              {pages[pages.length - 1] < totalPages && <span className="ellipsis">…</span>}
              <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <form action={deleteAction}>
          <input type="hidden" name="id" value={confirmDelete} />
          <ConfirmDialog message="Are you sure you want to delete this subscriber?" onConfirm={() => document.activeElement?.form?.requestSubmit()} onCancel={() => setConfirmDelete(null)} />
        </form>
      )}

      {/* Confirm Bulk Dialog */}
      {confirmBulk && (
        <form action={bulkAction}>
          <input type="hidden" name="ids" value={JSON.stringify(selectedIds)} />
          <input type="hidden" name="action" value={confirmBulk.action} />
          <ConfirmDialog
            message={`Are you sure you want to ${confirmBulk.action} ${selectedIds.length} subscriber(s)?`}
            onConfirm={() => document.activeElement?.form?.requestSubmit()}
            onCancel={() => setConfirmBulk(null)}
          />
        </form>
      )}
    </>
  );
}
