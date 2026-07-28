import TopProgressBar from "@/components/TopProgressBar";

/**
 * Root-level loading fallback — only fires for routes outside (store),
 * such as /admin and /user. Storefront routes use (store)/loading.js instead.
 */
export default function GlobalLoading() {
  return (
    <>
      <TopProgressBar />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
