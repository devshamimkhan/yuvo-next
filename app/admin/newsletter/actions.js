"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getNewsletterSubscribers({ page = 1, limit = 20, search = "", sort = "newest" } = {}) {
  await assertAdmin();

  const where = search
    ? { email: { contains: search } }
    : {};

  const [total, items] = await Promise.all([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function subscribeNewsletter(prevState, formData) {
  const email = formData.get("email")?.trim().toLowerCase() || "";

  if (!email || !EMAIL_RE.test(email)) {
    return { status: "validation_error", message: "Please enter a valid email address." };
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.status === "unsubscribed") {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { status: "subscribed", subscribedAt: new Date() },
        });
        revalidatePath("/admin/newsletter");
        revalidatePath("/", "layout");
        return { status: "success", message: "You've been re-subscribed!" };
      }
      return { status: "duplicate", message: "This email is already subscribed." };
    }

    await prisma.newsletterSubscriber.create({ data: { email } });

    revalidatePath("/admin/newsletter");
    revalidatePath("/", "layout");
    return { status: "success", message: "Thank you for subscribing!" };
  } catch (err) {
    return { status: "server_error", message: "Something went wrong. Please try again." };
  }
}

export async function updateSubscriberStatusAction(prevState, formData) {
  await assertAdmin();

  const id = parseInt(formData.get("id"));
  const status = formData.get("status");

  if (isNaN(id) || !["subscribed", "unsubscribed"].includes(status)) {
    return { success: false, message: "Invalid request." };
  }

  try {
    await prisma.newsletterSubscriber.update({ where: { id }, data: { status } });
    revalidatePath("/admin/newsletter");
    return { success: true, message: "Subscriber status updated." };
  } catch {
    return { success: false, message: "Failed to update subscriber." };
  }
}

export async function deleteSubscriberAction(prevState, formData) {
  await assertAdmin();

  const id = parseInt(formData.get("id"));
  if (isNaN(id)) return { success: false, message: "Invalid request." };

  try {
    await prisma.newsletterSubscriber.delete({ where: { id } });
    revalidatePath("/admin/newsletter");
    return { success: true, message: "Subscriber deleted." };
  } catch {
    return { success: false, message: "Failed to delete subscriber." };
  }
}

export async function bulkUpdateSubscribersAction(prevState, formData) {
  await assertAdmin();

  const ids = JSON.parse(formData.get("ids") || "[]");
  const action = formData.get("action");

  if (!ids.length || !["subscribe", "unsubscribe", "delete"].includes(action)) {
    return { success: false, message: "Invalid request." };
  }

  try {
    if (action === "delete") {
      await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: ids } } });
    } else {
      await prisma.newsletterSubscriber.updateMany({
        where: { id: { in: ids } },
        data: { status: action === "subscribe" ? "subscribed" : "unsubscribed" },
      });
    }
    revalidatePath("/admin/newsletter");
    return { success: true, message: `Bulk ${action} completed successfully.` };
  } catch {
    return { success: false, message: "Bulk operation failed." };
  }
}

export async function getUnreadNewsletterCount() {
  await assertAdmin();
  return prisma.newsletterSubscriber.count({ where: { isRead: false } });
}

export async function markAllNewsletterAsRead() {
  await assertAdmin();
  await prisma.newsletterSubscriber.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}

export async function getNewsletterStatsAction() {
  await assertAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [total, todayCount, monthCount] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { status: "subscribed" } }),
    prisma.newsletterSubscriber.count({
      where: { subscribedAt: { gte: today }, status: "subscribed" },
    }),
    prisma.newsletterSubscriber.count({
      where: { subscribedAt: { gte: monthStart }, status: "subscribed" },
    }),
  ]);

  return { total, today: todayCount, month: monthCount };
}
