"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin/customers");
  }

  if (session.user?.role !== "admin") {
    redirect("/user/profile");
  }

  return session;
}

const ITEMS_PER_PAGE = 15;

export async function getCustomersAction(filters = {}) {
  await assertAdmin();

  const search = filters.search?.trim();
  const role = filters.role && filters.role !== "all" ? filters.role : null;
  const page = Math.max(1, Number(filters.page) || 1);

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
      perPage: ITEMS_PER_PAGE,
    },
  };
}

export async function getTotalCustomersCountAction() {
  await assertAdmin();
  return prisma.user.count();
}

export async function updateCustomerAction(prevState, formData) {
  await assertAdmin();

  const id = formData.get("id");
  const name = formData.get("name")?.trim();
  const email = formData.get("email")?.trim().toLowerCase();
  const password = formData.get("password");

  // Validation
  const errors = {};

  if (!name) {
    errors.name = "Full name is required.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  }

  if (password && typeof password === "string" && password.length > 0 && password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  if (!id || typeof id !== "string") {
    return { success: false, errors: { _form: "A valid user ID is required." } };
  }

  // Check email uniqueness (excluding current user)
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== id) {
    return { success: false, errors: { email: "This email is already taken by another user." } };
  }

  try {
    const updateData = { name, email };

    // Only hash and update password if a new one was provided
    if (password && typeof password === "string" && password.length > 0) {
      updateData.password = await hash(password, 12);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/customers");
    return { success: true, errors: null };
  } catch (error) {
    if (error.code === "P2002") {
      return { success: false, errors: { email: "This email is already in use." } };
    }
    return { success: false, errors: { _form: error.message || "Failed to update customer." } };
  }
}

export async function deleteCustomerAction(formData) {
  await assertAdmin();
  const id = formData.get("id");

  if (!id || typeof id !== "string") {
    throw new Error("A valid user ID is required.");
  }

  // Prevent deleting yourself
  const session = await getServerSession(authOptions);
  if (session.user?.id === id) {
    throw new Error("You cannot delete your own account.");
  }

  // Prevent deleting other admins
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (!targetUser) {
    throw new Error("User not found.");
  }

  if (targetUser.role === "admin") {
    throw new Error("Cannot delete admin accounts. Change their role first.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/customers");
}
