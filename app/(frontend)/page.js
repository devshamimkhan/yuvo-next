import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import * as FaIcons from "react-icons/fa6";

function GuideIcon({ iconName }) {
  const Icon = iconName && FaIcons[iconName] ? FaIcons[iconName] : FaIcons.FaPersonRunning;
  return <Icon />;
}

export const metadata = {
  title: "YUVO Fitness – Move Freely. Live Fully.",
  description:
    "Essential movement gear for everyday athletes. Foam rollers, resistance bands, massage tools — all on Amazon Prime.",
};

// ── Dynamic section: fetches from DB, streams in via Suspense ────────────────
async function GuidesFeed() {
  const guides = await prisma.moveGuide.findMany({
    where: { status: "active", featured: true },
    orderBy: { id: "desc" },
    take: 3,
  });

  if (guides.length === 0) return null;

  return (
    <div className="guide-grid" aria-label="Featured Move Hub routines">
      {guides.map((guide) => (
        <Link href={`/moveguide/${guide.slug}`} key={guide.id} style={{ textDecoration: 'none', color: 'inherit' }}>
          <article className="guide-card">
            <div className="image-wrap">
              <Image
                src={guide.imageUrl || "/assets/img/daily_mobility_routine.jpg"}
                alt={guide.title}
                width={480}
                height={320}
                unoptimized
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="guide-icon" aria-hidden="true">
              <GuideIcon iconName={guide.icon} />
            </div>
            <div className="card-body">
              <h3>{guide.title}</h3>
              <p className="line-clamp-3 max-h-10 !mb-2.5">{guide.description}</p>
              <span className="time-pill">
                <i className="fa-regular fa-clock" aria-hidden="true"></i> 5 Minutes
              </span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

// ── Skeleton shown while GuidesFeed loads ────────────────────────────────────
function GuidesFeedSkeleton() {
  return (
    <div className="guide-grid" aria-label="Loading routines" aria-busy="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className="guide-card" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
          <div className="image-wrap" style={{ background: '#dde5f0' }} />
          <div className="card-body">
            <div style={{ width: '70%', height: '20px', background: '#dde5f0', borderRadius: 6, marginBottom: 10 }} />
            <div style={{ width: '100%', height: '14px', background: '#dde5f0', borderRadius: 6, marginBottom: 6 }} />
            <div style={{ width: '80%', height: '14px', background: '#dde5f0', borderRadius: 6, marginBottom: 16 }} />
            <div style={{ width: '90px', height: '28px', background: '#dde5f0', borderRadius: 99 }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

// ── Page (static shell renders instantly) ────────────────────────────────────
export default async function HomePage() {
  return (
      <main className="page" id="page-home">
        {/* ===== HERO SECTION ===== */}
        <section className="hero" aria-label="YUVO homepage hero section">
          <div className="hero-bg" aria-hidden="true">
            <Image
              src="/assets/img/hero_area.png"
              alt=""
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          <div className="hero-content-wrap">
            <div className="glass-card">
              <p className="eyebrow">THE 6-IN-1 FOAM ROLLER SET</p>

              <h1>
                Your Daily
                <br />
                All-In-One
                <br />
                Recovery System
              </h1>

              <div className="rating" aria-label="4.7 star rating">
                <span className="stars" aria-hidden="true">
                  ★★★★★
                </span>
                <span>4.7</span>
              </div>

              <p className="description">
                A complete recovery and mobility kit to help you roll, stretch,
                activate, and recover — anytime, anywhere.
              </p>

              <div className="cta-stack">
                <a
                  className="button primary"
                  href="https://www.amazon.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="button-left">
                    <span className="icon" aria-hidden="true">
                      <i className="fa-solid fa-cart-shopping"></i>
                    </span>
                    Buy on Amazon
                  </span>

                  <span className="amazon-brand" aria-hidden="true">
                    <span className="amazon-wordmark">amazon</span>
                    <svg
                      className="amazon-smile"
                      viewBox="0 0 120 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 5c25 18 68 18 103 0"
                        stroke="#FFB000"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M95 4l17 1-6 14"
                        stroke="#FFB000"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <span className="arrow" aria-hidden="true">
                    <i className="fa-solid fa-chevron-right"></i>
                  </span>
                </a>

                <div className="secondary-row">
                  <Link className="button secondary" href="/products">
                    <span className="button-left">
                      <span className="icon" aria-hidden="true">
                        <i className="fa-solid fa-box-open"></i>
                      </span>
                      See What&apos;s Included
                    </span>
                    <span className="arrow" aria-hidden="true">
                      <i className="fa-solid fa-chevron-right"></i>
                    </span>
                  </Link>

                  <Link className="button secondary" href="/moveguide">
                    <span className="button-left">
                      <span className="icon" aria-hidden="true">
                        <i className="fa-solid fa-play"></i>
                      </span>
                      Discover The Move Hub
                    </span>
                    <span className="arrow" aria-hidden="true">
                      <i className="fa-solid fa-chevron-right"></i>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="proof-row" aria-label="Product benefits">
                <div className="proof">
                  <div className="proof-icon" aria-hidden="true">
                    <i className="fa-solid fa-leaf"></i>
                  </div>
                  <h3>Simple Design</h3>
                  <p>
                    Everything you need.
                    <br />
                    Nothing you don&apos;t.
                  </p>
                </div>

                <div className="proof">
                  <div className="proof-icon" aria-hidden="true">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h3>Built to Last</h3>
                  <p>
                    Premium materials
                    <br />
                    for daily movement.
                  </p>
                </div>

                <div className="proof">
                  <div className="proof-icon" aria-hidden="true">
                    <i className="fa-solid fa-person-running"></i>
                  </div>
                  <h3>Move Your Way</h3>
                  <p>
                    Designed for every body
                    <br />
                    and every routine.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MOVE HUB SECTION ===== */}
        <section className="move-hub-section" id="move-hub">
          <div className="move-hub-inner">
            <div className="section-header">
              <p className="eyebrow">THE MOVE HUB</p>
              <h2>Simple Routines. Better Movement.</h2>
              <p className="intro">
                Guided routines to help you move better in just a few minutes.
              </p>
            </div>

            <Suspense fallback={<GuidesFeedSkeleton />}>
              <GuidesFeed />
            </Suspense>

            <div className="cta-wrap">
              <Link className="button move-hub-cta" href="/moveguide">
                Discover the Move Hub{" "}
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </Link>
            </div>

            <p className="disclaimer">
              <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
              <span>
                These routines are for general informational purposes only and
                are not medical advice.
                <br />
                If you have pain, injury, or health concerns, consult a
                qualified professional.
              </span>
            </p>
          </div>
        </section>

        {/* ===== WHY YUVO SECTION ===== */}
        <section className="why-yuvo" id="why-yuvo">
          <div className="panel">
            <div className="copy">
              <p className="eyebrow">
                WHY YUVO<sup>TM</sup>
              </p>
              <h2>
                <span className="blue">Move Freely.</span>
                <br />
                <span className="red">Live Fully.</span>
              </h2>
              <p className="subtitle">
                Essential movement gear for active lifestyles. Designed to help
                you stay consistent, move with intention, and feel your best.
              </p>
              <Link href="/about" className="button">
                Our Story{" "}
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>
            <div className="feature-grid" aria-label="Why YUVO features">
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">
                  <i className="fa-solid fa-leaf"></i>
                </div>
                <h3>Simplicity</h3>
                <p>Straightforward tools that works without complication</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">
                  <i className="fa-solid fa-calendar-check"></i>
                </div>
                <h3>Consistency</h3>
                <p>Gear that supports daily habits, not just trends</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h3>Quality You Can Feel</h3>
                <p>High-quality materials built to perform and last</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">
                  <i className="fa-solid fa-user"></i>
                </div>
                <h3>For Real Life</h3>
                <p>Designed for people with real routines</p>
              </article>
            </div>
          </div>
        </section>

        {/* ===== JOIN THE MOVEMENT / SIGNUP SECTION ===== */}
        <div className="signup-section-wrapper">
          <section
            className="signup-section"
            id="join-the-movement"
            aria-label="Be the first to know email signup"
          >
            <div className="signup-content">
              <h2>Be the First to Know</h2>

              <p className="copy">
                Get the 5-Minute Daily Reset guide + launch updates, exclusive
                offers, and movement tips.
              </p>

              <form className="form-row" action="#" method="post">
                <label className="email-field">
                  <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                  <span className="sr-only">Email address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                  />
                </label>

                <button className="join-button" type="submit">
                  Join the Movement
                  <i
                    className="fa-solid fa-chevron-right"
                    aria-hidden="true"
                  ></i>
                </button>
              </form>

              <p className="privacy">
                <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </section>
        </div>
      </main>
  );
}

