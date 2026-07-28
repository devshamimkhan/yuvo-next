export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import {
  getProductAction,
  updateProductAction,
} from "../../actions";

export const metadata = {
  title: "Edit Product | YUVO",
};

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = await getProductAction(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1>
            Edit Product <span className="sub">Product #{product.id}</span>
          </h1>
        </div>
      </header>

      <ProductForm action={updateProductAction} product={product} />
    </>
  );
}
