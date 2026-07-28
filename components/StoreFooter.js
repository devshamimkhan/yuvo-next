import Link from "next/link";
import Image from "next/image";
import { getPublicFooterSettings } from "@/app/admin/settings/footer/actions";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";

export default async function StoreFooter() {
  let settings = {};
  try {
    settings = await getPublicFooterSettings();
  } catch {
    // Fall back to defaults if DB is unavailable
  }

  const currentYear = new Date().getFullYear();

  const companyLogo = settings?.company_logo || "/assets/img/logo.png";
  const companyName = settings?.company_name || "YUVO";
  const companyTagline = settings?.company_tagline || "Move Freely. Live Fully.";
  const exploreMenu = Array.isArray(settings?.explore_menu) ? settings.explore_menu : [];
  const supportMenu = Array.isArray(settings?.support_menu) ? settings.support_menu : [];
  const socialLinks = Array.isArray(settings?.social_links) ? settings.social_links : [];

  const showNewsletter = settings?.layout_show_newsletter !== false;
  const showExplore = settings?.layout_show_explore !== false;
  const showSupport = settings?.layout_show_support !== false;
  const showSocial = settings?.layout_show_social !== false;
  const showPrivacy = settings?.layout_show_privacy !== false;
  const showCopyright = settings?.layout_show_copyright !== false;

  const newsletterTitle = settings?.newsletter_title || "Join The Movement";
  const newsletterDescription = settings?.newsletter_description || "Get the latest on new products, exclusive offers, and movement tips.";
  const newsletterPlaceholder = settings?.newsletter_placeholder || "Enter your email";
  const newsletterButtonText = settings?.newsletter_button_text || "Join the Movement";

  const privacyText = settings?.privacy_text || "We respect your privacy. Unsubscribe anytime.";
  const privacyButtonText = settings?.privacy_button_text || "Privacy Policy";
  const privacyUrl = settings?.privacy_url || "#";

  let copyrightText = settings?.copyright_text || "© {year} YUVO. All rights reserved.";
  copyrightText = copyrightText.replace(/\{year\}/g, currentYear);

  return (
    <div className="footer-wrapper">
      <footer className="footer">
        <div className="grid">
          {/* Brand */}
          <div className="brand">
            <Link href="/" className="footer-logo">
              {companyLogo && companyLogo.startsWith("http") ? (
                <Image src={companyLogo} alt={companyName} width={116} height={40} unoptimized priority={false} />
              ) : companyLogo ? (
                <Image src={companyLogo} alt={companyName} width={116} height={40} priority={false} />
              ) : (
                <Image src="/assets/img/logo.png" alt={companyName} width={116} height={40} priority={false} />
              )}
            </Link>
            {companyTagline && <p className="tag">{companyTagline}</p>}
          </div>

          {/* Explore Menu */}
          {showExplore && exploreMenu.length > 0 && (
            <div className="col">
              <h4>EXPLORE</h4>
              {exploreMenu.filter((item) => item.active !== false).map((item, i) => (
                <Link key={i} href={item.url || "#"}>{item.title}</Link>
              ))}
            </div>
          )}

          {/* Support Menu */}
          {showSupport && supportMenu.length > 0 && (
            <div className="col">
              <h4>SUPPORT</h4>
              {supportMenu.filter((item) => item.active !== false).map((item, i) => (
                <Link key={i} href={item.url || "#"}>{item.title}</Link>
              ))}
            </div>
          )}

          {/* Newsletter */}
          {showNewsletter && (
            <div className="col join">
              <h4>{newsletterTitle.toUpperCase()}</h4>
              {newsletterDescription && <p className="join-copy">{newsletterDescription}</p>}
              <NewsletterSubscribeForm
                placeholder={newsletterPlaceholder}
                buttonText={newsletterButtonText}
              />
              {showPrivacy && (
                <>
                  {privacyText && <p className="small">{privacyText}</p>}
                  {privacyButtonText && <Link href={privacyUrl} className="privacy-link">{privacyButtonText}</Link>}
                </>
              )}
            </div>
          )}

          {/* Social Links */}
          {showSocial && socialLinks.length > 0 && (
            <div className="col" style={{ gridColumn: "1 / -1", borderLeft: "none", padding: "8px 0" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {socialLinks.filter((item) => item.active !== false).map((item, i) => (
                  <a
                    key={i}
                    href={item.url || "#"}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    className="social-footer-link"
                  >
                    {item.icon && <i className={`fab fa-${item.icon.toLowerCase().replace("fab fa-", "").replace("fa-", "")}`}></i>}
                    {item.platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        {showCopyright && copyrightText && (
          <div className="bottom">{copyrightText}</div>
        )}
      </footer>
    </div>
  );
}
