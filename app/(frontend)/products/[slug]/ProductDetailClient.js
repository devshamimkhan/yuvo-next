"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function ProductDetailClient({ product }) {
  const [activeThumb, setActiveThumb] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sliderStart, setSliderStart] = useState(0);
  const VISIBLE = 3; // number of thumbs visible at once
  const THUMB_W = 100; // px (thumb width 90 + gap 10)

  // Parse gallery images (galleryImages may be a JSON array or already parsed)
  const mainImage = product?.imageUrl ? { src: product.imageUrl, alt: product.name } : null;
  const rawGallery = (() => {
    const g = product?.galleryImages;
    if (Array.isArray(g)) return g;
    if (typeof g === "string") { try { return JSON.parse(g); } catch { return []; } }
    return [];
  })();
  const galleryImages = [
    ...(mainImage ? [mainImage] : []),
    ...rawGallery.map(url => ({ src: url, alt: product.name }))
  ];

  // Helper to parse JSON fields
  function parseField(field) {
    if (Array.isArray(field)) return field;
    if (typeof field === "string") { try { return JSON.parse(field); } catch { return null; } }
    if (field && typeof field === "object") return field;
    return null;
  }

  // Convert React Icons name (FaHeartPulse) or FA class (fa-solid fa-check) to FA class string
  function toFaClass(icon) {
    if (!icon) return "fa-solid fa-circle-dot";
    if (icon.includes(" ")) return icon; // already a full FA class string
    if (icon.startsWith("Fa")) {
      const kebab = icon
        .substring(2)
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
      return `fa-solid fa-${kebab}`;
    }
    return `fa-solid fa-${icon.toLowerCase()}`;
  }

  function prevThumb() {
    if (galleryImages.length === 0) return;
    const newIdx = activeThumb === 0 ? galleryImages.length - 1 : activeThumb - 1;
    setActiveThumb(newIdx);
    setSliderStart((s) => Math.max(0, Math.min(newIdx, s > newIdx ? newIdx : s)));
  }
  function nextThumb() {
    if (galleryImages.length === 0) return;
    const newIdx = activeThumb === galleryImages.length - 1 ? 0 : activeThumb + 1;
    setActiveThumb(newIdx);
    setSliderStart((s) => {
      const maxStart = Math.max(0, galleryImages.length - VISIBLE);
      const newStart = newIdx >= s + VISIBLE ? Math.min(newIdx - VISIBLE + 1, maxStart) : s;
      return newStart;
    });
  }

  // Parse kit items
  const kitItems = (() => { const v = parseField(product?.kitItems); return Array.isArray(v) ? v : []; })();

  // Parse features (Middle Banner)
  const featuresRaw = parseField(product?.features);
  const featuresData = featuresRaw && !Array.isArray(featuresRaw) && typeof featuresRaw === 'object' ? featuresRaw : null;
  const featureSectionTitle = featuresData?.sectionTitle || "Key Features";
  const featureItems = featuresData?.items || [];

  // Parse additional content (Features block)
  const additionalRaw = parseField(product?.additionalContent);
  const additionalContent = additionalRaw && !Array.isArray(additionalRaw) && typeof additionalRaw === 'object' ? additionalRaw : null;
  const additionalTitle = additionalContent?.title || "";
  const additionalDesc = additionalContent?.description || "";
  const additionalBanner = additionalContent?.bannerUrl || "";
  const additionalItems = additionalContent?.items || [];

  // Parse FAQs
  const faqs = (() => { const v = parseField(product?.faqs); return Array.isArray(v) ? v : []; })();

  return (
    <main className="page" id="page-pdp">
      <div className="pdp-v2-container">

        {/* ===== TOP OVERVIEW ===== */}
        <div className="pdp-overview">
          {/* Gallery */}
          <div className="pdp-overview-visual">
            <div className="pdp-gallery-main" onClick={() => { setLightboxIndex(activeThumb); setLightboxOpen(true); }} style={{ cursor: "pointer" }}>
              {galleryImages.length > 0 ? (
                <Image
                  src={galleryImages[activeThumb]?.src || "/assets/img/placeholder.png"}
                  alt={galleryImages[activeThumb]?.alt || "Product image"}
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                  priority
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  No Image Available
                </div>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="pdp-gallery-thumbs">
                <button className="pdp-thumb-arrow" onClick={prevThumb} aria-label="Previous image">
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <div className="pdp-thumbs-track">
                  <div style={{ display: 'flex', gap: '10px', transform: `translateX(-${sliderStart * THUMB_W}px)`, transition: 'transform 0.3s ease' }}>
                    {galleryImages.map((img, i) => (
                      <div
                        key={i}
                        className={`pdp-thumb${activeThumb === i ? " active" : ""}`}
                        onClick={() => setActiveThumb(i)}
                      >
                        <Image src={img.src} alt={img.alt} fill unoptimized style={{ objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
                <button className="pdp-thumb-arrow" onClick={nextThumb} aria-label="Next image">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pdp-overview-info">
            <h1>{product?.name}</h1>

            <div className="pdp-rating">
              <div>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              {product?.rating || 5.0}
            </div>

            <div className="pdp-price-block">
              <span className="pdp-price">${Number(product?.price || 0).toFixed(2)}</span>
              {product?.comparePrice && (
                <span className="pdp-price-old">${Number(product.comparePrice).toFixed(2)}</span>
              )}
            </div>
            
            {product?.shipping && (
              <div className="pdp-shipping">{product.shipping}</div>
            )}

            {kitItems.length > 0 && (
              <div className="pdp-kit-list">
                <h4>What&apos;s in the kit:</h4>
                <ul>
                  {kitItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pdp-actions">
              {product?.productType === 'affiliate' && product?.affiliateUrl ? (
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdp-btn pdp-btn-red"
                >
                  <i className="fa-brands fa-amazon"></i> Buy Now
                </a>
              ) : (
                <button className="pdp-btn pdp-btn-red">
                  Add to Cart
                </button>
              )}
              <Link href="/moveguide" className="pdp-btn pdp-btn-outline">
                Discover the Move Hub
              </Link>
            </div>
            {product?.productType === 'affiliate' && (
              <div className="pdp-secure">Ship &amp; sold through external partner. Secure checkout.</div>
            )}
          </div>
        </div>

        {/* ===== MIDDLE BANNER (FEATURES) ===== */}
        {featureItems.length > 0 && (
          <div className="pdp-banner">
            <h2>{featureSectionTitle}</h2>
            <div className="pdp-banner-grid">
              {featureItems.map((item, i) => (
                <div className="pdp-banner-item" key={i}>
                  {item.icon && <div className="pdp-banner-icon"><i className={toFaClass(item.icon)}></i></div>}
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ADDITIONAL CONTENT (FEATURES) ===== */}
        {additionalContent && (additionalTitle || additionalItems.length > 0) && (
          <div className="pdp-features">
            <div className="pdp-features-content">
              {additionalTitle && <h2>{additionalTitle}</h2>}
              {additionalDesc && <p>{additionalDesc}</p>}
              <div className="pdp-feature-list">
                {additionalItems.map((item, i) => (
                  <div className="pdp-feature-item" key={i}>
                    {item.icon && (
                      <div className="pdp-feature-icon"><i className={toFaClass(item.icon)}></i></div>
                    )}
                    <div className="pdp-feature-text">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {additionalBanner && (
              <div className="pdp-features-image">
                <Image
                  src={additionalBanner}
                  alt={additionalTitle || "Features"}
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
          </div>
        )}

        {/* ===== FAQ ===== */}
        {faqs.length > 0 && (
          <div className="pdp-faq-section">
            <h2>Frequently asked questions</h2>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`pdp-faq-item${openFaq === i ? " active" : ""}`}
              >
                <div
                  className="pdp-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.question || faq.q}
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
                {openFaq === i && (
                  <div className="pdp-faq-answer">{faq.answer || faq.a}</div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={galleryImages}
        plugins={[Fullscreen, Thumbnails, Zoom]}
      />
    </main>
  );
}
