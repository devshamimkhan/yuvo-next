"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import IconPicker from "./IconPicker";
import MediaPickerModal from "./media/MediaPickerModal";



function decimalString(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toFixed(2);
}

function arrayFromJson(value) {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value;
}

export default function ProductForm({ action, product }) {
  const isEdit = Boolean(product);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Product type state
  const [productType, setProductType] = useState(product?.productType || "comingSoon");
  const isAffiliate = productType === "affiliate";
  const isComingSoon = productType === "comingSoon";

  // Slug state
  const [slugValue, setSlugValue] = useState(product?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(product?.slug));

  function toSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const handleNameChange = (e) => {
    if (!slugManuallyEdited) {
      setSlugValue(toSlug(e.target.value));
    }
  };

  // Media picker modal state
  const [mainMediaOpen, setMainMediaOpen] = useState(false);
  const [galleryMediaOpen, setGalleryMediaOpen] = useState(false);

  // Main image (URL from media library)
  const [mainImageUrl, setMainImageUrl] = useState(product?.imageUrl || "");

  // Gallery images (array of URLs from media library)
  const initialGallery = isEdit && product?.galleryImages
    ? (Array.isArray(product.galleryImages) ? [...product.galleryImages] : [])
    : [];
  const [galleryImages, setGalleryImages] = useState(initialGallery);

  const removeGalleryImage = useCallback((index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Kit items state
  const [kitItems, setKitItems] = useState(
    isEdit ? (arrayFromJson(product?.kitItems).length > 0 ? arrayFromJson(product?.kitItems) : [""]) : [""]
  );

  const addKitItem = useCallback(() => {
    setKitItems((prev) => [...prev, ""]);
  }, []);

  const updateKitItem = useCallback((index, value) => {
    setKitItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const removeKitItem = useCallback((index) => {
    setKitItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  // Features state
  const productFeatures = product?.features;
  const isFeaturesObject = productFeatures && !Array.isArray(productFeatures) && typeof productFeatures === 'object';
  const featuresArray = isFeaturesObject ? (productFeatures.items || []) : arrayFromJson(productFeatures);
  const featureTitle = isFeaturesObject ? (productFeatures.sectionTitle || "") : "";

  const initialFeatures = isEdit
    ? (featuresArray.length > 0
        ? featuresArray.map((f) => ({
            icon: f.icon || "",
            title: f.title || "",
            description: f.description || "",
          }))
        : [{ icon: "", title: "", description: "" }])
    : [{ icon: "", title: "", description: "" }];

  const [features, setFeatures] = useState(initialFeatures);

  const addFeature = useCallback(() => {
    setFeatures((prev) => [...prev, { icon: "", title: "", description: "" }]);
  }, []);

  const updateFeature = useCallback((index, field, value) => {
    setFeatures((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeFeature = useCallback((index) => {
    setFeatures((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  // Additional Content state
  const productAdditional = product?.additionalContent || {};
  const isAdditionalObject = productAdditional && !Array.isArray(productAdditional) && typeof productAdditional === 'object';
  const additionalArray = isAdditionalObject ? (productAdditional.items || []) : arrayFromJson(productAdditional);
  
  const [additionalContentTitle, setAdditionalContentTitle] = useState(isAdditionalObject ? (productAdditional.title || "") : "");
  const [additionalContentDescription, setAdditionalContentDescription] = useState(isAdditionalObject ? (productAdditional.description || "") : "");
  const [additionalContentBanner, setAdditionalContentBanner] = useState(isAdditionalObject ? (productAdditional.bannerUrl || "") : "");
  const [additionalMediaOpen, setAdditionalMediaOpen] = useState(false);

  const initialAdditionalItems = isEdit
    ? (additionalArray.length > 0
        ? additionalArray.map((i) => ({
            icon: i.icon || "",
            title: i.title || "",
            description: i.description || "",
          }))
        : [{ icon: "", title: "", description: "" }])
    : [{ icon: "", title: "", description: "" }];

  const [additionalItems, setAdditionalItems] = useState(initialAdditionalItems);

  const addAdditionalItem = useCallback(() => {
    setAdditionalItems((prev) => [...prev, { icon: "", title: "", description: "" }]);
  }, []);

  const updateAdditionalItem = useCallback((index, field, value) => {
    setAdditionalItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeAdditionalItem = useCallback((index) => {
    setAdditionalItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  // FAQ state
  const initialFaqs = isEdit
    ? (arrayFromJson(product?.faqs).length > 0
        ? arrayFromJson(product?.faqs).map((f) => ({
            question: f.question || "",
            answer: f.answer || "",
          }))
        : [{ question: "", answer: "" }])
    : [{ question: "", answer: "" }];

  const [faqs, setFaqs] = useState(initialFaqs);

  const addFaq = useCallback(() => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }, []);

  const updateFaq = useCallback((index, field, value) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeFaq = useCallback((index) => {
    setFaqs((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Build complex fields
    const nonEmptyKitItems = kitItems.filter((item) => item.trim());
    if (nonEmptyKitItems.length > 0) {
      formData.set("kitItems", nonEmptyKitItems.join("\n"));
    }

    const nonEmptyFeatures = features.filter((f) => f.title || f.description);
    if (nonEmptyFeatures.length > 0) {
      formData.set(
        "features",
        nonEmptyFeatures
          .map((f) => [f.icon, f.title, f.description].join(" | "))
          .join("\n")
      );
    }

    const nonEmptyAdditional = additionalItems.filter((f) => f.title || f.description);
    if (nonEmptyAdditional.length > 0) {
      formData.set(
        "additionalItems",
        nonEmptyAdditional
          .map((f) => [f.icon, f.title, f.description].join(" | "))
          .join("\n")
      );
    }

    const nonEmptyFaqs = faqs.filter((f) => f.question || f.answer);
    if (nonEmptyFaqs.length > 0) {
      formData.set(
        "faqs",
        nonEmptyFaqs
          .map((f) => [f.question, f.answer].join(" | "))
          .join("\n")
      );
    }

    // Set main image URL (from media library)
    if (mainImageUrl) {
      formData.set("imageUrl", mainImageUrl);
    }

    // Set gallery image URLs (from media library)
    if (galleryImages.length > 0) {
      formData.set("galleryImages", galleryImages.join("\n"));
    }

    setSubmitting(true);

    try {
      await action(formData);
      toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
      // If we reach here, the action completed without redirecting
      if (!isEdit) {
        router.push("/admin/products");
      }
      setSubmitting(false);
    } catch (err) {
      // NEXT_REDIRECT is thrown by redirect() — let it propagate
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      toast.error(err?.message || "An error occurred while saving.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <form id="productForm" onSubmit={handleSubmit} className="product-form-layout">
        {isEdit ? <input type="hidden" name="id" value={product.id} /> : null}

        <div className="product-form-main">
          <section className="form-card">
            <div className="card-header">
              <h3>{isEdit ? "Product Details" : "Product Details"}</h3>
              <Link href="/admin/products" className="back-link">
                <i className="fa-solid fa-arrow-left" /> Back to Products
              </Link>
            </div>

            <div className="form-grid">
            {/* ===== PRODUCT TYPE ===== */}
            <div className="form-group full-width">
              <label>Product Type <span className="required">*</span></label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                {[
                  {value: 'comingSoon', label: 'Coming Soon', icon: 'fa-clock'},
                  {value: 'affiliate', label: 'Affiliate Product', icon: 'fa-link'}
                ].map(type => (
                  <label
                    key={type.value}
                    htmlFor={`type-${type.value}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `2px solid ${productType === type.value ? 'var(--yuvo-blue)' : 'rgba(55,80,62,0.14)'}`,
                      background: productType === type.value ? 'rgba(14,79,168,0.06)' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: productType === type.value ? 600 : 400,
                      color: productType === type.value ? 'var(--yuvo-blue)' : 'var(--yuvo-text)',
                      fontSize: '14px',
                    }}
                  >
                    <input
                      type="radio"
                      id={`type-${type.value}`}
                      name="productType"
                      value={type.value}
                      checked={productType === type.value}
                      onChange={() => setProductType(type.value)}
                      style={{ display: 'none' }}
                    />
                    <i className={`fa-solid ${type.icon}`} style={{ fontSize: '16px' }} />
                    {type.label}
                    {productType === type.value && (
                      <i className="fa-solid fa-circle-check" style={{ marginLeft: 'auto', fontSize: '16px' }} />
                    )}
                  </label>
                ))}
              </div>
              {isComingSoon && (
                <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(14,79,168,0.06)', border: '1px solid rgba(14,79,168,0.15)', fontSize: '12px', color: '#0e4fa8', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <i className="fa-solid fa-circle-info" />
                  Coming Soon products show a &quot;Coming Soon&quot; badge and a &quot;Notify Me&quot; button. No purchase link is shown.
                </div>
              )}
              {isAffiliate && (
                <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(245,170,34,0.08)', border: '1px solid rgba(245,170,34,0.2)', fontSize: '12px', color: '#a16408', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <i className="fa-solid fa-circle-info" />
                  Affiliate products link to an external store. Stock management is not applicable.
                </div>
              )}
            </div>

            {/* ===== BASIC INFO ===== */}
            <div className="form-group full-width">
              <label htmlFor="productName">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="productName"
                name="name"
                placeholder="e.g. YUVO 6-in-1 Foam Roller Recovery Set"
                required
                defaultValue={product?.name || ""}
                onChange={handleNameChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="productSlug">Slug</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  id="productSlug"
                  name="slug"
                  placeholder="e.g. yuvo-6-in-1-foam-roller-recovery-set"
                  value={slugValue}
                  onChange={(e) => { setSlugValue(toSlug(e.target.value)); setSlugManuallyEdited(true); }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  title="Regenerate slug from name"
                  onClick={() => {
                    const nameEl = document.getElementById("productName");
                    if (nameEl) { setSlugValue(toSlug(nameEl.value)); setSlugManuallyEdited(false); }
                  }}
                  style={{ flexShrink: 0, padding: '8px 12px', border: '1px solid rgba(55,80,62,0.2)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--yuvo-muted)', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <i className="fa-solid fa-rotate" /> Regenerate
                </button>
              </div>
              <span className="helper">URL-friendly identifier. Auto-generated from product name.</span>
            </div>

            {/* Affiliate URL — shown only for affiliate products */}
            {isAffiliate && (
              <div className="form-group full-width" style={{ border: '2px solid rgba(14,79,168,0.15)', borderRadius: '10px', padding: '16px', background: 'rgba(14,79,168,0.03)' }}>
                <label htmlFor="affiliateUrl" style={{ color: 'var(--yuvo-blue)', fontWeight: 600 }}>
                  <i className="fa-solid fa-link" style={{ marginRight: '6px' }} />
                  Affiliate URL <span className="required">*</span>
                </label>
                <input
                  type="url"
                  id="affiliateUrl"
                  name="affiliateUrl"
                  placeholder="https://example.com/product?ref=yuvo"
                  required={isAffiliate}
                  defaultValue={product?.affiliateUrl || ""}
                  style={{ marginTop: '6px' }}
                />
                <span className="helper">Customers will be redirected to this URL. Must start with https://</span>
              </div>
            )}

            {/* Price — shown for all products */}
            <div className="form-group">
              <label htmlFor="productPrice">
                Price ($) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="productPrice"
                name="price"
                placeholder="39.99"
                step="0.01"
                min="0"
                required
                defaultValue={decimalString(product?.price)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="productComparePrice">Compare at Price ($)</label>
              <input
                type="number"
                id="productComparePrice"
                name="comparePrice"
                placeholder="44.99"
                step="0.01"
                min="0"
                defaultValue={decimalString(product?.comparePrice)}
              />
              <span className="helper">
                Original price shown as crossed out.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="productStatus">Status</label>
              <select
                id="productStatus"
                name="status"
                defaultValue={product?.status || "draft"}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <span className="helper">
                Draft products won&apos;t be visible to customers.
              </span>
            </div>

            {/* ===== RATING & SHIPPING ===== */}
            <div className="form-group">
              <label htmlFor="productRating">Rating (out of 5)</label>
              <input
                type="number"
                id="productRating"
                name="rating"
                placeholder="4.8"
                step="0.1"
                min="0"
                max="5"
                defaultValue={product?.rating ?? ""}
              />
              <span className="helper">
                Average customer rating.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="productShipping">Shipping Info</label>
              <input
                type="text"
                id="productShipping"
                name="shipping"
                placeholder="Free shipping &middot; Ships in 2-4 business days"
                defaultValue={product?.shipping || ""}
              />
            </div>

            {/* ===== SHORT DESCRIPTION ===== */}
            <div className="form-group full-width" style={{ display: 'none' }}>
              <label htmlFor="productShortDescription">Short Description</label>
              <textarea
                id="productShortDescription"
                name="shortDescription"
                placeholder="A compact recovery kit for daily mobility."
                defaultValue={product?.shortDescription || ""}
                style={{ minHeight: 60 }}
              />
              <span className="helper">
                Brief summary shown in product cards.
              </span>
            </div>

            {/* ===== DESCRIPTION ===== */}
            <div className="form-group full-width">
              <label htmlFor="productDescription">Description</label>
              <textarea
                id="productDescription"
                name="description"
                placeholder="Describe your product&hellip;"
                defaultValue={product?.description || ""}
              />
            </div>

            {/* ===== KIT ITEMS ===== */}
            <div className="form-group full-width">
              <label>
                What&apos;s in the Kit{" "}
                <span className="helper">
                  Items included in the product kit
                </span>
              </label>
              <div id="kitListContainer">
                {kitItems.map((item, index) => (
                  <div className="repeater-group" key={index}>
                    <div className="repeater-header">
                      <span className="repeater-title">
                        Kit Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        className="remove-repeater"
                        title="Remove item"
                        onClick={() => removeKitItem(index)}
                      >
                        <i className="fa-regular fa-trash-can" />
                      </button>
                    </div>
                    <div className="repeater-grid">
                      <div className="form-group full-width">
                        <label>Item Name</label>
                        <input
                          type="text"
                          className="kit-item-name"
                          placeholder='e.g. Foam roller (17.7" / 45cm)'
                          value={item}
                          onChange={(e) => updateKitItem(index, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-repeater-btn"
                onClick={addKitItem}
              >
                <i className="fa-solid fa-plus" /> Add Kit Item
              </button>
            </div>

            {/* ===== FEATURES ===== */}
            <div className="form-group full-width">
              <label>
                Product Features Section Title
              </label>
              <input
                type="text"
                name="product_features_section_title"
                placeholder="e.g. Full body recovery. Simple daily habits."
                defaultValue={featureTitle}
              />
            </div>

            <div className="form-group full-width">
              <label>
                Product Features{" "}
                <span className="helper">
                  Key features with icon, title, and description
                </span>
              </label>
              <div id="featuresContainer">
                {features.map((feature, index) => (
                  <div className="repeater-group" key={index}>
                    <div className="repeater-header">
                      <span className="repeater-title">
                        Feature #{index + 1}
                      </span>
                      <button
                        type="button"
                        className="remove-repeater"
                        title="Remove feature"
                        onClick={() => removeFeature(index)}
                      >
                        <i className="fa-regular fa-trash-can" />
                      </button>
                    </div>
                    <div className="repeater-grid">
                      <div className="form-group">
                        <label>Icon</label>
                        <IconPicker
                          value={feature.icon}
                          onChange={(val) => updateFeature(index, "icon", val)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          className="feature-title"
                          placeholder="e.g. Relieve Muscle Tightness"
                          value={feature.title}
                          onChange={(e) =>
                            updateFeature(index, "title", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Description</label>
                        <textarea
                          className="feature-desc"
                          placeholder="e.g. Target sore muscles and knots to reduce tension."
                          value={feature.description}
                          onChange={(e) =>
                            updateFeature(index, "description", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-repeater-btn"
                onClick={addFeature}
              >
                <i className="fa-solid fa-plus" /> Add Feature
              </button>
            </div>

            {/* ===== ADDITIONAL CONTENT ===== */}
            <div className="form-group full-width">
              <label>
                Additional Content Section Title
              </label>
              <input
                type="text"
                name="additionalContentTitle"
                placeholder="e.g. Everything you need in one kit"
                value={additionalContentTitle}
                onChange={(e) => setAdditionalContentTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group full-width">
              <label>
                Additional Content Section Description
              </label>
              <textarea
                name="additionalContentDescription"
                placeholder="e.g. Designed to help you recover faster..."
                value={additionalContentDescription}
                onChange={(e) => setAdditionalContentDescription(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>
                Additional Content Section Banner
              </label>
              {additionalContentBanner ? (
                <div style={{ position: 'relative', maxWidth: '300px', borderRadius: 8, overflow: 'hidden', border: '2px solid #e5e7eb', marginBottom: 10 }}>
                  <img src={additionalContentBanner} alt="Banner" style={{ width: '100%', display: 'block' }} />
                  <button type="button" onClick={() => setAdditionalContentBanner("")} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: '#ef4444' }}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setAdditionalMediaOpen(true)}
                className="max-w-75"
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <i className="fa-regular fa-image" /> {additionalContentBanner ? "Change Banner" : "Select Banner Image"}
              </button>
              <input type="hidden" name="additionalContentBanner" value={additionalContentBanner} />
            </div>

            <div className="form-group full-width">
              <label>
                Additional Content Items{" "}
                <span className="helper">
                  Key features with icon, title, and description
                </span>
              </label>
              <div id="additionalContainer">
                {additionalItems.map((item, index) => (
                  <div className="repeater-group" key={index}>
                    <div className="repeater-header">
                      <span className="repeater-title">
                        Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        className="remove-repeater"
                        title="Remove item"
                        onClick={() => removeAdditionalItem(index)}
                      >
                        <i className="fa-regular fa-trash-can" />
                      </button>
                    </div>
                    <div className="repeater-grid">
                      <div className="form-group">
                        <label>Icon</label>
                        <IconPicker
                          value={item.icon}
                          onChange={(val) => updateAdditionalItem(index, "icon", val)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          className="feature-title"
                          placeholder="e.g. Relieve Muscle Tightness"
                          value={item.title}
                          onChange={(e) =>
                            updateAdditionalItem(index, "title", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Description</label>
                        <textarea
                          className="feature-desc"
                          placeholder="e.g. Target sore muscles and knots..."
                          value={item.description}
                          onChange={(e) =>
                            updateAdditionalItem(index, "description", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-repeater-btn mt-0.5"
                onClick={addAdditionalItem}
              >
                <i className="fa-solid fa-plus" /> Add Additional Item
              </button>
            </div>

            {/* ===== FAQ ===== */}
            <div className="form-group full-width">
              <label>
                FAQ{" "}
                <span className="helper">
                  Frequently asked questions and answers
                </span>
              </label>
              <div id="faqContainer">
                {faqs.map((faq, index) => (
                  <div className="repeater-group" key={index}>
                    <div className="repeater-header">
                      <span className="repeater-title">FAQ #{index + 1}</span>
                      <button
                        type="button"
                        className="remove-repeater"
                        title="Remove FAQ"
                        onClick={() => removeFaq(index)}
                      >
                        <i className="fa-regular fa-trash-can" />
                      </button>
                    </div>
                    <div className="repeater-grid">
                      <div className="form-group full-width">
                        <label>Question</label>
                        <input
                          type="text"
                          className="faq-question"
                          placeholder="e.g. Is this suitable for beginners?"
                          value={faq.question}
                          onChange={(e) =>
                            updateFaq(index, "question", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Answer</label>
                        <textarea
                          className="faq-answer"
                          placeholder="e.g. Yes, this set is designed for both beginners and experienced athletes&hellip;"
                          value={faq.answer}
                          onChange={(e) =>
                            updateFaq(index, "answer", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-repeater-btn"
                onClick={addFaq}
              >
                <i className="fa-solid fa-plus" /> Add FAQ
              </button>
            </div>
          </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="product-form-sidebar">
          {/* MAIN IMAGE */}
          <section className="form-card" style={{ padding: "20px" }}>
            <div className="form-group full-width" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span>Main Product Image</span>
                {mainImageUrl && (
                  <button
                    type="button"
                    onClick={() => setMainImageUrl("")}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, padding: 0 }}
                  >
                    <i className="fa-solid fa-trash-can" /> Remove
                  </button>
                )}
              </label>

              {mainImageUrl ? (
                <div
                  style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '2px solid #e5e7eb', cursor: 'pointer' }}
                  onClick={() => setMainMediaOpen(true)}
                >
                  <img
                    src={mainImageUrl}
                    alt="Product main image"
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                  >
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, opacity: 0, transition: 'opacity 0.2s', padding: '6px 14px', background: 'rgba(0,0,0,0.5)', borderRadius: 6 }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <i className="fa-solid fa-pen" /> Change
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMainMediaOpen(true)}
                  style={{
                    width: '100%', padding: '32px 16px', border: '2px dashed #d1d5db',
                    borderRadius: 10, background: '#fafafa', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f5f3ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafafa'; }}
                >
                  <i className="fa-regular fa-image" style={{ fontSize: 28, color: '#d1d5db' }} />
                  <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>Open Media Library</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>Click to select or upload an image</span>
                </button>
              )}

              {/* Hidden input for form submission */}
              <input type="hidden" name="imageUrl" value={mainImageUrl} />
            </div>
          </section>

          {/* GALLERY IMAGES */}
          <section className="form-card" style={{ padding: "20px" }}>
            <div className="form-group full-width" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span>Gallery Images</span>
                <button
                  type="button"
                  onClick={() => setGalleryMediaOpen(true)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 12, fontWeight: 600, padding: 0 }}
                >
                  <i className="fa-solid fa-plus" /> Add Images
                </button>
              </label>

              {galleryImages.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setGalleryMediaOpen(true)}
                  style={{
                    width: '100%', padding: '24px 16px', border: '2px dashed #d1d5db',
                    borderRadius: 10, background: '#fafafa', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f5f3ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafafa'; }}
                >
                  <i className="fa-regular fa-images" style={{ fontSize: 24, color: '#d1d5db' }} />
                  <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>Open Media Library</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>Select multiple images for the gallery</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {galleryImages.map((src, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                      <img src={src} alt={`Gallery ${index + 1}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGalleryMediaOpen(true)}
                    style={{ marginTop: 4, padding: '8px', border: '1px dashed #d1d5db', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 12, color: '#6366f1', fontWeight: 600 }}
                  >
                    <i className="fa-solid fa-plus" /> Add More Images
                  </button>
                </div>
              )}

              {/* Hidden textarea for form submission */}
              <textarea
                name="galleryImages"
                value={galleryImages.join("\n")}
                readOnly
                style={{ display: 'none' }}
              />
            </div>
          </section>

          {/* Form Actions */}
          <section className="form-card" style={{ padding: "24px", marginTop: "auto", position: "sticky", bottom: "20px" }}>
            <div className="sidebar-actions">
              <button
                className="btn-primary"
                type="submit"
                id="submitBtn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Saving&hellip;
                  </>
                ) : (
                  <>
                    <i className="fa-regular fa-floppy-disk" />{" "}
                    {isEdit ? "Save Changes" : "Save Product"}
                  </>
                )}
              </button>
              <Link href="/admin/products" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </section>
        </div>
      </form>

      {/* Media Picker Modals */}
      <MediaPickerModal
        open={mainMediaOpen}
        onClose={() => setMainMediaOpen(false)}
        onSelect={(item) => setMainImageUrl(item.url)}
        multiple={false}
        currentUrl={mainImageUrl}
        mediaType="image"
      />
      <MediaPickerModal
        open={galleryMediaOpen}
        onClose={() => setGalleryMediaOpen(false)}
        onSelectMany={(items) => setGalleryImages((prev) => {
          const existingUrls = new Set(prev);
          const newUrls = items.map((i) => i.url).filter((u) => !existingUrls.has(u));
          return [...prev, ...newUrls];
        })}
        multiple={true}
        mediaType="image"
      />
      <MediaPickerModal
        open={additionalMediaOpen}
        onClose={() => setAdditionalMediaOpen(false)}
        onSelect={(item) => setAdditionalContentBanner(item.url)}
        multiple={false}
        currentUrl={additionalContentBanner}
        mediaType="image"
      />
    </>
  );
}
