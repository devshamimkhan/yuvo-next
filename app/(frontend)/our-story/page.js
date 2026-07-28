import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Our Story | YUVO Fitness",
  description:
    "YUVO makes essential movement gear for everyday athletes. Learn about our mission, values and story.",
};

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
    <section className="story-products">
      <div className="story-products-inner">
        <div className="story-heading" style={{ marginBottom: "48px" }}>
          <h2>OUR PRODUCTS</h2>
        </div>

        <div className="rpg-product-grid">
          {products.map(product => {
            const isAffiliate = product.productType === "affiliate";
            const isComingSoon = product.productType === "comingSoon";

            return (
              <div className={`rpg-product-card ${isComingSoon ? "rpg-coming" : ""}`} key={product.id}>
                {isComingSoon ? (
                  <div className="rpg-product-image">
                    <span className="rpg-badge">Coming Soon</span>
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill unoptimized style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#f5f5f5' }} />
                    )}
                  </div>
                ) : (
                  <Link href={`/products/${product.slug}`} className="rpg-product-image" style={{ textDecoration: "none", display: "block" }}>
                    <span className="rpg-badge rpg-launch">Featured</span>
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill unoptimized style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#f5f5f5' }} />
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
      </div>
    </section>
  );
}

function ProductShowcaseSkeleton() {
  return (
    <section className="story-products">
      <div className="story-products-inner">
        <div className="story-heading" style={{ marginBottom: "48px" }}>
          <h2>OUR PRODUCTS</h2>
        </div>
        <div className="rpg-product-grid" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
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
    </section>
  );
}

// ── Page shell (static sections render immediately) ──────────────────────────
export default function AboutPage() {
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

        .page {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        /* HERO */
        .story-hero {
          min-height: 550px;
          display: flex;
          align-items: center;
          background-image:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.97) 0%,
              rgba(255, 255, 255, 0.88) 34%,
              rgba(255, 255, 255, 0.2) 67%,
              rgba(255, 255, 255, 0) 100%
            ),
            url("/assets/img/our-story-hero.jpg");
          background-size: cover;
          background-position: center right;
        }
        .story-hero-inner {
          width: min(1120px, 100%);
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(20px, 4vw, 48px);
          padding-right: clamp(20px, 4vw, 48px);
          padding-top: clamp(30px, 4vw, 58px);
        }
        .story-hero-copy {
          padding: 64px 0;
          max-width: 580px;
          position: relative;
          z-index: 2;
        }
        .story-hero h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 44px);
          font-weight: 700;
        }
        .story-short-rule {
          width: 62px; height: 4px; border-radius: 99px; background: var(--mg-blue);
          margin: 0 0 26px;
        }
        .story-hero h2 {
          margin: 0 0 10px;
          color: var(--mg-blue);
          font-size: clamp(20px, 3vw, 30px);
          line-height: 1.15;
          letter-spacing: -.035em;
          font-weight: 600;
        }
        .story-hero p {
          max-width: 650px;
          margin: 0 0 20px;
          color: #263750;
          font-size: 17px;
          line-height: 1.65;
        }
        .story-tagline {
          font-size: clamp(20px, 3vw, 30px);
          line-height: 1.15;
          letter-spacing: -.035em;
          font-weight: 600;
        }
        .story-tagline .blue { color: var(--mg-blue); }
        .story-tagline .red { color: var(--red); font-weight: 600; }

        /* DRIVERS */
        .story-drivers {
          padding: 80px 24px;
          background:
            radial-gradient(circle at 50% -20%, rgba(193,215,255,.35), transparent 46%),
            linear-gradient(135deg, #f9fbff, #eef5ff);
        }
        .story-heading { text-align: center; }
        .story-heading h2 {
          margin: 0;
          font-size: clamp(24px, 3vw, 38px);
          color: var(--mg-dark);
          font-weight: 600;
        }
        .story-heading h2:after {
          content: ""; display: block; width: 52px; height: 3px; background: var(--mg-blue);
          border-radius: 99px; margin: 0 auto 0;
        }
        .story-driver-grid {
          width: min(1120px, calc(100% - clamp(40px, 8vw, 96px)));
          margin: 48px auto 0;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
        }
        .story-driver {
          text-align: center;
          padding: 0 22px;
          border-right: 1px solid var(--mg-line);
        }
        .story-driver:last-child { border-right: 0; }
        .story-driver-icon {
          width: 76px; height: 76px; border-radius: 50%;
          margin: 0 auto 16px;
          display: grid; place-items: center;
          background: #e1ebff; color: var(--mg-blue);
        }
        .story-driver-icon svg { width: 39px; height: 39px; fill: none; stroke: currentColor; stroke-width: 1.7; }
        .story-driver h3 { margin: 0 0 9px; font-size: 16px; color: var(--mg-dark); font-weight: 600; }
        .story-driver p { margin: 0; color: var(--mg-muted); font-size: 12px; line-height: 1.35; }

        /* PROMISE */
        .story-promise {
          min-height: 430px;
          display: flex;
          align-items: center;
          background-image:
            linear-gradient(
              90deg,
              rgba(16, 33, 63, 0.96) 0%,
              rgba(16, 33, 63, 0.88) 34%,
              rgba(16, 33, 63, 0.2) 67%,
              rgba(16, 33, 63, 0) 100%
            ),
            url("/assets/img/our-promise.jpg");
          background-size: cover;
          background-position: center right;
        }
        .story-promise-inner {
          width: min(1120px, 100%);
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(20px, 4vw, 48px);
          padding-right: clamp(20px, 4vw, 48px);
        }
        .story-promise-copy {
          padding: 64px 0;
          max-width: 600px;
          color: #fff;
        }
        .story-promise h2 {
          margin: 0;
          font-size: clamp(24px, 3vw, 38px);
          font-weight: 600;
        }
        .story-promise h2:after {
          content: ""; display: block; width: 54px; height: 3px; background: #3f8cff;
          margin: 0 0 24px; border-radius: 99px;
        }
        .story-promise p {
          max-width: 600px;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          color: rgba(255,255,255,.92);
        }
        .story-promise-line {
          margin-top: 20px !important;
          color: #6faaff !important;
          font-size: 20px !important;
          font-weight: 600;
        }

        /* PRODUCTS */
        .story-products {
          padding: 50px 0 50px;
          background: #f4f7fb;
        }
        .story-products-inner {
          width: min(1120px, calc(100% - clamp(40px, 8vw, 96px)));
          margin: 0 auto;
        }
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
        .rpg-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rpg-coming .rpg-product-image img {
          filter: blur(4px);
          opacity: 0.65;
        }
        .rpg-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          background: #e6eef9;
          color: #073c86;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 600;
        }
        .rpg-launch {
          background: var(--mg-dark);
          color: #fff;
        }
        .rpg-product-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .rpg-product-body h3 {
          font-size: 15px;
          margin: 0 0 6px;
          color: var(--mg-dark);
          font-weight: 600;
        }
        .rpg-product-body p {
          font-size: 12px;
          color: var(--mg-muted);
          margin: 0 0 16px;
          flex: 1;
          line-height: 1.45;
        }
        .rpg-product-btn {
          margin-top: auto;
          min-height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
          border: 1.5px solid var(--mg-blue);
          color: var(--mg-blue);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .rpg-product-btn:hover {
          background: var(--mg-blue);
          color: #fff;
        }
        .rpg-amazon {
          background: var(--mg-blue) !important;
          color: #fff !important;
          border-color: var(--mg-blue) !important;
          box-shadow: 0 6px 14px rgba(14, 79, 168, 0.2);
        }
        .rpg-amazon:hover {
          background: #073c86 !important;
          border-color: #073c86 !important;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .story-hero { background-position: center center; }
          .story-driver-grid { grid-template-columns: repeat(3, 1fr); gap: 34px 0; }
          .story-driver:nth-child(3) { border-right: 0; }
          .rpg-product-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 680px) {
          .story-hero {
            background-image:
              linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.95) 0%,
                rgba(255, 255, 255, 0.85) 50%,
                rgba(255, 255, 255, 0) 100%
              ),
              url("/assets/img/our-story-hero.jpg");
          }
          .story-hero-copy { padding: 40px 0; }
          .story-drivers { padding-left: 0; padding-right: 0; }
          .story-driver-grid { grid-template-columns: 1fr; width: min(100% - 48px, 1120px); }
          .story-driver { border-right: 0; border-bottom: 1px solid var(--mg-line); padding: 24px; }
          .story-promise-copy { padding: 44px 24px; }
          .rpg-product-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="page">

        {/* ===== HERO ===== */}
        <section className="story-hero">
          <div className="story-hero-inner">
            <div className="story-hero-copy">
              <h1>OUR STORY</h1>
              <div className="story-short-rule"></div>
              <h2>Designed for the Everyday Mover.</h2>

              <p>
                YUVO™ is a modern movement brand created to support your active
                lifestyle with essential, accessible fitness gear. Our products
                are designed to make daily movement feel simple, enjoyable, and
                sustainable - whether you&apos;re building strength, recovering,
                or finding your rhythm.
              </p>

              <p>
                The name YUVO™ blends &ldquo;YU&rdquo; - a nod to you and your
                personal journey - with &ldquo;VO&rdquo;, inspired by words that
                evoke energy and motion. Together, YUVO™ represents your
                movement, your strength, your wellness.
              </p>

              <div className="story-tagline">
                <span className="blue">Move Freely.</span>
                <span className="red"> Live Fully.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WHAT DRIVES US ===== */}
        <section className="story-drivers">
          <div className="story-heading">
            <h2>WHAT DRIVES US</h2>
          </div>
          <div className="story-driver-grid">

            <article className="story-driver">
              <div className="story-driver-icon">
                <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.7-9-9c-1.5-3.2.4-7 4-7 2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.6 0 5.5 3.8 4 7-2 4.3-9 9-9 9Z"/></svg>
              </div>
              <h3>Movement First</h3>
              <p>Movement improves lives.</p>
            </article>

            <article className="story-driver">
              <div className="story-driver-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"/><path d="M5 21c1-6 3.5-9 7-9s6 3 7 9M3 11h3M18 11h3"/></svg>
              </div>
              <h3>For Every Body</h3>
              <p>Whether you&apos;re just starting or years into your journey, YUVO™ is for you.</p>
            </article>

            <article className="story-driver">
              <div className="story-driver-icon">
                <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 13-6l2 2M20 12a8 8 0 0 1-13 6l-2-2"/><path d="M19 4v4h-4M5 20v-4h4"/></svg>
              </div>
              <h3>Everyday Progress</h3>
              <p>Small daily actions create meaningful change.</p>
            </article>

            <article className="story-driver">
              <div className="story-driver-icon">
                <svg viewBox="0 0 24 24"><path d="M20 4C11 4 5 10 5 20c8-1 13-7 15-16Z"/><path d="M5 20c3-7 8-11 15-16"/></svg>
              </div>
              <h3>Simplicity</h3>
              <p>Movement should never feel intimidating. Our products are intuitive, approachable, and enjoyable.</p>
            </article>

            <article className="story-driver">
              <div className="story-driver-icon">
                <svg viewBox="0 0 24 24"><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-5"/></svg>
              </div>
              <h3>Thoughtful Design</h3>
              <p>High-quality materials built to perform and last.</p>
            </article>

            <article className="story-driver">
              <div className="story-driver-icon">
                <svg viewBox="0 0 24 24"><path d="M12 22c0-6-4-8-8-9 1 5 3 8 8 9ZM12 22c0-6 4-8 8-9-1 5-3 8-8 9ZM12 22V7"/><path d="M8 8c0-3 2-5 4-6 2 1 4 3 4 6-1 2-2 3-4 4-2-1-3-2-4-4Z"/></svg>
              </div>
              <h3>Lifelong Wellness</h3>
              <p>We&apos;re not building products for a season. We&apos;re helping people move well for decades.</p>
            </article>

          </div>
        </section>

        {/* ===== OUR PROMISE ===== */}
        <section className="story-promise">
          <div className="story-promise-inner">
            <div className="story-promise-copy">
              <h2>OUR PROMISE</h2>
              <p>
                To inspire more people to embrace movement as a daily habit by
                creating beautifully designed products that remove barriers and
                make movement accessible, enjoyable, and sustainable - every
                YUVO™ product should help someone move with greater confidence
                tomorrow than they did today.
              </p>
              <p className="story-promise-line">That&apos;s the YUVO™ Promise.</p>
            </div>
          </div>
        </section>

        {/* ===== OUR PRODUCTS (streams in via Suspense) ===== */}
        <Suspense fallback={<ProductShowcaseSkeleton />}>
          <ProductShowcase />
        </Suspense>

      </main>
    </>
  );
}

