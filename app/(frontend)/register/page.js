
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Register | YUVO",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(session.user?.role === "admin" ? "/admin/dashboard" : "/user/profile");
  }

  return <AuthCard mode="register" />;
}
