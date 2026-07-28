import AdminSidebarClient from "./AdminSidebarClient";
import { getTotalProductCountAction } from "@/app/admin/products/actions";
import { getTotalMoveGuidesCountAction } from "@/app/admin/moveguides/actions";
import { getTotalCustomersCountAction } from "@/app/admin/customers/actions";
import { getUnreadNewsletterCount } from "@/app/admin/newsletter/actions";

export default async function AdminSidebar() {
  const [productCount, moveGuideCount, customerCount, unreadNewsletterCount] = await Promise.all([
    getTotalProductCountAction(),
    getTotalMoveGuidesCountAction(),
    getTotalCustomersCountAction(),
    getUnreadNewsletterCount(),
  ]);

  return (
    <AdminSidebarClient
      productCount={productCount}
      moveGuideCount={moveGuideCount}
      customerCount={customerCount}
      unreadNewsletterCount={unreadNewsletterCount}
    />
  );
}
