"use client";

import { useState, useCallback, useEffect } from "react";
import { useActionState } from "react";
import { toast } from "react-hot-toast";
import MediaPickerModal from "@/components/media/MediaPickerModal";

export default function GeneralSettingsForm({ initialSettings, updateAction }) {
  const [settings, setSettings] = useState(() => {
    const defaults = {};
    const keys = [
      "site_logo", "site_title", "site_tagline",
    ];
    for (const k of keys) {
      defaults[k] = (initialSettings && initialSettings[k]) || "";
    }
    return defaults;
  });

  const [dirty, setDirty] = useState(false);
  const [state, formAction, isPending] = useActionState(updateAction, null);

  // Media picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);

  const handleChange = useCallback((name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  }, []);

  const openMediaPicker = (target) => {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (item) => {
    if (mediaPickerTarget) {
      handleChange(mediaPickerTarget, item.url);
    }
  };

  // Toast for success/error
  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("General settings saved successfully.");
      setDirty(false);
    } else if (state.errors) {
      const formErr = state.errors._form;
      if (formErr) toast.error(formErr);
      else toast.error("Please fix the validation errors.");
    }
  }, [state]);

  const s = settings;

  return (
    <>
      <form action={formAction} onChange={() => setDirty(true)}>
        {/* ─── Site Identity ─── */}
        <section className="form-card settings-card">
          <div className="card-header">
            <h3>Site Identity</h3>
          </div>
          <div className="form-grid">
            {/* Website Logo */}
            <div className="form-group full-width">
              <label>
                Website Logo <span className="required">*</span>
              </label>
              <div className="media-field-row">
                {s.site_logo ? (
                  <div className="media-preview-thumb">
                    <img src={s.site_logo} alt="Site logo" />
                    <button
                      type="button"
                      className="media-remove-btn"
                      onClick={() => handleChange("site_logo", "")}
                      aria-label="Remove logo"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ) : (
                  <div className="media-preview-thumb media-placeholder">
                    <i className="fa-regular fa-image" />
                  </div>
                )}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => openMediaPicker("site_logo")}
                >
                  <i className="fa-solid fa-folder-open" /> Select from Media
                </button>
              </div>
              <input type="hidden" name="site_logo" value={s.site_logo} />
            </div>

            {/* Site Title */}
            <div className="form-group full-width">
              <label htmlFor="site_title">
                Site Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="site_title"
                name="site_title"
                value={s.site_title}
                onChange={(e) => handleChange("site_title", e.target.value)}
                placeholder="YUVO"
                className={`form-input ${state?.errors?.site_title ? "input-error" : ""}`}
              />
              {state?.errors?.site_title && (
                <span className="field-error">{state.errors.site_title}</span>
              )}
            </div>

            {/* Site Tagline */}
            <div className="form-group full-width">
              <label htmlFor="site_tagline">Site Tagline</label>
              <input
                type="text"
                id="site_tagline"
                name="site_tagline"
                value={s.site_tagline}
                onChange={(e) => handleChange("site_tagline", e.target.value)}
                placeholder="Move Freely. Live Fully."
                className="form-input"
              />
            </div>
          </div>
        </section>



        {/* ─── Sticky Save Button ─── */}
        <div className="settings-sticky-bar">
          <div className="settings-sticky-inner">
            <div>
              {dirty && (
                <span className="unsaved-badge">
                  <i className="fa-solid fa-circle" /> Unsaved changes
                </span>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Saving…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          open={mediaPickerOpen}
          onClose={() => {
            setMediaPickerOpen(false);
            setMediaPickerTarget(null);
          }}
          onSelect={handleMediaSelect}
          mediaType="image"
        />
      )}
    </>
  );
}
