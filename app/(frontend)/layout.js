import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import StoreStyles from "@/components/StoreStyles";

export default function StoreLayout({ children }) {
  return (
    <div className="yuvo-store-shell">
      <StoreStyles />
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}
