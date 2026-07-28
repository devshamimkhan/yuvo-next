export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MediaLibraryClient from "@/components/media/MediaLibraryClient";
import AdminTopbarRight from "@/components/AdminTopbarRight";

export const metadata = {
  title: "Admin Media | YUVO",
};

export default async function AdminMediaPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span className="sub">Manage your assets</span>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

      <section>
        <MediaLibraryClient />
      </section>
    </>
  );
}

