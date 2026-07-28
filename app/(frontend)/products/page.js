import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Products – YUVO Fitness",
  description:
    "Shop YUVO recovery tools: foam roller sets, massage sticks, resistance bands and more. Movement essentials made for real life.",
};

// ── Dynamic: DB fetch, streams in via Suspense ────────────────────────────────
async function ProductGrid() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rpg-product-grid">
      {products.map((product) => {
        const isComingSoon = product.productType === "comingSoon";
        const isAffiliate = product.productType === "affiliate";
        const imgUrl = product.imageUrl || "/assets/img/product-kit.jpg";

        if (isComingSoon) {
          return (
            <div className="rpg-product-card rpg-coming" key={product.id}>
              <div className="rpg-product-image">
                <span className="rpg-badge">Coming Soon</span>
                <img src={imgUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div className="rpg-product-body">
                <h3 className="text-xl line-clamp-2 min-h-[2rem]">{product.name}</h3>
                <p>{product.shortDescription || product.description || "Coming Soon"}</p>
                <a className="rpg-product-btn" href="#"><i className="fa-regular fa-bell"></i> Notify Me</a>
              </div>
            </div>
          );
        }

        return (
          <div className="rpg-product-card" key={product.id}>
            <Link href={`/products/${product.slug}`} className="rpg-product-image" style={{ textDecoration: "none", display: "block" }}>
              <span className="rpg-badge rpg-launch">New Launch</span>
              <img src={imgUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </Link>
            <div className="rpg-product-body">
              <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <h3 className="text-xl font-medium line-clamp-2 min-h-[2rem]">{product.name}</h3>
              </Link>
              <p>{product.shortDescription || product.description || "Your all-in-one recovery solution."}</p>
              {isAffiliate && product.affiliateUrl ? (
                <a className="rpg-product-btn rpg-amazon" href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">Buy on Amazon</a>
              ) : (
                <Link className="rpg-product-btn rpg-amazon" href={`/products/${product.slug}`}>View Details</Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="rpg-product-grid">
      {[1, 2, 3, 4].map((i) => (
        <div className="rpg-product-card" key={i} style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
          <div className="rpg-product-image" style={{ background: '#dde5f0' }} />
          <div className="rpg-product-body">
            <div style={{ width: '80%', height: '18px', background: '#dde5f0', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ width: '100%', height: '13px', background: '#dde5f0', borderRadius: 6, marginBottom: 6 }} />
            <div style={{ width: '70%', height: '13px', background: '#dde5f0', borderRadius: 6, marginBottom: 20 }} />
            <div style={{ width: '100%', height: '40px', background: '#dde5f0', borderRadius: 8 }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

// ── Page shell (renders instantly) ───────────────────────────────────────────
export default function ProductsPage() {

  return (
    <>
      <style>{`
        :root {
          --mg-blue: #0e4fa8;
          --mg-dark: #111820;
          --mg-muted: #4b5560;
          --mg-soft: #eef5ff;
          --mg-line: rgba(55, 80, 62, 0.16);
        }
        #page-products {
          --mh-navy: #10213f;
          --mh-brand: var(--blue, #2E5AA6);
          --mh-brand-dark: #1d3f7a;
          --mh-muted: #5c6677;
          padding: 0 0 40px;
          color: var(--mh-navy);
          background:
            radial-gradient(circle at 8% 6%, rgba(220, 232, 213, 0.65), transparent 30%),
            linear-gradient(135deg, #fbfaf7 0%, #fff 48%, #f6f2ea 100%);
          overflow: hidden;
          min-height: auto;
        }
        #page-products .mh-hero h1 { font-size: 44px; }
        .prod-section {
          width: min(1120px, calc(100% - clamp(40px, 8vw, 96px)));
          margin: 0 auto;
        }
        .rpg-card {
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(255,255,255,.82);
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(20, 38, 56, .14);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .rpg-products {
          margin-top: 32px;
          position: relative;
          z-index: 3;
        }
        .rpg-products-head { text-align: center; margin-bottom: 28px; }
        .rpg-products-head h2 {
          margin: 0; font-size: 32px; color: var(--mg-dark);
          font-weight: 600; letter-spacing: -0.03em;
        }
        .rpg-products-head p { color: var(--mg-muted); font-size: 15px; margin: 8px 0 0; }
        .rpg-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .rpg-product-card {
          border: 1px solid var(--mg-line);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
        .rpg-product-image {
          height: 150px;
          position: relative;
          background: #fbfbfc;
        }
        .rpg-coming .rpg-product-image img,
        .rpg-coming-img {
          filter: blur(4px);
          opacity: 0.65;
        }
        .rpg-badge {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          background: #e6eef9; color: #073c86;
          padding: 4px 10px; border-radius: 99px;
          font-size: 10px; font-weight: 600;
        }
        .rpg-launch { background: var(--mg-dark); color: #fff; }
        .rpg-product-body {
          padding: 16px; display: flex; flex-direction: column; flex: 1;
        }
        .rpg-product-body h3 {
          font-size: 15px; margin: 0 0 6px;
          color: var(--mg-dark); font-weight: 600;
        }
        .rpg-product-body p {
          font-size: 12px; color: var(--mg-muted);
          margin: 0 0 16px; flex: 1; line-height: 1.45;
        }
        .rpg-product-btn {
          margin-top: auto; min-height: 40px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          gap: 6px; text-decoration: none;
          border: 1.5px solid var(--mg-blue);
          color: var(--mg-blue); font-size: 13px; font-weight: 600;
          transition: all 0.2s ease;
        }
        .rpg-product-btn:hover { background: var(--mg-blue); color: #fff; }
        .rpg-amazon {
          background: var(--mg-blue) !important; color: #fff !important;
          border-color: var(--mg-blue) !important;
          box-shadow: 0 6px 14px rgba(14, 79, 168, 0.2);
        }
        .rpg-amazon:hover { background: #073c86 !important; border-color: #073c86 !important; }
        .prod-values { margin-top: 24px; padding: 0; }
        .prod-values-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .prod-value-card {
          display: flex; align-items: center; gap: 14px; padding: 20px;
          background: rgba(255,255,255,.72); border: 1px solid rgba(255,255,255,.82);
          border-radius: 16px; box-shadow: 0 8px 24px rgba(20, 38, 56, .08);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .prod-value-icon {
          width: 56px; height: 56px; min-width: 56px; border-radius: 50%;
          display: grid; place-items: center;
          background: var(--mg-soft); color: var(--mg-blue); font-size: 24px;
        }
        .prod-value-text h4 { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: var(--mg-dark); }
        .prod-value-text p { margin: 0; font-size: 12.5px; color: var(--mg-muted); line-height: 1.45; }
        @media (max-width: 1024px) {
          .rpg-product-grid { grid-template-columns: repeat(2, 1fr); }
          .prod-values-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .rpg-product-grid { grid-template-columns: 1fr; }
          .prod-values-grid { grid-template-columns: 1fr; }
          .rpg-products { padding: 24px 16px; }
          .prod-section { width: calc(100% - 32px); }
        }
      `}</style>

      <main className="page" id="page-products">

        {/* ===== HERO ===== */}
        <section className="mh-hero" aria-label="Products hero">
          <div className="mh-hero-inner">
            <div className="mh-hero-copy">
              <h1>Movement Essentials.<br />Made for Real Life.</h1>
              <p className="mh-hero-text">
                Recovery. Mobility. Performance.<br />
                Everything you need to move better, every day.
              </p>
            </div>
          </div>
        </section>

        {/* ===== PRODUCTS GRID ===== */}
        <div className="prod-section">
          <section className="rpg-products">
            <div className="rpg-products-head">
              <h2>Our Products</h2>
              <p>Thoughtfully designed gear to help you move better, recover smarter, and live fully.</p>
            </div>

            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid />
            </Suspense>
          </section>

          {/* ===== CORE VALUES ===== */}
          <section className="prod-values">
            <div className="prod-values-grid">
              <div className="prod-value-card">
                <div className="prod-value-icon"><i className="fa-solid fa-leaf"></i></div>
                <div className="prod-value-text">
                  <h4>Simplicity</h4>
                  <p>Straightforward tools that works without complication.</p>
                </div>
              </div>
              <div className="prod-value-card">
                <div className="prod-value-icon"><i className="fa-regular fa-calendar-check"></i></div>
                <div className="prod-value-text">
                  <h4>Consistency</h4>
                  <p>Gear that supports daily habits, not just trends.</p>
                </div>
              </div>
              <div className="prod-value-card">
                <div className="prod-value-icon"><i className="fa-solid fa-shield"></i></div>
                <div className="prod-value-text">
                  <h4>Quality You Can Feel</h4>
                  <p>High-quality materials built to perform and last.</p>
                </div>
              </div>
              <div className="prod-value-card">
                <div className="prod-value-icon"><i className="fa-regular fa-user"></i></div>
                <div className="prod-value-text">
                  <h4>For Real Life</h4>
                  <p>Designed for people with real routines.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </main>
    </>
  );
}

