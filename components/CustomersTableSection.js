"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomersTableWrapper from "./CustomersTableWrapper";
import CustomerEditModal from "./CustomerEditModal";

export default function CustomersTableSection({ users, filters }) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState(null);

  const handleSaved = () => {
    router.refresh();
  };

  return (
    <>
      <table className="product-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Role</th>
            <th>Registered</th>
            <th className="align-right">Actions</th>
          </tr>
        </thead>
        <CustomersTableWrapper
          users={users}
          filters={filters}
          onEditUser={(user) => setEditingUser(user)}
        />
      </table>

      <CustomerEditModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
