"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin/moveguides");
  }

  if (session.user?.role !== "admin") {
    redirect("/user/profile");
  }

  return session;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function textValue(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData, key) {
  const value = textValue(formData, key);
  return value || null;
}

function jsonValue(formData, key) {
  const value = formData.get(key);
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
}

function guideData(formData) {
  const title = textValue(formData, "title");
  const description = textValue(formData, "description");
  const instructionText = textValue(formData, "instructionText");
  const status = textValue(formData, "status") || "draft";
  const slugInput = textValue(formData, "slug");
  const slug = slugInput ? generateSlug(slugInput) : generateSlug(title);

  if (!title || !description || !instructionText) {
    throw new Error("Title, Introduction, and Description are required.");
  }

  if (!slug) {
    throw new Error("A valid slug could not be generated from the guide title.");
  }

  if (!["active", "draft", "archived"].includes(status)) {
    throw new Error("Invalid guide status.");
  }

  return {
    title,
    slug,
    description,
    imageUrl: optionalText(formData, "imageUrl"),
    instructionText,
    disclaimerText: optionalText(formData, "disclaimerText"),
    icon: optionalText(formData, "icon"),
    featured: formData.get("featured") === "true",
    
    // JSON repeaters
    moves: jsonValue(formData, "movesData"),
    tools: jsonValue(formData, "toolsData"),
    contentSections: jsonValue(formData, "contentSectionsData"),
    
    status,
  };
}

export async function getMoveGuidesAction(filters = {}) {
  await assertAdmin();

  const search = filters.search?.trim();
  const status = filters.status && filters.status !== "all" ? filters.status : null;

  const guides = await prisma.moveGuide.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { id: "desc" },
  });

  return guides;
}

export async function getTotalMoveGuidesCountAction() {
  await assertAdmin();
  return prisma.moveGuide.count();
}

export async function getMoveGuideAction(id) {
  await assertAdmin();

  const guideId = Number(id);
  if (!Number.isInteger(guideId)) return null;

  const guide = await prisma.moveGuide.findUnique({
    where: { id: guideId },
  });

  return guide;
}

export async function createMoveGuideAction(formData) {
  await assertAdmin();
  await prisma.moveGuide.create({ data: guideData(formData) });
  revalidatePath("/admin/moveguides");
  redirect("/admin/moveguides");
}

export async function updateMoveGuideAction(formData) {
  await assertAdmin();
  const id = Number(textValue(formData, "id"));

  if (!Number.isInteger(id)) {
    throw new Error("A valid move guide ID is required.");
  }

  await prisma.moveGuide.update({
    where: { id },
    data: guideData(formData),
  });

  revalidatePath("/admin/moveguides");
  revalidatePath(`/admin/moveguides/${id}/edit`);
}

export async function deleteMoveGuideAction(formData) {
  await assertAdmin();
  const id = Number(textValue(formData, "id"));

  if (!Number.isInteger(id)) {
    throw new Error("A valid move guide ID is required.");
  }

  await prisma.moveGuide.delete({ where: { id } });
  revalidatePath("/admin/moveguides");
}

export async function toggleMoveGuideFeaturedAction(id, featured) {
  await assertAdmin();

  if (!Number.isInteger(id)) {
    throw new Error("A valid move guide ID is required.");
  }

  await prisma.moveGuide.update({
    where: { id },
    data: { featured },
  });

  revalidatePath("/admin/moveguides");
}
