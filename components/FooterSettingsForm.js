"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import { useActionState } from "react";
import { toast } from "react-hot-toast";
import MediaPickerModal from "@/components/media/MediaPickerModal";
import IconPicker from "@/components/IconPicker";

function RepeaterItem({ item, index, fields, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, namePrefix }) {
  return (
    <div className="repeater-item">
      <div className="repeater-item-handle">
        <i className="fa-solid fa-grip-lines" />
        <span className="repeater-item-index">#{index + 1}</span>
      </div>
      <div className="repeater-item-fields">
        {fields.map((field) => (
          <div className="repeater-field" key={field.name}>
            {field.type === "icon" ? (
              <IconPicker
                value={item[field.name] || ""}
                onChange={(val) => onChange(index, field.name, val)}
              />
            ) : field.type === "checkbox" ? (
              <label className="repeater-checkbox-label">
                <input
                  type="checkbox"
                  checked={item[field.name] || false}
                  onChange={(e) => onChange(index, field.name, e.target.checked)}
                />
                {field.label}
              </label>
            ) : (
              <input
                type={field.type || "text"}
                placeholder={field.placeholder || field.label}
                value={item[field.name] || ""}
                onChange={(e) => onChange(index, field.name, e.target.value)}
                className="form-input"
              />
            )}
          </div>
        ))}
      </div>
      <div className="repeater-item-actions">
        <button type="button" className="btn-icon" onClick={() => onMoveUp(index)} disabled={isFirst} title="Move up">
          <i className="fa-solid fa-chevron-up" />
        </button>
        <button type="button" className="btn-icon" onClick={() => onMoveDown(index)} disabled={isLast} title="Move down">
          <i className="fa-solid fa-chevron-down" />
        </button>
        <button type="button" className="btn-icon btn-icon-danger" onClick={() => onRemove(index)} title="Remove">
          <i className="fa-solid fa-trash-can" />
        </button>
      </div>
    </div>
  );
}

