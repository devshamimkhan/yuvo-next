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

const FOOTER_KEYS = [
  "company_logo",
  "company_name",
  "company_tagline",
  "explore_menu",
  "support_menu",
  "newsletter_enabled",
  "newsletter_title",
  "newsletter_description",
  "newsletter_placeholder",
  "newsletter_button_text",
  "newsletter_success_message",
  "privacy_text",
  "privacy_button_text",
  "privacy_url",
  "copyright_text",
  "social_links",
  "layout_show_newsletter",
  "layout_show_explore",
  "layout_show_support",
  "layout_show_social",
  "layout_show_privacy",
  "layout_show_copyright",
];

const URL_RE = /^(https?:\/\/|\/|#)/;

export async function getFooterSettings() {
  await assertAdmin();

  const rows = await prisma.footerSetting.findMany();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateFooterSettings(prevState, formData) {
  await assertAdmin();

  const errors = {};

  // Parse all fields from FormData
  const companyLogo = formData.get("company_logo")?.trim() || "";
  const companyName = formData.get("company_name")?.trim() || "";
  const companyTagline = formData.get("company_tagline")?.trim() || "";

  // Parse JSON arrays from hidden fields
  let exploreMenu = [];
  let supportMenu = [];
  let socialLinks = [];

  try {
    const em = formData.get("explore_menu");
    if (em) exploreMenu = JSON.parse(em);
  } catch {}
  try {
    const sm = formData.get("support_menu");
    if (sm) supportMenu = JSON.parse(sm);
  } catch {}
  try {
    const sl = formData.get("social_links");
    if (sl) socialLinks = JSON.parse(sl);
  } catch {}

  // Newsletter
  const newsletterEnabled = formData.get("newsletter_enabled") === "true";
  const newsletterTitle = formData.get("newsletter_title")?.trim() || "";
  const newsletterDescription = formData.get("newsletter_description")?.trim() || "";
  const newsletterPlaceholder = formData.get("newsletter_placeholder")?.trim() || "";
  const newsletterButtonText = formData.get("newsletter_button_text")?.trim() || "";
  const newsletterSuccessMessage = formData.get("newsletter_success_message")?.trim() || "";

  // Privacy
  const privacyText = formData.get("privacy_text")?.trim() || "";
  const privacyButtonText = formData.get("privacy_button_text")?.trim() || "";
  const privacyUrl = formData.get("privacy_url")?.trim() || "";

  // Copyright
  const copyrightText = formData.get("copyright_text")?.trim() || "";

  // Layout toggles
  const layoutShowNewsletter = formData.get("layout_show_newsletter") === "true";
  const layoutShowExplore = formData.get("layout_show_explore") === "true";
  const layoutShowSupport = formData.get("layout_show_support") === "true";
  const layoutShowSocial = formData.get("layout_show_social") === "true";
  const layoutShowPrivacy = formData.get("layout_show_privacy") === "true";
  const layoutShowCopyright = formData.get("layout_show_copyright") === "true";

  // Validation
  if (!companyName) {
    errors.company_name = "Company name is required.";
  }

  // Validate menu URLs
  const urlWarnings = [];
  for (const [label, items] of [["Explore menu", exploreMenu], ["Support menu", supportMenu]]) {
    for (let i = 0; i < items.length; i++) {
      const url = items[i]?.url || "";
      if (url && !URL_RE.test(url)) {
        urlWarnings.push(`${label} item #${i + 1}: URL should start with http(s)://, /, or #`);
      }
    }
  }

  // Validate social links
  for (let i = 0; i < socialLinks.length; i++) {
    const url = socialLinks[i]?.url || "";
    if (url && !URL_RE.test(url)) {
      urlWarnings.push(`Social link #${i + 1}: URL should start with http(s)://, /, or #`);
    }
  }

  if (urlWarnings.length > 0) {
    errors._form = urlWarnings.join(". ");
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const settings = {
    company_logo: companyLogo || null,
    company_name: companyName,
    company_tagline: companyTagline || null,
    explore_menu: exploreMenu,
    support_menu: supportMenu,
    newsletter_enabled: newsletterEnabled,
    newsletter_title: newsletterTitle || null,
    newsletter_description: newsletterDescription || null,
    newsletter_placeholder: newsletterPlaceholder || null,
    newsletter_button_text: newsletterButtonText || null,
    newsletter_success_message: newsletterSuccessMessage || null,
    privacy_text: privacyText || null,
    privacy_button_text: privacyButtonText || null,
    privacy_url: privacyUrl || null,
    copyright_text: copyrightText || null,
    social_links: socialLinks,
    layout_show_newsletter: layoutShowNewsletter,
    layout_show_explore: layoutShowExplore,
    layout_show_support: layoutShowSupport,
    layout_show_social: layoutShowSocial,
    layout_show_privacy: layoutShowPrivacy,
    layout_show_copyright: layoutShowCopyright,
  };

  try {
    for (const [key, value] of Object.entries(settings)) {
      await prisma.footerSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    revalidatePath("/admin/settings/footer");
    revalidatePath("/", "layout");

    return { success: true, errors: null };
  } catch (err) {
    return { success: false, errors: { _form: err.message || "Failed to update footer settings." } };
  }
}

// Public server action for frontend footer
export async function getPublicFooterSettings() {
  const rows = await prisma.footerSetting.findMany();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}
