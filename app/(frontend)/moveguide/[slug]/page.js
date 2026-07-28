import { Suspense } from "react";
import { notFound } from "next/navigation";
import MoveGuideClient from "./MoveGuideClient";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return { title: "Not Found | YUVO" };

  const guide = await prisma.moveGuide.findUnique({
    where: { slug: slug },
  });
  
  if (!guide) return { title: "Not Found | YUVO" };
  
  return {
    title: `${guide.title} | YUVO`,
    description: guide.description || "Guided movement timer for your YUVO recovery session.",
  };
}

// ── Dynamic: products section streams in via Suspense ────────────────────────
async function ProductShowcase() {
  const rawProducts = await prisma.product.findMany({
    where: { featured: true, status: "active" },
    take: 4,
    orderBy: { id: "desc" },
  });

  if (rawProducts.length === 0) return null;

  const products = rawProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    productType: p.productType,
    imageUrl: p.imageUrl,
    shortDescription: p.shortDescription || p.description?.substring(0, 100) || "",
    affiliateUrl: p.affiliateUrl
  }));

  return (
    <section className="rpg-card rpg-products">
      <div className="rpg-products-head">
        <h2>Our Products</h2>
        <p>Thoughtfully designed gear to help you move better, recover smarter, and live fully.</p>
      </div>
      <div className="rpg-product-grid">
        {products.map((product) => {
          const isAffiliate  = product.productType === "affiliate";
          const isComingSoon = product.productType === "comingSoon";

          return (
            <div className={`rpg-product-card ${isComingSoon ? "rpg-coming" : ""}`} key={product.id}>
              {isComingSoon ? (
                <div className="rpg-product-image">
                  <span className="rpg-badge">Coming Soon</span>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill unoptimized style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#f5f5f5" }} />
                  )}
                </div>
              ) : (
                <Link href={`/products/${product.slug}`} className="rpg-product-image" style={{ textDecoration: "none", display: "block" }}>
                  <span className="rpg-badge rpg-launch">Featured</span>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill unoptimized style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#f5f5f5" }} />
                  )}
                </Link>
              )}

              <div className="rpg-product-body">
                {isComingSoon ? (
                  <h3>{product.name}</h3>
                ) : (
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3>{product.name}</h3>
                  </Link>
                )}

                <p>{product.shortDescription}</p>

                {isAffiliate ? (
                  <a className="rpg-product-btn rpg-amazon" href={product.affiliateUrl || "https://www.amazon.com/"} target="_blank" rel="noopener noreferrer">
                    Buy on Amazon
                  </a>
                ) : isComingSoon ? (
                  <button type="button" className="rpg-product-btn" style={{ width: "100%", border: "1.5px solid var(--mg-blue)", background: "transparent" }}>
                    <i className="fa-regular fa-bell"></i> Notify Me
                  </button>
                ) : (
                  <Link href={`/products/${product.slug}`} className="rpg-product-btn">
                    View Details
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProductShowcaseSkeleton() {
  return (
    <div className="rpg-card rpg-products" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
      <div className="rpg-products-head">
        <h2>Our Products</h2>
        <p>Thoughtfully designed gear to help you move better, recover smarter, and live fully.</p>
      </div>
      <div className="rpg-product-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="rpg-product-card" key={i}>
            <div className="rpg-product-image" style={{ background: '#dde5f0' }} />
            <div className="rpg-product-body">
              <div style={{ width: '80%', height: '18px', background: '#dde5f0', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ width: '100%', height: '13px', background: '#dde5f0', borderRadius: 6, marginBottom: 6 }} />
              <div style={{ width: '70%', height: '13px', background: '#dde5f0', borderRadius: 6, marginBottom: 20 }} />
              <div style={{ width: '100%', height: '40px', background: '#dde5f0', borderRadius: 8 }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

export default async function MoveGuidePage({ params }) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }

  const guide = await prisma.moveGuide.findUnique({
    where: { slug: slug },
  });

  if (!guide) {
    notFound();
  }

  return (
    <>
      <style>{`
        :root {
          --mg-blue: #0e4fa8;
          --mg-dark: #111820;
          --mg-muted: #4b5560;
          --mg-soft: #eef5ff;
          --mg-line: rgba(55, 80, 62, 0.16);
          --mg-red: #EC1E27;
        }
        body { background: #f9faf7 !important; }
        body::before, body::after { display: none !important; content: none !important; }
        #page-moveguide-v2.page {
          padding: 132px 0 64px !important;
          animation: none !important;
          min-height: auto !important;
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        .routine-page-inner {
          width: min(1120px, calc(100% - 32px));
          margin: auto; position: relative; z-index: 1;
        }
        .rpg-top-link {
          display: flex; gap: 18px; align-items: center; margin: 0 0 28px 4px;
          color: var(--mg-blue); font-weight: 600; font-size: 16px;
        }
        .rpg-top-link a { color: inherit; text-decoration: none; transition: opacity 0.2s; }
        .rpg-top-link a:hover { opacity: 0.8; text-decoration: underline; }
        .rpg-top-divider { width: 1px; height: 20px; background: var(--mg-line); }
        .rpg-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(460px, 1.1fr); gap: 24px; }
        .rpg-card {
          background: #ffffff; border: 1px solid var(--mg-line); border-radius: 24px;
          box-shadow: 0 16px 40px rgba(20, 38, 56, 0.08);
        }
        .rpg-move { padding: 36px 32px; display: flex; flex-direction: column; min-height: 820px; }
        .rpg-move-num, .rpg-label {
          color: var(--mg-blue); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .rpg-move-num { font-size: 14px; margin-bottom: 12px; }
        .rpg-move h1 {
          font-size: clamp(22px, 3.5vw, 38px); line-height: 1.15; letter-spacing: -0.03em;
          margin: 0; color: var(--mg-dark); font-weight: 600;
        }
        .rpg-rule {
          width: 48px; height: 3px; background: var(--mg-blue); border-radius: 99px;
          margin: 16px 0 24px; flex-shrink: 0;
        }
        .rpg-exercise { border-radius: 16px; overflow: hidden; aspect-ratio: 1.6 / 1; background: #e6eef9; }
        .rpg-timing {
          margin-top: 24px; padding: 14px 16px; border-radius: 12px;
          background: var(--mg-soft); color: #073c86; font-size: 13.5px; font-weight: 600;
          display: flex; justify-content: space-between; gap: 12px; align-items: center;
        }
        .rpg-timing > span:last-child {
          background: #fff; border-radius: 99px; padding: 5px 12px;
          color: var(--mg-muted); font-size: 12px; white-space: nowrap;
        }
        .rpg-instruction { font-size: 15.5px; line-height: 1.6; color: var(--mg-dark); margin: 24px 0 0; }
        .rpg-disclaimer {
          margin-top: auto; padding: 16px 20px; border-radius: 14px; background: #f4f5f7;
          display: grid; grid-template-columns: 24px 1fr; gap: 12px;
          color: var(--mg-muted); font-size: 12.5px; line-height: 1.5;
        }
        .rpg-info-icon {
          width: 22px; height: 22px; border: 1.5px solid var(--mg-muted); border-radius: 50%;
          display: grid; place-items: center; color: var(--mg-muted); font-weight: 600; font-size: 12px; flex-shrink: 0;
        }
        .rpg-right { overflow: hidden; }
        .rpg-timer-area { padding: 32px; }
        .rpg-label { font-size: 15px; margin: 0 0 12px; display: block; }
        .rpg-timer {
          text-align: center; font-size: 44px; line-height: 1; color: #073c86;
          font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.02em;
        }
        .rpg-timer-copy { text-align: center; color: var(--mg-muted); font-size: 15px; margin-top: 10px; }
        .rpg-progress {
          height: 6px; background: #e6eef9; border-radius: 99px; overflow: hidden; margin: 24px 0;
        }
        .rpg-progress span {
          display: block; height: 100%; background: var(--mg-blue); border-radius: 99px; transition: width 0.3s ease;
        }
        .rpg-controls { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .rpg-controls button {
          min-width: 104px; min-height: 46px; border: 0; border-radius: 99px;
          font: 600 14px Poppins, sans-serif; cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .rpg-controls button:hover:not(:disabled) { transform: translateY(-1px); }
        .rpg-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
        .rpg-start { background: var(--mg-blue) !important; color: #fff !important; box-shadow: 0 8px 20px rgba(14, 79, 168, 0.25); }
        .rpg-start:hover:not(:disabled) { background: #073c86 !important; }
        .rpg-pause, .rpg-skip { background: #e6eef9 !important; color: #073c86 !important; }
        .rpg-restart { background: #fff0f0 !important; color: var(--mg-red) !important; }
        .rpg-tools, .rpg-steps { border-top: 1px solid var(--mg-line); padding: 28px 32px; }
        .rpg-tools-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .rpg-tool { text-align: center; font-size: 13.5px; font-weight: 600; color: var(--mg-dark); }
        .rpg-tool-img { height: 110px; display: grid; place-items: center; margin-bottom: 8px; }
        .rpg-tool-img img { max-width: 85%; max-height: 85%; object-fit: contain; }
        .rpg-step {
          display: grid; grid-template-columns: 40px minmax(0, 1fr) 130px; gap: 12px;
          align-items: center; padding: 12px; border-bottom: 1px solid var(--mg-line);
          transition: background 0.2s ease;
        }
        .rpg-step:last-child { border-bottom: 0; }
        .rpg-step.active { background: var(--mg-soft); border-radius: 12px; border-bottom-color: transparent; }
        .rpg-step-num {
          width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
          background: #e6eef9; color: #073c86; font-weight: 700; font-size: 13px;
        }
        .rpg-step.active .rpg-step-num, .rpg-step.completed .rpg-step-num { background: var(--mg-blue); color: #fff; }
        .rpg-step-title { font-weight: 500; color: var(--mg-dark); font-size: 14.5px; }
        .rpg-step.active .rpg-step-title { font-weight: 600; }
        .rpg-step-tool {
          display: flex; align-items: center; gap: 8px; color: var(--mg-muted);
          font-size: 13px; white-space: nowrap; justify-content: flex-end;
        }
        .rpg-why { margin-top: 24px; padding: 40px 32px; background: #ffffff; }
        .rpg-why h2 {
          font-size: 32px; margin: 0 0 8px; letter-spacing: -0.03em; color: var(--mg-dark); font-weight: 600;
        }
        .rpg-why h2:after {
          content: ""; display: block; width: 42px; height: 3px; background: var(--mg-blue);
          margin-top: 12px; border-radius: 99px;
        }
        .rpg-why > p { color: var(--mg-muted); font-size: 15px; margin: 16px 0 32px; }
        .rpg-benefits { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .rpg-benefit { text-align: center; padding: 0 8px; }
        .rpg-benefit:not(:last-child) { border-right: 1px solid var(--mg-line); }
        .rpg-benefit-icon {
          width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center;
          margin: 0 auto 12px; background: var(--mg-soft); color: var(--mg-blue); font-size: 24px;
        }
        .rpg-benefit h3 { font-size: 15px; margin: 0 0 6px; color: var(--mg-dark); font-weight: 600; }
        .rpg-benefit p { font-size: 12.5px; color: var(--mg-muted); margin: 0; line-height: 1.4; }
        .rpg-products { margin-top: 24px; padding: 40px 32px; }
        .rpg-products-head { text-align: center; margin-bottom: 28px; }
        .rpg-products-head h2 { margin: 0; font-size: 32px; color: var(--mg-dark); font-weight: 600; letter-spacing: -0.03em; }
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
        @media (max-width: 1024px) {
          .rpg-grid { grid-template-columns: 1fr; }
          .rpg-move { min-height: auto; }
          .rpg-benefits { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .rpg-benefit:not(:last-child) { border-right: 0; }
          .rpg-product-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .routine-page-inner { width: calc(100% - 24px); }
          .rpg-top-link { font-size: 14px; }
          .rpg-move { padding: 24px 20px; }
          .rpg-move h1 { font-size: 30px; }
          .rpg-timer { font-size: 64px; }
          .rpg-timing { flex-direction: column; align-items: flex-start; }
          .rpg-timing > span:last-child { align-self: flex-start; }
          .rpg-controls button { min-width: 90px; min-height: 42px; font-size: 13px; }
          .rpg-tools-grid, .rpg-product-grid, .rpg-benefits { grid-template-columns: 1fr; }
          .rpg-benefit:not(:last-child) { border-bottom: 1px solid var(--mg-line); padding-bottom: 16px; }
          .rpg-step { grid-template-columns: 32px 1fr; }
          .rpg-step-tool { grid-column: 2; justify-content: flex-start; margin-top: 4px; }
          .rpg-timer-area, .rpg-tools, .rpg-steps, .rpg-why, .rpg-products { padding: 24px 20px; }
        }
      `}</style>
      
      <MoveGuideClient guide={guide} />
      
      <div style={{ width: "min(1120px, calc(100% - 32px))", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Suspense fallback={<ProductShowcaseSkeleton />}>
          <ProductShowcase />
        </Suspense>
      </div>
    </>
  );
}