export default function FooterSettingsForm({ initialSettings, updateAction }) {
  const parseJSON = (key, fallback) => {
    const v = initialSettings?.[key];
    if (Array.isArray(v)) return v;
    if (typeof v === "string") try { return JSON.parse(v); } catch { return fallback; }
    return fallback;
  };

  const [dirty, setDirty] = useState(false);
  const [state, formAction, isPending] = useActionState(updateAction, null);

  // Form state
  const [companyLogo, setCompanyLogo] = useState(initialSettings?.company_logo || "");
  const [companyName, setCompanyName] = useState(initialSettings?.company_name || "");
  const [companyTagline, setCompanyTagline] = useState(initialSettings?.company_tagline || "");

  const [exploreMenu, setExploreMenu] = useState(() => parseJSON("explore_menu", []));
  const [supportMenu, setSupportMenu] = useState(() => parseJSON("support_menu", []));

  const [newsletterEnabled, setNewsletterEnabled] = useState(initialSettings?.newsletter_enabled === true);
  const [newsletterTitle, setNewsletterTitle] = useState(initialSettings?.newsletter_title || "");
  const [newsletterDescription, setNewsletterDescription] = useState(initialSettings?.newsletter_description || "");
  const [newsletterPlaceholder, setNewsletterPlaceholder] = useState(initialSettings?.newsletter_placeholder || "");
  const [newsletterButtonText, setNewsletterButtonText] = useState(initialSettings?.newsletter_button_text || "");
  const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState(initialSettings?.newsletter_success_message || "");

  const [privacyText, setPrivacyText] = useState(initialSettings?.privacy_text || "");
  const [privacyButtonText, setPrivacyButtonText] = useState(initialSettings?.privacy_button_text || "");
  const [privacyUrl, setPrivacyUrl] = useState(initialSettings?.privacy_url || "");

  const [copyrightText, setCopyrightText] = useState(initialSettings?.copyright_text || "");

  const [socialLinks, setSocialLinks] = useState(() => parseJSON("social_links", []));

  // Layout toggles
  const [showNewsletter, setShowNewsletter] = useState(initialSettings?.layout_show_newsletter !== false);
  const [showExplore, setShowExplore] = useState(initialSettings?.layout_show_explore !== false);
  const [showSupport, setShowSupport] = useState(initialSettings?.layout_show_support !== false);
  const [showSocial, setShowSocial] = useState(initialSettings?.layout_show_social !== false);
  const [showPrivacy, setShowPrivacy] = useState(initialSettings?.layout_show_privacy !== false);
  const [showCopyright, setShowCopyright] = useState(initialSettings?.layout_show_copyright !== false);

  // Media picker
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const markDirty = useCallback(() => setDirty(true), []);

  // Toast
  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Footer settings saved successfully.");
      setDirty(false);
    } else if (state.errors) {
      const formErr = state.errors._form;
      if (formErr) toast.error(formErr);
      else toast.error("Please fix the validation errors.");
    }
  }, [state]);

  // Repeater helpers
  const addMenuItem = (list, setter) => {
    markDirty();
    setter([...list, { title: "", url: "", order: list.length, active: true }]);
  };

  const updateMenuItem = (list, setter, index, field, value) => {
    markDirty();
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setter(updated);
  };

  const removeMenuItem = (list, setter, index) => {
    markDirty();
    setter(list.filter((_, i) => i !== index));
  };

  const moveItem = (list, setter, index, direction) => {
    markDirty();
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;
    const updated = [...list];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setter(updated);
  };

  function buildFormData(e) {
    const fd = new FormData(e.target);
    fd.set("company_logo", companyLogo);
    fd.set("company_name", companyName);
    fd.set("company_tagline", companyTagline);
    fd.set("explore_menu", JSON.stringify(exploreMenu));
    fd.set("support_menu", JSON.stringify(supportMenu));
    fd.set("newsletter_enabled", String(newsletterEnabled));
    fd.set("newsletter_title", newsletterTitle);
    fd.set("newsletter_description", newsletterDescription);
    fd.set("newsletter_placeholder", newsletterPlaceholder);
    fd.set("newsletter_button_text", newsletterButtonText);
    fd.set("newsletter_success_message", newsletterSuccessMessage);
    fd.set("privacy_text", privacyText);
    fd.set("privacy_button_text", privacyButtonText);
    fd.set("privacy_url", privacyUrl);
    fd.set("copyright_text", copyrightText);
    fd.set("social_links", JSON.stringify(socialLinks));
    fd.set("layout_show_newsletter", String(showNewsletter));
    fd.set("layout_show_explore", String(showExplore));
    fd.set("layout_show_support", String(showSupport));
    fd.set("layout_show_social", String(showSocial));
    fd.set("layout_show_privacy", String(showPrivacy));
    fd.set("layout_show_copyright", String(showCopyright));
    return fd;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fd = buildFormData(e);
    startTransition(() => {
      formAction(fd);
    });
  }

  const menuFields = [
    { name: "title", label: "Title", placeholder: "Menu title" },
    { name: "url", label: "URL", placeholder: "/page-url", type: "text" },
    { name: "active", label: "Active", type: "checkbox" },
  ];

  const socialFields = [
    { name: "platform", label: "Platform", placeholder: "Instagram" },
    { name: "icon", label: "Icon", type: "icon" },
    { name: "url", label: "URL", placeholder: "https://instagram.com/yuvofitness" },
    { name: "newTab", label: "Open in New Tab", type: "checkbox" },
  ];

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* ─── Company Information ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Company Information</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Company Logo</label>
              <div className="media-field-row">
                {companyLogo ? (
                  <div className="media-preview-thumb">
                    <img src={companyLogo} alt="Company logo" />
                    <button type="button" className="media-remove-btn" onClick={() => { setCompanyLogo(""); markDirty(); }} aria-label="Remove">
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ) : (
                  <div className="media-preview-thumb media-placeholder">
                    <i className="fa-regular fa-image" />
                  </div>
                )}
                <button type="button" className="btn-outline" onClick={() => setMediaPickerOpen(true)}>
                  <i className="fa-solid fa-folder-open" /> Select from Media
                </button>
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="company_name">Company Name <span className="required">*</span></label>
              <input type="text" id="company_name" value={companyName} onChange={(e) => { setCompanyName(e.target.value); markDirty(); }} placeholder="YUVO" className={`form-input ${state?.errors?.company_name ? "input-error" : ""}`} />
              {state?.errors?.company_name && <span className="field-error">{state.errors.company_name}</span>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="company_tagline">Company Tagline</label>
              <input type="text" id="company_tagline" value={companyTagline} onChange={(e) => { setCompanyTagline(e.target.value); markDirty(); }} placeholder="Move Freely. Live Fully." className="form-input" />
            </div>
          </div>
        </section>

        {/* ─── Explore Menu ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Explore Menu</h3>
            <button type="button" className="btn-outline btn-sm" onClick={() => addMenuItem(exploreMenu, setExploreMenu)}>
              <i className="fa-solid fa-plus" /> Add Item
            </button>
          </div>
          {exploreMenu.length === 0 ? (
            <div className="empty-repeater"><p>No explore menu items yet. Click &quot;Add Item&quot; to create one.</p></div>
          ) : (
            <div className="repeater-list">
              {exploreMenu.map((item, i) => (
                <RepeaterItem
                  key={i}
                  item={item}
                  index={i}
                  fields={menuFields}
                  onChange={(idx, field, val) => updateMenuItem(exploreMenu, setExploreMenu, idx, field, val)}
                  onRemove={(idx) => removeMenuItem(exploreMenu, setExploreMenu, idx)}
                  onMoveUp={(idx) => moveItem(exploreMenu, setExploreMenu, idx, -1)}
                  onMoveDown={(idx) => moveItem(exploreMenu, setExploreMenu, idx, 1)}
                  isFirst={i === 0}
                  isLast={i === exploreMenu.length - 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─── Support Menu ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Support Menu</h3>
            <button type="button" className="btn-outline btn-sm" onClick={() => addMenuItem(supportMenu, setSupportMenu)}>
              <i className="fa-solid fa-plus" /> Add Item
            </button>
          </div>
          {supportMenu.length === 0 ? (
            <div className="empty-repeater"><p>No support menu items yet. Click &quot;Add Item&quot; to create one.</p></div>
          ) : (
            <div className="repeater-list">
              {supportMenu.map((item, i) => (
                <RepeaterItem
                  key={i}
                  item={item}
                  index={i}
                  fields={menuFields}
                  onChange={(idx, field, val) => updateMenuItem(supportMenu, setSupportMenu, idx, field, val)}
                  onRemove={(idx) => removeMenuItem(supportMenu, setSupportMenu, idx)}
                  onMoveUp={(idx) => moveItem(supportMenu, setSupportMenu, idx, -1)}
                  onMoveDown={(idx) => moveItem(supportMenu, setSupportMenu, idx, 1)}
                  isFirst={i === 0}
                  isLast={i === supportMenu.length - 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─── Newsletter Section ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Newsletter Section</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="toggle-label">
                <input type="checkbox" checked={newsletterEnabled} onChange={(e) => { setNewsletterEnabled(e.target.checked); markDirty(); }} />
                <span>Enable Newsletter</span>
              </label>
            </div>
            {newsletterEnabled && (
              <>
                <div className="form-group full-width">
                  <label htmlFor="nl_title">Section Title</label>
                  <input type="text" id="nl_title" value={newsletterTitle} onChange={(e) => { setNewsletterTitle(e.target.value); markDirty(); }} placeholder="Join The Movement" className="form-input" />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="nl_desc">Description</label>
                  <textarea id="nl_desc" value={newsletterDescription} onChange={(e) => { setNewsletterDescription(e.target.value); markDirty(); }} placeholder="Get the latest on new products, exclusive offers, and movement tips." className="form-input" rows={2} />
                </div>
                <div className="form-group">
                  <label htmlFor="nl_placeholder">Email Placeholder</label>
                  <input type="text" id="nl_placeholder" value={newsletterPlaceholder} onChange={(e) => { setNewsletterPlaceholder(e.target.value); markDirty(); }} placeholder="Enter your email" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="nl_btn">Button Text</label>
                  <input type="text" id="nl_btn" value={newsletterButtonText} onChange={(e) => { setNewsletterButtonText(e.target.value); markDirty(); }} placeholder="Join the Movement" className="form-input" />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="nl_success">Success Message</label>
                  <input type="text" id="nl_success" value={newsletterSuccessMessage} onChange={(e) => { setNewsletterSuccessMessage(e.target.value); markDirty(); }} placeholder="Thank you for subscribing." className="form-input" />
                </div>
              </>
            )}
          </div>
        </section>



        {/* ─── Privacy Section ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Privacy Section</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="privacy_text">Privacy Text</label>
              <input type="text" id="privacy_text" value={privacyText} onChange={(e) => { setPrivacyText(e.target.value); markDirty(); }} placeholder="We respect your privacy. Unsubscribe anytime." className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="privacy_btn">Privacy Policy Button Text</label>
              <input type="text" id="privacy_btn" value={privacyButtonText} onChange={(e) => { setPrivacyButtonText(e.target.value); markDirty(); }} placeholder="Privacy Policy" className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="privacy_url">Privacy Policy URL</label>
              <input type="text" id="privacy_url" value={privacyUrl} onChange={(e) => { setPrivacyUrl(e.target.value); markDirty(); }} placeholder="/privacy" className="form-input" />
            </div>
          </div>
        </section>

        {/* ─── Copyright Section ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Copyright Section</h3>
            <span className="helper">Use <code>{`{year}`}</code> as placeholder for the current year.</span>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="copyright_text">Copyright Text</label>
              <input type="text" id="copyright_text" value={copyrightText} onChange={(e) => { setCopyrightText(e.target.value); markDirty(); }} placeholder="© {year} YUVO. All rights reserved." className="form-input" />
            </div>
          </div>
        </section>

        {/* ─── Social Media ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Social Media</h3>
            <button type="button" className="btn-outline btn-sm" onClick={() => { markDirty(); setSocialLinks([...socialLinks, { platform: "", icon: "", url: "", newTab: true }]); }}>
              <i className="fa-solid fa-plus" /> Add Social Link
            </button>
          </div>
          {socialLinks.length === 0 ? (
            <div className="empty-repeater"><p>No social links yet. Click &quot;Add Social Link&quot; to create one.</p></div>
          ) : (
            <div className="repeater-list">
              {socialLinks.map((item, i) => (
                <RepeaterItem
                  key={i}
                  item={item}
                  index={i}
                  fields={socialFields}
                  onChange={(idx, field, val) => {
                    markDirty();
                    const updated = [...socialLinks];
                    updated[idx] = { ...updated[idx], [field]: val };
                    setSocialLinks(updated);
                  }}
                  onRemove={(idx) => { markDirty(); setSocialLinks(socialLinks.filter((_, j) => j !== idx)); }}
                  onMoveUp={(idx) => moveItem(socialLinks, setSocialLinks, idx, -1)}
                  onMoveDown={(idx) => moveItem(socialLinks, setSocialLinks, idx, 1)}
                  isFirst={i === 0}
                  isLast={i === socialLinks.length - 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─── Footer Layout Options ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Footer Layout Options</h3>
          </div>
          <div className="layout-toggles">
            {[
              { key: "showNewsletter", label: "Show Newsletter", val: showNewsletter, set: setShowNewsletter },
              { key: "showExplore", label: "Show Explore Menu", val: showExplore, set: setShowExplore },
              { key: "showSupport", label: "Show Support Menu", val: showSupport, set: setShowSupport },
              { key: "showSocial", label: "Show Social Links", val: showSocial, set: setShowSocial },
              { key: "showPrivacy", label: "Show Privacy Section", val: showPrivacy, set: setShowPrivacy },
              { key: "showCopyright", label: "Show Copyright", val: showCopyright, set: setShowCopyright },
            ].map(({ key, label, val, set }) => (
              <label key={key} className="toggle-label">
                <input type="checkbox" checked={val} onChange={(e) => { set(e.target.checked); markDirty(); }} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* ─── Sticky Save ─── */}
        <div className="settings-sticky-bar">
          <div className="settings-sticky-inner">
            <div>
              {dirty && (
                <span className="unsaved-badge">
                  <i className="fa-solid fa-circle" /> Unsaved changes
                </span>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? (
                <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
              ) : (
                <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
              )}
            </button>
          </div>
        </div>
      </form>

      {mediaPickerOpen && (
        <MediaPickerModal
          open={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(item) => { setCompanyLogo(item.url); markDirty(); setMediaPickerOpen(false); }}
          mediaType="image"
        />
      )}
    </>
  );
}
