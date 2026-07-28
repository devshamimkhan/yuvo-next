export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { authOptions } from "@/lib/auth";
export const metadata = {
  title: "Admin Dashboard | YUVO",
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  if (session.user?.role !== "admin") {
    redirect("/user/profile");
  }

  return <AdminDashboard user={session.user} />;
}

