export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserProfile from "@/components/UserProfile";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "User Profile | YUVO",
};

export default async function UserProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/user/profile");
  }

  if (session.user?.role === "admin") {
    redirect("/admin/dashboard");
  }

  return <UserProfile user={session.user} />;
}

