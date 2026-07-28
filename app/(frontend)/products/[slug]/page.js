import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug: slug },
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.shortDescription || product.description?.substring(0, 160) || "",
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const raw = await prisma.product.findUnique({
    where: { slug: slug },
  });

  if (!raw) {
    notFound();
  }

  // Serialize Prisma Decimal and Date types so they can be passed to a Client Component
  const product = {
    ...raw,
    price: raw.price?.toString() ?? null,
    comparePrice: raw.comparePrice?.toString() ?? null,
    createdAt: raw.createdAt?.toISOString() ?? null,
    updatedAt: raw.updatedAt?.toISOString() ?? null,
  };

  return (
    <>
      <style>{`
        :root {
          --mg-blue: #0e4fa8;
          --mg-dark: #111820;
          --mg-muted: #4b5560;
          --mg-soft: #eef5ff;
          --mg-line: rgba(55, 80, 62, 0.16);
          --mg-red: #da291c;
        }
        #page-pdp {
          padding: 120px 0 80px;
          background: #ffffff;
          font-family: 'Poppins', sans-serif;
          color: var(--mg-dark);
        }
        .pdp-v2-container {
          width: min(1120px, calc(100% - clamp(40px, 8vw, 96px)));
          margin: 0 auto;
        }
        .pdp-overview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 64px;
          align-content: center;
        }
        .pdp-gallery-main {
          width: 100%;
          height: 480px;
          border-radius: 12px;
          overflow: hidden;
          background: #f4f6f8;
          margin-bottom: 12px;
          position: relative;
        }
        .pdp-gallery-thumbs {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }
        .pdp-thumbs-track {
          display: flex;
          gap: 10px;
          flex: 1;
          overflow: hidden;
        }
        .pdp-thumb-arrow {
          width: 32px; height: 32px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: #f4f6f8; border: 1px solid var(--mg-line);
          border-radius: 50%; cursor: pointer;
          font-size: 14px; color: var(--mg-dark);
          transition: background 0.2s;
        }
        .pdp-thumb-arrow:hover { background: #e6eef9; }
        .pdp-thumb {
          width: 90px; min-width: 90px;
          aspect-ratio: 4/3;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          position: relative;
          transition: border-color 0.2s;
        }
        .pdp-thumb.active { border-color: var(--mg-blue); }
        /* Center lightbox thumbnails */
        .yarl__thumbnails_container { justify-content: center !important; }
        .pdp-breadcrumbs {
          font-size: 13px; color: var(--mg-muted); margin-bottom: 16px;
        }
        .pdp-breadcrumbs a { color: var(--mg-muted); text-decoration: none; }
        .pdp-breadcrumbs a:hover { color: var(--mg-blue); }
        .pdp-overview-info h1 {
          font-size: 28px; font-weight: 600; line-height: 1;
          margin: 0 0 12px; color: var(--mg-dark); letter-spacing: -0.02em;
        }
        .pdp-rating {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; color: var(--mg-blue);
          margin-bottom: 16px;
        }
        .pdp-rating i { color: #f6a919; font-size: 12px; }
        .pdp-price-block { margin-bottom: 8px; }
        .pdp-price { font-size: 28px; font-weight: 700; color: var(--mg-red); margin-right: 12px; }
        .pdp-price-old { font-size: 20px; font-weight: 500; color: #999; text-decoration: line-through; }
        .pdp-shipping { font-size: 13px; color: var(--mg-muted); margin-bottom: 16px; }
        .pdp-kit-list h4 { font-size: 14px; font-weight: 700; margin: 0 0 5px; color: var(--mg-dark); }
        .pdp-kit-list ul { list-style: none; padding: 0; margin: 0 0 20px; }
        .pdp-kit-list li {
          position: relative; padding-left: 16px;
          font-size: 14px; color: var(--mg-muted); margin-bottom: 5px;
        }
        .pdp-kit-list li::before {
          content: ""; position: absolute; left: 0; top: 8px;
          width: 6px; height: 6px; border-radius: 50%; background: var(--mg-blue);
        }
        .pdp-actions { display: flex; gap: 16px; margin-bottom: 12px; }
        .pdp-btn {
          height: 48px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          gap: 8px; font-size: 15px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          padding: 0 24px; flex: 1; transition: all 0.2s;
        }
        .pdp-btn-red { background: var(--mg-red); color: #fff; border: none; }
        .pdp-btn-red:hover { background: #b72015; color: #fff; }
        .pdp-btn-outline { background: #fff; color: var(--mg-dark); border: 1px solid var(--mg-dark); }
        .pdp-btn-outline:hover { background: #f4f6f8; }
        .pdp-secure { font-size: 12px; color: var(--mg-muted); }
        .pdp-banner {
          background: #f9fafc; border-radius: 16px;
          padding: 40px; text-align: center; margin-bottom: 64px;
        }
        .pdp-banner h2 { font-size: 24px; font-weight: 600; margin: 0 0 32px; color: var(--mg-dark); }
        .pdp-banner-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; position: relative;
        }
        .pdp-banner-grid::before {
          content: ""; position: absolute; left: 33.33%; top: 0; bottom: 0;
          width: 1px; background: var(--mg-line);
        }
        .pdp-banner-grid::after {
          content: ""; position: absolute; left: 66.66%; top: 0; bottom: 0;
          width: 1px; background: var(--mg-line);
        }
        .pdp-banner-item { display: flex; flex-direction: column; align-items: center; padding: 0 16px; text-align: center; }
        .pdp-banner-icon { font-size: 28px; color: var(--mg-blue); margin-bottom: 16px; }
        .pdp-banner-item h4 { font-size: 15px; font-weight: 600; margin: 0 0 4px; color: var(--mg-dark); }
        .pdp-banner-item p { font-size: 13px; color: var(--mg-muted); margin: 0; }
        .pdp-features {
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
          margin-bottom: 64px; align-items: center;
          background: #f9fafc; padding: 48px; border-radius: 16px;
        }
        .pdp-features-content h2 { font-size: 24px; font-weight: 600; margin: 0 0 12px; }
        .pdp-features-content > p { font-size: 14px; color: var(--mg-muted); margin: 0 0 32px; line-height: 1.5; }
        .pdp-feature-list { display: flex; flex-direction: column; gap: 24px; }
        .pdp-feature-item { display: flex; gap: 16px; }
        .pdp-feature-icon {
          width: 48px; height: 48px; min-width: 48px; border-radius: 50%;
          background: var(--mg-soft); color: var(--mg-blue);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .pdp-feature-text h4 { font-size: 14px; font-weight: 600; margin: 0 0 4px; color: var(--mg-dark); }
        .pdp-feature-text p { font-size: 13px; color: var(--mg-muted); margin: 0; line-height: 1.45; }
        .pdp-features-image {
          width: 100%; height: 500px; border-radius: 16px; overflow: hidden; position: relative;
        }
        .pdp-faq-section { background: #f9fafc; border-radius: 16px; padding: 40px; margin-bottom: 40px; }
        .pdp-faq-section h2 { font-size: 20px; font-weight: 600; margin: 0 0 24px; }
        .pdp-faq-item { border-bottom: 1px solid var(--mg-line); padding: 20px 0; }
        .pdp-faq-item:last-child { border-bottom: none; padding-bottom: 0; }
        .pdp-faq-question {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 14px; font-weight: 600; color: var(--mg-dark); cursor: pointer;
        }
        .pdp-faq-question i { transition: transform 0.2s ease; }
        .pdp-faq-item.active .pdp-faq-question i { transform: rotate(180deg); }
        .pdp-faq-answer { font-size: 13px; color: var(--mg-muted); margin: 8px 0 0; line-height: 1.5; }
        @media (max-width: 1024px) {
          .pdp-overview, .pdp-features { grid-template-columns: 1fr; }
          .pdp-banner-grid::before, .pdp-banner-grid::after { display: none; }
          .pdp-banner-grid { grid-template-columns: 1fr; gap: 32px; }
          .pdp-features-image { height: 300px; }
        }
        @media (max-width: 600px) {
          .pdp-actions { flex-direction: column; }
        }
      `}</style>

      <ProductDetailClient product={product} />
    </>
  );
}
