export const dynamic = "force-dynamic";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductDeleteButton from "@/components/ProductDeleteButton";
import FeaturedToggle from "@/components/FeaturedToggle";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import { getProductsAction } from "./actions";


export const metadata = {
  title: "Admin Products | YUVO",
};

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function thumbStyle(product) {
  if (!product.imageUrl) return {};
  return { backgroundImage: `url("${product.imageUrl}")` };
}

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";
  const filters = {
    search: params?.search || "",
    status: params?.status || "all",
  };
  const products = await getProductsAction(filters);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            Products <span className="sub">Manage your catalog</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

        <form className="toolbar" action="/admin/products">
          <div className="toolbar-left">
            <input type="hidden" name="search" value={filters.search} />
            <select
              className="filter-select"
              name="status"
              defaultValue={filters.status}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <button className="btn-outline" type="submit">
              <i className="fa-solid fa-filter" /> Apply
            </button>
          </div>
          <div className="toolbar-right">
            <Link href="/admin/products/create" className="btn-primary">
              <i className="fa-solid fa-plus" /> Add New Product
            </Link>
          </div>
        </form>

        <section className="table-card">
          <div className="card-header">
            <h3>All Products</h3>
            <span className="count-badge">{products.length} products</span>
          </div>
          <div className="table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Featured</th>
                  <th>Status</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td>
                        <div className="product-cell">
                          <div
                            className={`thumb ${product.imageUrl ? "has-thumb" : ""}`}
                            style={thumbStyle(product)}
                          >
                            {!product.imageUrl ? (
                              <i className="fa-regular fa-image" />
                            ) : null}
                          </div>
                          <div className="info">
                            <h4>{product.name}</h4>
                          </div>
                        </div>
                      </td>
                      <td className="price">{money(product.price)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <FeaturedToggle product={product} />
                      </td>
                      <td>
                        <span className={`status-pill ${product.status}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="align-right">
                        <div className="actions">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="btn-edit"
                          >
                            <i className="fa-regular fa-pen-to-square" /> Edit
                          </Link>
                          <ProductDeleteButton product={product} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-table">
                      <i className="fa-regular fa-box-open" />
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>Showing {products.length} products</span>
            <div className="pages">
              <button type="button" disabled>
                <i className="fa-solid fa-chevron-left" />
              </button>
              <button type="button" className="active">
                1
              </button>
              <button type="button" disabled>
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>
        </section>

    </>
  );
}

