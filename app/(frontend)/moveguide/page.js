import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import * as FaIcons from "react-icons/fa6";

function GuideIcon({ iconName }) {
  const Icon = iconName && FaIcons[iconName] ? FaIcons[iconName] : FaIcons.FaPersonRunning;
  return <Icon />;
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Movement Hub – YUVO Fitness",
  description:
    "Free guided recovery routines using your YUVO recovery kit. Start a timed session now.",
};

// ── Dynamic: DB fetch streams in while static shell is already painted ────────
async function GuidesFeed() {
  const guides = await prisma.moveGuide.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' }
  });

  if (guides.length === 0) return <p>No routines available at the moment.</p>;

  return (
    <>
      {guides.map((guide) => {
        let totalTime = 0;
        try {
          const moves = guide.moves ? (typeof guide.moves === 'string' ? JSON.parse(guide.moves) : guide.moves) : [];
          if (Array.isArray(moves)) totalTime = moves.reduce((sum, move) => sum + (Number(move.stepTime) || 0), 0);
        } catch (e) {}

        let displayTime = "5 MIN";
        if (totalTime > 0) {
          const minutes = Math.floor(totalTime / 60);
          const seconds = totalTime % 60;
          displayTime = seconds === 0 ? `${minutes} MIN` : `${minutes}.${seconds.toString().padStart(2, '0')} MIN`;
        }

        return (
          <article className="mh-routine-card" key={guide.id}>
            <div className="mh-routine-image">
              {guide.imageUrl ? (
                <Image src={guide.imageUrl} alt={guide.title} fill unoptimized style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }} />
              )}
              <span className="mh-time-badge">{displayTime}</span>
            </div>
            <div className="mh-routine-body">
              <div className="mh-routine-title-row">
                <div className="mh-round-icon" aria-hidden="true"><GuideIcon iconName={guide.icon} /></div>
                <h3>{guide.title}</h3>
              </div>
              <p className="line-clamp-3 max-h-20">{guide.description}</p>
              <Link className="mh-routine-link" href={`/moveguide/${guide.slug}`}>
                View Routine <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>
          </article>
        );
      })}
    </>
  );
}

function GuidesFeedSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <article className="mh-routine-card" key={i} style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
          <div className="mh-routine-image" style={{ background: '#dde5f0' }} />
          <div className="mh-routine-body">
            <div style={{ width: '70%', height: '22px', background: '#dde5f0', borderRadius: 6, marginBottom: 12 }} />
            <div style={{ width: '100%', height: '14px', background: '#dde5f0', borderRadius: 6, marginBottom: 6 }} />
            <div style={{ width: '85%', height: '14px', background: '#dde5f0', borderRadius: 6, marginBottom: 6 }} />
            <div style={{ width: '65%', height: '14px', background: '#dde5f0', borderRadius: 6, marginBottom: 20 }} />
            <div style={{ width: '110px', height: '16px', background: '#dde5f0', borderRadius: 6 }} />
          </div>
        </article>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </>
  );
}

// ── Page shell (renders instantly) ───────────────────────────────────────────
export default function MovementHubPage() {

  return (
      <main className="page" id="page-movement">
        {/* HERO */}
        <section className="mh-hero" aria-label="Move Hub hero">
          <div className="mh-hero-inner">
            <div className="mh-hero-copy">
              <p className="mh-eyebrow">Move Hub</p>
              <h1>
                MOVE BETTER.<br />
                FEEL BETTER.<br />
                EVERY DAY.
              </h1>
              <p className="mh-hero-text">
                Simple, guided routines to help you recover, restore, and move with confidence.
                Wherever you are, whatever your day holds.
              </p>
            </div>
          </div>
        </section>

        {/* ROUTINES */}
        <section className="mh-section mh-routines" aria-label="Guided routines">
          <div className="mh-section-heading">
            <h2>Routines for Every Moment</h2>
            <p>Choose a guided routine that fits your day and your goals.</p>
            <div className="mh-line" aria-hidden="true"></div>
          </div>

          <div className="mh-routine-grid">
            <Suspense fallback={<GuidesFeedSkeleton />}>
              <GuidesFeed />
            </Suspense>
          </div>
        </section>

        {/* PILLARS */}
        <section className="mh-section mh-movement" aria-label="Better movement pillars">
          <div className="mh-section-heading">
            <h2>Built Around Better Movement</h2>
            <p>
              Movement isn&apos;t just about recovery. It&apos;s about building strength, improving mobility,
              increasing confidence, and creating habits that help you feel your best every day.
            </p>
          </div>

          <div className="mh-pillar-grid">
            <article className="mh-pillar">
              <div className="mh-pillar-icon" aria-hidden="true">
                <i className="fa-solid fa-person-running"></i>
              </div>
              <h3>Move Better</h3>
              <div className="mh-tag">Move with confidence every day.</div>
              <p>Improve mobility, balance, and body awareness for smoother, more efficient movement.</p>
            </article>
            <article className="mh-pillar">
              <div className="mh-pillar-icon" aria-hidden="true">
                <i className="fa-solid fa-dumbbell"></i>
              </div>
              <h3>Build Strength</h3>
              <div className="mh-tag">Strength for everyday life.</div>
              <p>Develop stability and functional strength with simple, effective movement tools.</p>
            </article>
            <article className="mh-pillar">
              <div className="mh-pillar-icon" aria-hidden="true">
                <i className="fa-solid fa-arrows-rotate"></i>
              </div>
              <h3>Recover Smarter</h3>
              <div className="mh-tag">Stay ready for what&apos;s next.</div>
              <p>Reduce muscle tension, improve circulation, and recover faster after activity.</p>
            </article>
            <article className="mh-pillar">
              <div className="mh-pillar-icon" aria-hidden="true">
                <i className="fa-regular fa-calendar-check"></i>
              </div>
              <h3>Stay Consistent</h3>
              <div className="mh-tag">Small habits. Big results.</div>
              <p>Simple routines that fit real schedules and help you keep moving.</p>
            </article>
          </div>
        </section>

        {/* PRODUCT FEATURE */}
        <section className="mh-section mh-product-feature" aria-label="6-in-1 Foam Roller Set">
          <div className="mh-product-copy">
            <p className="mh-product-kicker">The 6-in-1 Foam Roller Set</p>
            <h2>Your Daily All-In-One Recovery System</h2>
            <div className="mh-rating" aria-label="4.7 star rating">
              <span className="mh-stars" aria-hidden="true">★★★★★</span>
              <span>4.7</span>
            </div>
            <p>
              A complete recovery and mobility kit to help you roll, stretch, activate, and recover —
              anytime, anywhere.
            </p>
            <div className="mh-cta-row">
              <a className="mh-btn mh-amazon" href="https://www.amazon.com/" target="_blank" rel="noopener noreferrer">
                <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i> Buy on Amazon
              </a>
              <Link className="mh-btn mh-secondary" href="/products/foam-roller-set">
                <i className="fa-solid fa-box-open" aria-hidden="true"></i> See What&apos;s Included
              </Link>
            </div>
          </div>
          <div className="mh-product-image">
            <Image src="/assets/img/product-kit.jpg" alt="YUVO 6-in-1 Foam Roller Set" fill style={{ objectFit: "cover" }} />
          </div>
        </section>
      </main>
  );
}

