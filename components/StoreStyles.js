/**
 * Server component — Next.js App Router hoists <link> tags from server
 * components into <head> automatically, so this cleanly scopes the storefront
 * CSS to only the pages that import this component.
 */
export default function StoreStyles() {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/style.css" />
      <link rel="stylesheet" href="/assets/css/sections.css" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        crossOrigin="anonymous"
      />
    </>
  );
}
