"use client";

import { useState } from "react";
import Link from "next/link";

export default function UserProfileClient() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", isError: false });
  
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    joined: "2026-01-15",
    address: "123 Main St, Apt 4B, Brooklyn, NY 11201, USA"
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: "", isError: false });
    }, 4000);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast("Please fill in all required fields.", true);
      return;
    }
    
    setProfile({ ...editForm });
    setIsEditModalOpen(false);
    showToast("Profile updated successfully!");
  };

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      showToast("Signed out successfully!");
      // window.location.href = "/login";
    }
  };

  return (
    <>
      <main className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <Link href="/" className="back-link">
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </Link>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search..." />
            </div>
          </div>
        </header>

        {/* Profile Header */}
        <section className="profile-header">
          <div className="profile-left">
            <div className="profile-avatar">
              {profile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>{profile.name}</h2>
              <div className="profile-email">{profile.email}</div>
              <div className="profile-meta">
                <span>
                  <i className="fa-regular fa-calendar"></i> Joined {new Date(profile.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>
                  <i className="fa-regular fa-clock"></i> Last active 2 hours ago
                </span>
                {profile.status === 'active' && (
                  <span className="status-pill active">
                    <i className="fa-regular fa-circle-check"></i> Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn-icon primary" onClick={() => setIsEditModalOpen(true)}>
              <i className="fa-regular fa-pen-to-square"></i> Edit Profile
            </button>
            <button className="btn-icon signout" onClick={handleSignOut}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </section>

        {/* Profile Body (Two Column) */}
        <section className="profile-grid">
          {/* Customer Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Customer Information</h3>
              <button 
                className="card-action" 
                onClick={() => setIsEditModalOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Edit
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{profile.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{profile.phone || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  {profile.status === 'active' ? (
                    <span className="status-pill active" style={{ fontSize: "12px" }}>
                      <i className="fa-regular fa-circle-check"></i> Active
                    </span>
                  ) : (
                    <span className="status-pill" style={{ fontSize: "12px" }}>Inactive</span>
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Joined Date</span>
                <span className="info-value">
                  {new Date(profile.joined).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login</span>
                <span className="info-value">2 hours ago</span>
              </div>
              <div className="info-item" style={{ gridColumn: "1 / -1" }}>
                <span className="info-label">Shipping Address</span>
                <span className="info-value">{profile.address || "—"}</span>
              </div>
              <div className="info-item" style={{ gridColumn: "1 / -1" }}>
                <span className="info-label">Billing Address</span>
                <span className="info-value">Same as shipping</span>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="profile-card">
            <div className="card-header">
              <h3>My Orders</h3>
              <Link href="#" className="card-action">View All</Link>
            </div>
            <div className="order-history">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>#YUV-1024</strong></td>
                    <td>Jul 22, 2026</td>
                    <td>2</td>
                    <td>$79.98</td>
                    <td><span className="status-pill completed">Completed</span></td>
                  </tr>
                  <tr>
                    <td><strong>#YUV-1018</strong></td>
                    <td>Jul 15, 2026</td>
                    <td>1</td>
                    <td>$39.99</td>
                    <td><span className="status-pill shipped">Shipped</span></td>
                  </tr>
                  <tr>
                    <td><strong>#YUV-1005</strong></td>
                    <td>Jul 08, 2026</td>
                    <td>3</td>
                    <td>$89.97</td>
                    <td><span className="status-pill completed">Completed</span></td>
                  </tr>
                  <tr>
                    <td><strong>#YUV-0992</strong></td>
                    <td>Jun 28, 2026</td>
                    <td>1</td>
                    <td>$39.99</td>
                    <td><span className="status-pill pending">Pending</span></td>
                  </tr>
                  <tr>
                    <td><strong>#YUV-0978</strong></td>
                    <td>Jun 15, 2026</td>
                    <td>2</td>
                    <td>$64.98</td>
                    <td><span className="status-pill completed">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="admin-footer">
          <span>© 2026 <Link href="/">YUVO</Link>. All rights reserved.</span>
          <div className="links">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Support</Link>
          </div>
        </footer>
      </main>

      {/* ══ MODAL (Edit Customer) ══ */}
      <div className={`modal-overlay ${isEditModalOpen ? "active" : ""}`} onClick={(e) => { if(e.target === e.currentTarget) setIsEditModalOpen(false); }}>
        <div className="modal">
          <div className="modal-header">
            <h2>Edit Profile</h2>
            <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form onSubmit={handleEditSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="editName">Full Name <span className="required">*</span></label>
              <input 
                type="text" 
                id="editName" 
                value={editForm.name} 
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="editEmail">Email Address <span className="required">*</span></label>
              <input 
                type="email" 
                id="editEmail" 
                value={editForm.email}
                onChange={e => setEditForm({...editForm, email: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="editPhone">Phone Number</label>
              <input 
                type="text" 
                id="editPhone" 
                value={editForm.phone}
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="editStatus">Status</label>
                <select 
                  id="editStatus" 
                  value={editForm.status}
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editJoined">Joined Date</label>
                <input 
                  type="date" 
                  id="editJoined" 
                  value={editForm.joined}
                  onChange={e => setEditForm({...editForm, joined: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="editAddress">Shipping Address</label>
              <input 
                type="text" 
                id="editAddress" 
                value={editForm.address}
                onChange={e => setEditForm({...editForm, address: e.target.value})} 
              />
            </div>
            <div className="form-actions">
              <button className="btn-primary" type="submit">
                <i className="fa-regular fa-floppy-disk"></i> Save Changes
              </button>
              <button className="btn-secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Toast ── */}
      <div className={`toast ${toast.show ? "show" : ""}`}>
        <span className={`toast-icon ${toast.isError ? "error" : ""}`}>
          {toast.isError ? (
            <i className="fa-regular fa-circle-xmark"></i>
          ) : (
            <i className="fa-regular fa-circle-check"></i>
          )}
        </span>
        <span>{toast.message}</span>
        <button className="toast-close" onClick={() => setToast({...toast, show: false})}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </>
  );
}
