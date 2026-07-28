import TopProgressBar from "@/components/TopProgressBar";

/**
 * Fires for any route inside app/(store)/ while the page data is loading.
 * The (store)/layout.js (StoreHeader, StoreFooter, StoreStyles) remains
 * mounted — only this slot is replaced, so there is zero layout shift.
 */
export default function StoreLoading() {
  return (
    <>
      <TopProgressBar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "3px solid #e5e7eb",
            borderTop: "3px solid #0e4fa8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
