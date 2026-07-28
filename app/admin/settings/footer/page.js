export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import FooterSettingsForm from "@/components/FooterSettingsForm";
import { getFooterSettings, updateFooterSettings } from "../footer/actions";

export const metadata = {
  title: "Footer Settings | YUVO",
};

export default async function FooterSettingsPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  let initialSettings = {};
  let error = null;

  try {
    initialSettings = await getFooterSettings();
  } catch (err) {
    error = err.message;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            Footer Settings
            <span className="sub">Manage your website footer</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

      {error ? (
        <div className="error-state">
          <i className="fa-solid fa-triangle-exclamation" />
          <h3>Failed to load footer settings</h3>
          <p>{error}</p>
        </div>
      ) : (
        <FooterSettingsForm
          initialSettings={initialSettings}
          updateAction={updateFooterSettings}
        />
      )}
    </>
  );
}
