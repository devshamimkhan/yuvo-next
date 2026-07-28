export const dynamic = "force-dynamic";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CustomersTableSection from "@/components/CustomersTableSection";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import { getCustomersAction } from "./actions";

export const metadata = {
  title: "Admin Customers | YUVO",
};

function PaginationNav({ pagination, filters }) {
  const { page, totalPages, totalCount, perPage } = pagination;

  if (totalPages <= 1) return null;

  const buildHref = (p) =>
    `/admin/customers?search=${encodeURIComponent(filters.search)}&role=${filters.role}&page=${p}`;

  return (
    <div className="pagination">
      <span>
        Showing{" "}
        {totalCount > 0 ? (page - 1) * perPage + 1 : 0}
        &ndash;
        {Math.min(page * perPage, totalCount)}{" "}
        of {totalCount} users
      </span>
      <div className="pages">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className="page-link">
            <i className="fa-solid fa-chevron-left" />
          </Link>
        ) : (
          <button type="button" disabled>
            <i className="fa-solid fa-chevron-left" />
          </button>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) {
              acc.push(
                <span className="ellipsis" key={`ellipsis-${p}`}>
                  &hellip;
                </span>
              );
            }
            if (p === page) {
              acc.push(
                <button type="button" className="active" key={p}>
                  {p}
                </button>
              );
            } else {
              acc.push(
                <Link key={p} href={buildHref(p)} className="page-link">
                  {p}
                </Link>
              );
            }
            return acc;
          }, [])}

        {page < totalPages ? (
          <Link href={buildHref(page + 1)} className="page-link">
            <i className="fa-solid fa-chevron-right" />
          </Link>
        ) : (
          <button type="button" disabled>
            <i className="fa-solid fa-chevron-right" />
          </button>
        )}
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="error-state">
      <i className="fa-regular fa-circle-exclamation" />
      <h3>Failed to Load Customers</h3>
      <p>{message}</p>
      <a href="/admin/customers" className="btn-retry">
        <i className="fa-solid fa-rotate" /> Retry
      </a>
    </div>
  );
}

export default async function AdminCustomersPage({ searchParams }) {
  const params = await searchParams;
  const filters = {
    search: params?.search || "",
    role: params?.role || "all",
    page: params?.page || "1",
  };

  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  let data;
  let error = null;

  try {
    data = await getCustomersAction(filters);
  } catch (err) {
    error = err.message || "Failed to load customers.";
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            Customers <span className="sub">Manage your users</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

      <form className="toolbar" action="/admin/customers">
        <div className="toolbar-left">
          <input type="hidden" name="search" value={filters.search} />
          <select
            className="filter-select"
            name="role"
            defaultValue={filters.role}
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <input type="hidden" name="page" value="1" />
          <button className="btn-outline" type="submit">
            <i className="fa-solid fa-filter" /> Apply
          </button>
        </div>
        <div className="toolbar-right">
          {!error && data && (
            <span className="count-badge">{data.pagination.totalCount} total users</span>
          )}
        </div>
      </form>

      <section className="table-card">
        <div className="card-header">
          <h3>All Customers</h3>
          {!error && data && (
            <span className="count-badge">{data.pagination.totalCount} users</span>
          )}
        </div>
        <div className="table-wrap">
          {error ? (
            <ErrorState message={error} />
          ) : data ? (
            <CustomersTableSection
                users={data.users}
                filters={filters}
              />
          ) : null}
        </div>

        {!error && data && (
          <PaginationNav
            pagination={data.pagination}
            filters={filters}
          />
        )}
      </section>
    </>
  );
}
