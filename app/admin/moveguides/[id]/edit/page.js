export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import MoveGuideForm from "@/components/MoveGuideForm";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import { getMoveGuideAction, updateMoveGuideAction } from "../../actions";

export const metadata = {
  title: "Edit Move Guide - Admin | YUVO",
};

export default async function EditMoveGuidePage({ params }) {
  const resolvedParams = await params;
  const guideId = Number(resolvedParams.id);
  
  if (!Number.isInteger(guideId)) {
    notFound();
  }

  const guide = await getMoveGuideAction(guideId);

  if (!guide) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            Edit Move Guide <span className="sub">{guide.title}</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

      <MoveGuideForm action={updateMoveGuideAction} guide={guide} />
    </>
  );
}
