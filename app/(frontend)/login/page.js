import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Login | YUVO",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(session.user?.role === "admin" ? "/admin/dashboard" : "/user/profile");
  }

  return <AuthCard mode="login" />;
}
