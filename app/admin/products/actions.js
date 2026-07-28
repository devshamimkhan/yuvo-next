"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin/products");
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

function decimalValue(formData, key) {
  const value = textValue(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : null;
}

function intValue(formData, key) {
  const value = Number.parseInt(textValue(formData, key), 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function linesValue(formData, key) {
  const value = textValue(formData, key);
  if (!value) return null;
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines : undefined;
}

function serializeProduct(product) {
  if (!product) return product;
  return {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };
}

// Serialize an array of products
function serializeProducts(products) {
  return products.map(serializeProduct);
}

function pipeRowsValue(formData, key, fields) {
  const rows = linesValue(formData, key);
  if (!rows) return undefined;

  const parsed = rows.map((row) => {
    const parts = row.split("|").map((part) => part.trim());
    return fields.reduce((entry, field, index) => {
      entry[field] = parts[index] || "";
      return entry;
    }, {});
  });

  return parsed.length ? parsed : undefined;
}

function productData(formData) {
  const name = textValue(formData, "name");
  const productType = textValue(formData, "productType") || "comingSoon";
  const slugInput = textValue(formData, "slug");
  const slug = slugInput ? generateSlug(slugInput) : generateSlug(name);

  if (!["comingSoon", "affiliate"].includes(productType)) {
    throw new Error("Invalid product type.");
  }

  const isAffiliate = productType === "affiliate";

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!slug) {
    throw new Error("A valid slug could not be generated from the product name.");
  }

  // Price is required for all products
  const price = decimalValue(formData, "price");
  if (price === null) {
    throw new Error("Price is required.");
  }

  // Affiliate URL is required for affiliate products
  const affiliateUrl = optionalText(formData, "affiliateUrl");
  if (isAffiliate) {
    if (!affiliateUrl) throw new Error("Affiliate URL is required.");
    try { new URL(affiliateUrl); } catch {
      throw new Error("Affiliate URL must be a valid URL (e.g. https://example.com).");
    }
  }

  const comparePrice = decimalValue(formData, "comparePrice");
  const rating = textValue(formData, "rating");
  const status = textValue(formData, "status") || "draft";

  if (!["active", "draft", "archived"].includes(status)) {
    throw new Error("Invalid product status.");
  }

  const parsedFeatures = pipeRowsValue(formData, "features", ["icon", "title", "description"]);
  const featureSectionTitle = textValue(formData, "product_features_section_title");
  const featuresObj = parsedFeatures || featureSectionTitle ? {
    sectionTitle: featureSectionTitle || "",
    items: parsedFeatures || []
  } : null;

  const additionalContentTitle = textValue(formData, "additionalContentTitle");
  const additionalContentDescription = textValue(formData, "additionalContentDescription");
  const additionalContentBanner = textValue(formData, "additionalContentBanner");
  const parsedAdditionalItems = pipeRowsValue(formData, "additionalItems", ["icon", "title", "description"]);

  const additionalContentObj = parsedAdditionalItems || additionalContentTitle || additionalContentDescription || additionalContentBanner ? {
    title: additionalContentTitle || "",
    description: additionalContentDescription || "",
    bannerUrl: additionalContentBanner || "",
    items: parsedAdditionalItems || []
  } : null;

  return {
    name,
    slug,
    productType,
    price,
    comparePrice,
    status,
    imageUrl: optionalText(formData, "imageUrl"),
    galleryImages: linesValue(formData, "galleryImages"),
    shortDescription: optionalText(formData, "shortDescription"),
    description: optionalText(formData, "description"),
    rating: rating ? Number(rating) : null,
    shipping: optionalText(formData, "shipping"),
    kitItems: linesValue(formData, "kitItems"),
    features: featuresObj,
    additionalContent: additionalContentObj,
    faqs: pipeRowsValue(formData, "faqs", ["question", "answer"]),
    affiliateUrl: isAffiliate ? affiliateUrl : null,
  };
}

export async function getProductsAction(filters = {}) {
  await assertAdmin();

  const search = filters.search?.trim();
  const status = filters.status && filters.status !== "all" ? filters.status : null;

  const products = await prisma.product.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { id: "desc" },
  });

  return serializeProducts(products);
}

export async function getTotalProductCountAction() {
  await assertAdmin();
  return prisma.product.count();
}

export async function getProductAction(id) {
  await assertAdmin();

  const productId = Number(id);
  if (!Number.isInteger(productId)) return null;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  return serializeProduct(product);
}

export async function createProductAction(formData) {
  await assertAdmin();
  try {
    await prisma.product.create({ data: productData(formData) });
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target || "unique field";
      throw new Error(`A product with this ${field} already exists. Please use a different value.`);
    }
    throw error;
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(formData) {
  await assertAdmin();
  const id = Number(textValue(formData, "id"));

  if (!Number.isInteger(id)) {
    throw new Error("A valid product ID is required.");
  }

  try {
    await prisma.product.update({
      where: { id },
      data: productData(formData),
    });
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target || "unique field";
      throw new Error(`A product with this ${field} already exists. Please use a different value.`);
    }
    throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  //redirect("/admin/products");
}

export async function deleteProductAction(formData) {
  await assertAdmin();
  const id = Number(textValue(formData, "id"));

  if (!Number.isInteger(id)) {
    throw new Error("A valid product ID is required.");
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function toggleFeaturedAction(id, featured) {
  await assertAdmin();
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    throw new Error("A valid product ID is required.");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { featured },
  });

  revalidatePath("/admin/products");
}
