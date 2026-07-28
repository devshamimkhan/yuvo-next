"use client";

import CustomerDeleteButton from "./CustomerDeleteButton";

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CustomersTableWrapper({ users, filters, onEditUser }) {
  if (!users.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="empty-table">
            <i className="fa-regular fa-users" />
            {filters.search
              ? "No customers found matching your search."
              : "No customers yet."}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {users.map((user) => (
        <tr key={user.id}>
          <td>
            <div className="product-cell">
              <div className="thumb avatar-thumb">
                {getInitials(user.name)}
              </div>
              <div className="info">
                <h4>{user.name}</h4>
              </div>
            </div>
          </td>
          <td className="email-cell">{user.email}</td>
          <td>
            <span className={`status-pill ${user.role}`}>
              {user.role === "admin" ? (
                <><i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }} /> Admin</>
              ) : (
                <><i className="fa-regular fa-user" style={{ marginRight: 4 }} /> Customer</>
              )}
            </span>
          </td>
          <td className="date-cell">{formatDate(user.createdAt)}</td>
          <td className="align-right">
            <div className="actions">
              <button
                type="button"
                className="btn-edit"
                onClick={() => onEditUser(user)}
              >
                <i className="fa-regular fa-pen-to-square" /> Edit
              </button>
              <CustomerDeleteButton user={user} />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
