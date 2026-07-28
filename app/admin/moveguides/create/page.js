export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MoveGuideForm from "@/components/MoveGuideForm";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import { createMoveGuideAction } from "../actions";

export const metadata = {
  title: "Add Move Guide - Admin | YUVO",
};

export default async function CreateMoveGuidePage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  return (
    <>
        <header className="topbar">
          <div className="topbar-left">
            <h1>
              Add Move Guide <span className="sub">Build a new guided routine</span>
            </h1>
          </div>
          <div className="topbar-right">
            <AdminTopbarRight userName={userName} />
          </div>
        </header>

      <MoveGuideForm action={createMoveGuideAction} />
    </>
  );
}

