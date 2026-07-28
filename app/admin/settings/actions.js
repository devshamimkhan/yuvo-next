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

const SETTING_KEYS = [
  "site_logo",
  "site_title",
  "site_tagline",
];

export async function getGeneralSettings() {
  await assertAdmin();

  const rows = await prisma.generalSetting.findMany();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateGeneralSettings(prevState, formData) {
  await assertAdmin();

  const entries = [];
  const errors = {};

  for (const key of SETTING_KEYS) {
    const value = formData.get(key)?.trim() ?? "";
    entries.push({ key, value });
  }

  // Validation
  const siteTitle = entries.find((e) => e.key === "site_title")?.value || "";
  if (!siteTitle) {
    errors.site_title = "Site title is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    // Upsert each setting
    for (const { key, value } of entries) {
      const jsonValue = value || null;
      await prisma.generalSetting.upsert({
        where: { key },
        update: { value: jsonValue },
        create: { key, value: jsonValue },
      });
    }

    revalidatePath("/admin/settings/general");
    revalidatePath("/", "layout");

    return { success: true, errors: null };
  } catch (err) {
    return { success: false, errors: { _form: err.message || "Failed to update settings." } };
  }
}
