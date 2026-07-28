export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";
import AdminTopbarRight from "@/components/AdminTopbarRight";
import { createProductAction } from "../actions";

export const metadata = {
  title: "Create Product | YUVO",
};

export default async function CreateProductPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            <span className="sub">Create a new product for your catalog</span>
          </h1>
        </div>
        <div className="topbar-right">
          <AdminTopbarRight userName={userName} />
        </div>
      </header>

      <ProductForm action={createProductAction} />
    </>
  );
}

