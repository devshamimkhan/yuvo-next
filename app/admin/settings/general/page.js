export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import GeneralSettingsForm from "@/components/GeneralSettingsForm";
import { getGeneralSettings, updateGeneralSettings } from "../actions";

export const metadata = {
  title: "General Settings | YUVO",
};

export default async function GeneralSettingsPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  let initialSettings = {};
  let error = null;

  try {
    initialSettings = await getGeneralSettings();
  } catch (err) {
    error = err.message;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            General Settings
            <span className="sub">Manage your website configuration</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

      {error ? (
        <div className="error-state">
          <i className="fa-solid fa-triangle-exclamation" />
          <h3>Failed to load settings</h3>
          <p>{error}</p>
        </div>
      ) : (
        <GeneralSettingsForm
          initialSettings={initialSettings}
          updateAction={updateGeneralSettings}
        />
      )}
    </>
  );
}
