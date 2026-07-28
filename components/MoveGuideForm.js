"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import IconPicker from "./IconPicker";
import MediaPickerModal from "./media/MediaPickerModal";

function arrayFromJson(value) {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value;
}

export default function MoveGuideForm({ action, guide }) {
  const isEdit = Boolean(guide);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Slug state
  const [slugValue, setSlugValue] = useState(guide?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(guide?.slug));
  const [iconValue, setIconValue] = useState(guide?.icon || "");

  function toSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const handleTitleChange = (e) => {
    if (!slugManuallyEdited) {
      setSlugValue(toSlug(e.target.value));
    }
  };

  // Media picker generic state
  const [mediaPicker, setMediaPicker] = useState({ isOpen: false, onSelect: null });
  const openMediaPicker = (onSelect) => setMediaPicker({ isOpen: true, onSelect });

  // Main Image
  const [mainImageUrl, setMainImageUrl] = useState(guide?.imageUrl || "");

  // Repeaters
  const [tools, setTools] = useState(
    isEdit ? (arrayFromJson(guide?.tools).length > 0 ? arrayFromJson(guide?.tools) : [{ name: "", image: "" }]) : [{ name: "", image: "" }]
  );

  const [moves, setMoves] = useState(
    isEdit ? (arrayFromJson(guide?.moves).length > 0 ? arrayFromJson(guide?.moves) : [{ name: "", tool: "", stepTime: "" }]) : [{ name: "", tool: "", stepTime: "" }]
  );

  const [contentSection, setContentSection] = useState(
    isEdit ? (arrayFromJson(guide?.contentSections).length > 0 ? arrayFromJson(guide?.contentSections)[0] : { title: "", description: "", items: [{ icon: "", title: "", description: "" }] }) : { title: "", description: "", items: [{ icon: "", title: "", description: "" }] }
  );

  // Tools helpers
  const updateTool = (index, field, value) => {
    setTools(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };
  const removeTool = (index) => {
    setTools(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };
  const addTool = () => setTools([...tools, { name: "", image: "" }]);

  // Moves helpers
  const updateMove = (index, field, value) => {
    setMoves(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };
  const removeMove = (index) => {
    setMoves(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };
  const addMove = () => setMoves([...moves, { name: "", tool: "", stepTime: "" }]);

  // Content Section helpers
  const updateSection = (field, value) => {
    setContentSection(prev => ({ ...prev, [field]: value }));
  };

  const updateSectionItem = (iIndex, field, value) => {
    setContentSection(prev => {
      const newItems = prev.items.map((item, j) => j === iIndex ? { ...item, [field]: value } : item);
      return { ...prev, items: newItems };
    });
  };
  const removeSectionItem = (iIndex) => {
    setContentSection(prev => {
      return { ...prev, items: prev.items.length > 1 ? prev.items.filter((_, j) => j !== iIndex) : prev.items };
    });
  };
  const addSectionItem = () => {
    setContentSection(prev => ({ ...prev, items: [...prev.items, { icon: "", title: "", description: "" }] }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Filter repeaters
    const validTools = tools.filter(t => t.name || t.image);
    formData.set("toolsData", JSON.stringify(validTools));

    const validMoves = moves.filter(m => m.name || m.tool);
    formData.set("movesData", JSON.stringify(validMoves));

    const validSectionItems = contentSection.items.filter(i => i.title || i.description || i.icon);
    const validSections = [];
    if (contentSection.title || contentSection.description || validSectionItems.length > 0) {
      validSections.push({
        ...contentSection,
        items: validSectionItems
      });
    }
    formData.set("contentSectionsData", JSON.stringify(validSections));

    setSubmitting(true);
    try {
      await action(formData);
      toast.success(isEdit ? "Move guide updated successfully!" : "Move guide created successfully!");
    } catch (err) {
      // Next.js redirect() throws a special NEXT_REDIRECT error — let it propagate
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const formActionDisabled = submitting;
  const availableTools = tools.filter(t => t.name.trim() !== "");

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="product-form-layout">
        {isEdit && <input type="hidden" name="id" value={guide.id} />}
        <input type="hidden" name="imageUrl" value={mainImageUrl} />
        <input type="hidden" name="icon" value={iconValue} />
        <input type="hidden" name="featured" value={guide?.featured ? "true" : "false"} />

        <div className="product-form-main">
          <section className="form-card">
            <div className="card-header">
              <h3>{isEdit ? "Edit Move Guide" : "Guide Details"}</h3>
              <Link href="/admin/moveguides" className="back-link">
                <i className="fa-solid fa-arrow-left"></i> Back to Move Guides
              </Link>
            </div>

            <div className="form-grid">
              {/* ===== BASIC INFO ===== */}
            <div className="form-group full-width">
              <label htmlFor="guideTitle">Guide Title <span className="required">*</span></label>
              <input type="text" id="guideTitle" name="title" placeholder="e.g. 5-Minute Daily Reset" required defaultValue={guide?.title || ""} onChange={handleTitleChange} />
              <span className="helper">This will be displayed as the main headline on the move guide page.</span>
            </div>

            <div className="form-group full-width">
              <label htmlFor="guideSlug">Slug</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  id="guideSlug"
                  name="slug"
                  placeholder="e.g. 5-minute-daily-reset"
                  value={slugValue}
                  onChange={(e) => { setSlugValue(toSlug(e.target.value)); setSlugManuallyEdited(true); }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  title="Regenerate slug from title"
                  onClick={() => {
                    const titleEl = document.getElementById("guideTitle");
                    if (titleEl) { setSlugValue(toSlug(titleEl.value)); setSlugManuallyEdited(false); }
                  }}
                  style={{ flexShrink: 0, padding: '8px 12px', border: '1px solid rgba(55,80,62,0.2)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--yuvo-muted)', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <i className="fa-solid fa-rotate" /> Regenerate
                </button>
              </div>
              <span className="helper">URL-friendly identifier. Auto-generated from guide title.</span>
            </div>

            <div className="form-group full-width">
              <label>Guide Icon</label>
              <IconPicker value={iconValue} onChange={setIconValue} />
              <span className="helper">Select an icon to represent this guide.</span>
            </div>

            {/* Thumbnail Image moved to sidebar */}

            <div className="form-group full-width">
              <label htmlFor="guideDescription">Description<span className="required">*</span></label>
              <textarea id="guideDescription" name="description" placeholder="A brief introduction to the routine..." required defaultValue={guide?.description || ""}></textarea>
            </div>

            <div className="form-group full-width">
              <label htmlFor="instructionText">Introduction<span className="required">*</span></label>
              <textarea id="instructionText" name="instructionText" placeholder="Detailed description..." required defaultValue={guide?.instructionText || ""}></textarea>
            </div>

            <div className="form-group full-width">
              <label htmlFor="disclaimerText">Disclaimer Text</label>
              <textarea id="disclaimerText" name="disclaimerText" placeholder="Medical/legal disclaimer (optional)..." defaultValue={guide?.disclaimerText || ""}></textarea>
            </div>

            {/* Status moved to sidebar */}

            {/* ===== TOOLS USED ===== */}
            <div className="form-group full-width" style={{ marginTop: 24, borderTop: '1px solid rgba(55, 80, 62, 0.08)', paddingTop: 24 }}>
              <label>Tools <span className="helper">Add tools used in this routine</span></label>
              <div>
                {tools.map((tool, index) => (
                  <div className="repeater-group" key={index}>
                    <div className="repeater-header">
                      <span className="repeater-title">Tool #{index + 1}</span>
                      <button type="button" className="remove-repeater" onClick={() => removeTool(index)}><i className="fa-regular fa-trash-can"></i></button>
                    </div>
                    <div className="repeater-grid">
                      <div className="form-group">
                        <label>Tool Name</label>
                        <input type="text" placeholder="e.g. Foam Roller" value={tool.name} onChange={(e) => updateTool(index, "name", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Image</label>
                        {tool.image ? (
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                              <img src={tool.image} alt="Tool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                              <button type="button" onClick={() => openMediaPicker((url) => updateTool(index, "image", url))} className="btn-outline" style={{ padding: '4px 10px', fontSize: 12 }}>
                                Change
                              </button>
                              <button type="button" onClick={() => updateTool(index, "image", "")} className="btn-danger-outline" style={{ padding: '4px 10px', fontSize: 12 }}>
                                <i className="fa-solid fa-trash-can"></i> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => openMediaPicker((url) => updateTool(index, "image", url))} className="btn-outline" style={{ alignSelf: 'flex-start' }}>
                            <i className="fa-regular fa-image" style={{ marginRight: 6 }}></i> Browse
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="add-repeater-btn" onClick={addTool}>
                <i className="fa-solid fa-plus"></i> Add Tool
              </button>
            </div>

            {/* ===== ROUTINE STEPS (MOVES) ===== */}
            <div className="form-group full-width" style={{ marginTop: 24, borderTop: '1px solid rgba(55, 80, 62, 0.08)', paddingTop: 24 }}>
              <label>Routine Steps</label>
              <div id="movesContainer">
                {moves.map((move, index) => (
                  <div className="repeater-group" key={index}>
                    <div className="repeater-header">
                      <span className="repeater-title">Step #{index + 1}</span>
                      <button type="button" className="remove-repeater" onClick={() => removeMove(index)}><i className="fa-regular fa-trash-can"></i></button>
                    </div>
                    <div className="repeater-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                      <div className="form-group">
                        <label>Routine Step Name</label>
                        <input type="text" placeholder="e.g. Upper Back Roll" value={move.name} onChange={(e) => updateMove(index, "name", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Tool</label>
                        <select value={move.tool} onChange={(e) => updateMove(index, "tool", e.target.value)}>
                          <option value="">Select a tool...</option>
                          {availableTools.map((t, i) => (
                            <option key={i} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Step Time</label>
                        <input type="number" placeholder="20" value={move.stepTime} onChange={(e) => updateMove(index, "stepTime", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="add-repeater-btn" onClick={addMove}>
                <i className="fa-solid fa-plus"></i> Add Step
              </button>
            </div>

            {/* ===== CONTENT SECTION ===== */}
            <div className="form-group full-width" style={{ marginTop: 24, borderTop: '1px solid rgba(55, 80, 62, 0.08)', paddingTop: 24 }}>
              <label>Additional Content Section</label>
              <div>
                <div className="repeater-group" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '2px solid rgba(14, 79, 168, 0.1)', marginBottom: 24 }}>
                  <div className="repeater-header">
                    <span className="repeater-title" style={{ color: 'var(--yuvo-blue)', fontSize: 14 }}>Content Section Details</span>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Section Title</label>
                    <input type="text" placeholder="e.g. Why This Routine Works" value={contentSection.title} onChange={(e) => updateSection("title", e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label>Section Description</label>
                    <textarea placeholder="Brief section description..." value={contentSection.description} onChange={(e) => updateSection("description", e.target.value)} style={{ minHeight: 60 }}></textarea>
                  </div>

                  {/* Nested Items */}
                  <div style={{ marginTop: 20, paddingLeft: 16, borderLeft: '2px dashed rgba(55, 80, 62, 0.15)' }}>
                    <label style={{ fontSize: 13, color: 'var(--yuvo-muted)', display: 'block', marginBottom: 12 }}>Section Items</label>
                    
                    {contentSection.items.map((item, iIndex) => (
                      <div className="repeater-group" key={iIndex} style={{ background: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                        <div className="repeater-header">
                          <span className="repeater-title" style={{ fontSize: 12 }}>Item #{iIndex + 1}</span>
                          <button type="button" className="remove-repeater" onClick={() => removeSectionItem(iIndex)}><i className="fa-regular fa-trash-can"></i></button>
                        </div>
                        <div className="repeater-grid">
                          <div className="form-group">
                            <label>Item Icon</label>
                            <IconPicker value={item.icon} onChange={(val) => updateSectionItem(iIndex, "icon", val)} />
                          </div>
                          <div className="form-group">
                            <label>Item Title</label>
                            <input type="text" placeholder="e.g. Reduce Stiffness" value={item.title} onChange={(e) => updateSectionItem(iIndex, "title", e.target.value)} />
                          </div>
                          <div className="form-group full-width">
                            <label>Item Description</label>
                            <textarea placeholder="e.g. Loosen tight muscles..." value={item.description} onChange={(e) => updateSectionItem(iIndex, "description", e.target.value)} style={{ minHeight: 60 }}></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="add-repeater-btn" onClick={addSectionItem} style={{ fontSize: 12, padding: '6px 12px' }}>
                      <i className="fa-solid fa-plus"></i> Add Item
                    </button>
                  </div>

                </div>
              </div>
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
                <span>Thumbnail Image</span>
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
                  onClick={() => openMediaPicker(setMainImageUrl)}
                >
                  <img
                    src={mainImageUrl}
                    alt="Preview"
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
                  onClick={() => openMediaPicker(setMainImageUrl)}
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
            </div>
          </section>

          {/* STATUS */}
          <section className="form-card" style={{ padding: "20px" }}>
            <div className="form-group full-width" style={{ marginBottom: 0 }}>
              <label htmlFor="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span>Status</span>
              </label>
              <select id="status" name="status" defaultValue={guide?.status || "draft"}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <span className="helper" style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                Draft guides won't be visible to users.
              </span>
            </div>
          </section>

          {/* Form Actions */}
          <section className="form-card" style={{ padding: "24px", marginTop: "auto", position: "sticky", bottom: "20px" }}>
            <div className="sidebar-actions">
              <button
                className="btn-primary"
                type="submit"
                disabled={formActionDisabled}
              >
                {formActionDisabled ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Saving&hellip;
                  </>
                ) : (
                  <>
                    <i className="fa-regular fa-floppy-disk" />{" "}
                    {isEdit ? "Save Changes" : "Save Move Guide"}
                  </>
                )}
              </button>
              <Link href="/admin/moveguides" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </section>
        </div>
      </form>

      <MediaPickerModal 
        open={mediaPicker.isOpen} 
        onClose={() => setMediaPicker({ ...mediaPicker, isOpen: false })} 
        onSelect={(item) => {
          if (mediaPicker.onSelect && item?.url) {
            mediaPicker.onSelect(item.url);
          }
          setMediaPicker({ ...mediaPicker, isOpen: false });
        }}
        multiple={false}
        mediaType="image"
      />
    </>
  );
}
