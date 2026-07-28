"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

const orders = [
  ["#YUV-1024", "Jul 22, 2026", "2", "$79.98", "completed"],
  ["#YUV-1018", "Jul 15, 2026", "1", "$39.99", "shipped"],
  ["#YUV-1005", "Jul 08, 2026", "3", "$89.97", "completed"],
  ["#YUV-0992", "Jun 28, 2026", "1", "$39.99", "pending"],
  ["#YUV-0978", "Jun 15, 2026", "2", "$64.98", "completed"],
];

function initialsFor(name, email) {
  const source = name || email || "YUVO Customer";
  return source
    .split(/[ @.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserProfile({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const name = user?.name || "YUVO Customer";
  const email = user?.email || "customer@example.com";
  const initials = initialsFor(name, email);

  return (
    <div className="yuvo-profile-shell">
      <main className="profile-main-content">
        <header className="profile-topbar">
          <div className="topbar-left">
            <Link href="/" className="back-link">
              <i className="fa-solid fa-arrow-left" /> Back to Home
            </Link>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
        </header>

        <section className="profile-header">
          <div className="profile-left">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h2>{name}</h2>
              <div className="profile-email">{email}</div>
              <div className="profile-meta">
                <span>
                  <i className="fa-regular fa-calendar" /> Joined Jul 2026
                </span>
                <span>
                  <i className="fa-regular fa-clock" /> Last active now
                </span>
                <span className="status-pill active">
                  <i className="fa-regular fa-circle-check" /> Active
                </span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button
              className="btn-icon primary"
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fa-regular fa-pen-to-square" /> Edit Profile
            </button>
            <button
              className="btn-icon signout"
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" /> Sign Out
            </button>
          </div>
        </section>

        <section className="profile-grid">
          <div className="profile-card">
            <div className="card-header">
              <h3>Customer Information</h3>
              <button
                type="button"
                className="card-action"
                onClick={() => setIsModalOpen(true)}
              >
                Edit
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">{email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">Not added yet</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value">Customer</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  <span className="status-pill active">
                    <i className="fa-regular fa-circle-check" /> Active
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login</span>
                <span className="info-value">Now</span>
              </div>
              <div className="info-item wide">
                <span className="info-label">Shipping Address</span>
                <span className="info-value">No shipping address added yet</span>
              </div>
              <div className="info-item wide">
                <span className="info-label">Billing Address</span>
                <span className="info-value">Same as shipping</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <h3>My Orders</h3>
              <a href="#" className="card-action">
                View All
              </a>
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
                  {orders.map(([id, date, items, total, status]) => (
                    <tr key={id}>
                      <td>
                        <strong>{id}</strong>
                      </td>
                      <td>{date}</td>
                      <td>{items}</td>
                      <td>{total}</td>
                      <td>
                        <span className={`status-pill ${status}`}>{status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <footer className="admin-footer">
          <span>© 2026 YUVO. All rights reserved.</span>
          <div className="links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </footer>
      </main>

      {isModalOpen ? (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Customer</h2>
              <button
                className="modal-close"
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setIsModalOpen(false);
              }}
            >
              <div className="form-group">
                <label htmlFor="editName">Full Name</label>
                <input type="text" id="editName" defaultValue={name} />
              </div>
              <div className="form-group">
                <label htmlFor="editEmail">Email Address</label>
                <input type="email" id="editEmail" defaultValue={email} />
              </div>
              <div className="form-group">
                <label htmlFor="editPhone">Phone Number</label>
                <input type="text" id="editPhone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="form-group">
                <label htmlFor="editAddress">Shipping Address</label>
                <input type="text" id="editAddress" placeholder="Add shipping address" />
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="submit">
                  <i className="fa-regular fa-floppy-disk" /> Save Changes
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
