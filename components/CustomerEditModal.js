"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "react-hot-toast";
import { updateCustomerAction } from "@/app/admin/customers/actions";

export default function CustomerEditModal({ user, isOpen, onClose, onSaved }) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Sync form data when the user being edited changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
      setErrors({});
    }
  }, [user?.id]);

  if (!isOpen || !user) return null;

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrors({});

    const fd = new FormData();
    fd.set("id", user.id);
    fd.set("name", formData.name);
    fd.set("email", formData.email);
    fd.set("password", formData.password);

    startTransition(async () => {
      const result = await updateCustomerAction(null, fd);

      if (result.success) {
        toast.success("Customer updated successfully!");
        onSaved();
        onClose();
      } else {
        setErrors(result.errors || {});
        if (result.errors?._form) {
          toast.error(result.errors._form);
        }
      }
    });
  }

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Customer</h2>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            disabled={isPending}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="edit-customer-name">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="edit-customer-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "input-error" : ""}
                placeholder="e.g. John Doe"
                disabled={isPending}
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="edit-customer-email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="edit-customer-email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "input-error" : ""}
                placeholder="e.g. john@example.com"
                disabled={isPending}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="edit-customer-password">
                Password
                <span className="helper required-note">(leave empty to keep current)</span>
              </label>
              <input
                type="password"
                id="edit-customer-password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={errors.password ? "input-error" : ""}
                placeholder="New password (optional)"
                disabled={isPending}
                autoComplete="new-password"
              />
              {errors.password ? (
                <span className="field-error">{errors.password}</span>
              ) : (
                <span className="helper">8+ characters with letters, numbers &amp; symbols</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-primary"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Saving...
                </>
              ) : (
                <>
                  <i className="fa-regular fa-floppy-disk" /> Save Changes
                </>
              )}
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
