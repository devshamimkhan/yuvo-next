"use client";

import { useEffect, useRef } from "react";
import { MdOutlineWatchLater } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { useMoveGuideStore } from "@/store/moveGuideStore";

export default function MoveGuideClient({ guide }) {
  // ── Helpers ──────────────────────────────────────────────────────────────
  const parseJson = (val) => {
    if (!val) return [];
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch (e) { return []; }
    }
    return Array.isArray(val) ? val : [];
  };

  const moves = parseJson(guide?.moves);
  const tools = parseJson(guide?.tools);
  const contentSections = parseJson(guide?.contentSections);

  // Dynamic Content Section
  const mainSection = contentSections?.[0];
  const sectionTitle = mainSection?.title || "Why This Routine Works";
  const sectionDesc = mainSection?.description || guide?.description || "This quick routine is designed to help you move better, feel better, and set the tone for your day.";
  const sectionItems = mainSection?.items?.length > 0 ? mainSection.items : [
    { title: "Reduce Stiffness", description: "Loosen tight muscles and improve flexibility.", icon: "fa-solid fa-person-running" },
    { title: "Increase Circulation", description: "Promote blood flow and speed up recovery.", icon: "fa-solid fa-droplet" },
    { title: "Activate & Prepare", description: "Engage key muscle groups for the day ahead.", icon: "fa-solid fa-bullseye" },
    { title: "Boost Focus", description: "Move with intention and feel more alert.", icon: "fa-solid fa-person-praying" },
    { title: "Build Consistency", description: "Small daily habits lead to big results.", icon: "fa-solid fa-calendar-check" },
  ];

  // Fallback step if moves are empty
  const defaultStep = {
    title: guide?.title || "Move Guide",
    time: 20,
    toolName: "",
    toolImg: "/assets/img/routine/foam-roller.jpg",
  };

  const steps = moves.length > 0 ? moves.map((m) => {
    const matchedTool = tools.find((t) => t.name === m.tool);
    return {
      title: m.name || "Move",
      time: parseInt(m.stepTime, 10) || 20,
      toolName: m.tool || "",
      toolImg: matchedTool?.image || "/assets/img/routine/foam-roller.jpg",
    };
  }) : [defaultStep];

  // ── Zustand selectors (fine-grained to minimise re-renders) ──────────────
  const currentStepIndex = useMoveGuideStore((s) => s.currentStepIndex);
  const timeLeft        = useMoveGuideStore((s) => s.timeLeft);
  const isRunning       = useMoveGuideStore((s) => s.isRunning);
  const isDone          = useMoveGuideStore((s) => s.isDone);
  const completedSteps  = useMoveGuideStore((s) => s.completedSteps);
  const skippedSteps    = useMoveGuideStore((s) => s.skippedSteps);

  // ── Zustand actions ───────────────────────────────────────────────────────
  const initSession      = useMoveGuideStore((s) => s.initSession);
  const startWorkout     = useMoveGuideStore((s) => s.startWorkout);
  const pauseWorkout     = useMoveGuideStore((s) => s.pauseWorkout);
  const nextMovement     = useMoveGuideStore((s) => s.nextMovement);
  const previousMovement = useMoveGuideStore((s) => s.previousMovement);
  const skipMovement     = useMoveGuideStore((s) => s.skipMovement);
  const restartWorkout   = useMoveGuideStore((s) => s.restartWorkout);
  const updateTimer      = useMoveGuideStore((s) => s.updateTimer);

  // ── Session init — restore or start fresh ─────────────────────────────────
  useEffect(() => {
    initSession(guide, steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.id, guide?.slug]);

  // ── Timer interval management ─────────────────────────────────────────────
  // The interval itself is never persisted. We recreate it when isRunning is
  // true, and clean it up on pause / completion / unmount.
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && !isDone) {
      // Prevent duplicate intervals
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const stepEnded = updateTimer();
        if (stepEnded) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Advance to next movement (or complete if last)
          nextMovement(steps);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, isDone]);

  // ── Derived values ────────────────────────────────────────────────────────
  const currentStep = steps[currentStepIndex] ?? steps[0];
  const stepDuration = currentStep?.time ?? 1;
  const percent = Math.min(100, Math.round(((stepDuration - timeLeft) / stepDuration) * 100));

  const mainImageUrl = guide?.imageUrl || "/assets/img/routine/foam-roll-upper-back.jpg";

  // ── Format helpers ────────────────────────────────────────────────────────
  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function formatTotalTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}.${s.toString().padStart(2, "0")} min`;
  }

  return (
    <main className="page routine-page-inner" id="page-moveguide-v2">
      <div className="rpg-top-link">
        <Link href="/moveguide">← Back to Hub</Link>
        <span className="rpg-top-divider"></span>
        <span>{guide?.title}</span>
      </div>

      <div className="rpg-grid">
        {/* ──── LEFT CARD ──── */}
        <article className="rpg-card rpg-move">
          <div className="rpg-move-num">Move {currentStepIndex + 1} of {steps.length}</div>
          <h1>
            {currentStep.title.split(" — ")[0]}
            {currentStep.title.includes(" — ") && (
              <>
                <br />— {currentStep.title.split(" — ")[1]}
              </>
            )}
          </h1>
          <div className="rpg-rule"></div>
          <div className="rpg-exercise" style={{ position: "relative" }}>
            <Image
              src={mainImageUrl}
              alt={guide?.title || "Exercise"}
              fill
              unoptimized
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div className="rpg-timing">
            <span style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <MdOutlineWatchLater className="text-xl" style={{ flexShrink: 0, marginTop: "5px" }} />
              <span>{guide?.instructionText}</span>
            </span>
            <span>TOTAL TIME: {formatTotalTime(steps.reduce((acc, step) => acc + step.time, 0))}</span>
          </div>
          <p className="rpg-instruction">{guide?.description || "Follow the instructions for this move guide."}</p>
          <div className="rpg-disclaimer">
            <div className="rpg-info-icon">i</div>
            <div>
              {guide?.disclaimerText || "This guide is for information purposes only and is not medical advice. If you have pain, injury, or concerns, consult a medical professional."}
            </div>
          </div>
        </article>

        {/* ──── RIGHT CARD ──── */}
        <article className="rpg-card rpg-right">
          {/* Timer */}
          <div className="rpg-timer-area">
            <span className="rpg-label">Timer</span>
            <div className="rpg-timer">{formatTime(timeLeft)}</div>
            <div className="rpg-timer-copy">Focus on form and breathing</div>
            <div className="rpg-progress">
              <span style={{ width: `${percent}%` }}></span>
            </div>
            <div className="rpg-controls">
              <button
                id="btn-start-resume"
                className="rpg-start"
                onClick={startWorkout}
                disabled={isDone}
              >
                {isDone ? (
                  <><i className="fa-solid fa-check"></i> Done</>
                ) : isRunning ? (
                  <><i className="fa-solid fa-play"></i> Resume</>
                ) : (
                  <><i className="fa-solid fa-play"></i> Start</>
                )}
              </button>
              <button
                id="btn-pause"
                className="rpg-pause"
                onClick={pauseWorkout}
                disabled={!isRunning}
              >
                <i className="fa-solid fa-pause"></i> Pause
              </button>
              <button
                id="btn-skip"
                className="rpg-skip"
                onClick={() => skipMovement(steps)}
                disabled={isDone}
              >
                <i className="fa-solid fa-forward-step"></i> Skip
              </button>
              <button
                id="btn-restart"
                className="rpg-restart"
                onClick={() => restartWorkout(steps)}
              >
                <i className="fa-solid fa-rotate-left"></i> Restart
              </button>
            </div>
          </div>

          {/* Tools Used */}
          {tools.length > 0 && (
            <div className="rpg-tools">
              <span className="rpg-label">Tools Used</span>
              <div className="rpg-tools-grid">
                {tools.map((tool, idx) => (
                  <div className="rpg-tool" key={idx}>
                    <div className="rpg-tool-img" style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 8px", borderRadius: "8px", overflow: "hidden" }}>
                      <Image
                        src={tool.image || "/assets/img/routine/foam-roller.jpg"}
                        alt={tool.name}
                        fill
                        unoptimized
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    {tool.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routine Steps */}
          <div className="rpg-steps">
            <span className="rpg-label">Routine Steps</span>
            {steps.map((step, index) => {
              const isActive    = index === currentStepIndex;
              const isCompleted = completedSteps.includes(index);
              const isSkipped   = skippedSteps.includes(index);

              let statusClass = "";
              if (isActive) statusClass = " active";
              else if (isCompleted || isSkipped) statusClass = " completed";

              return (
                <div key={index} className={`rpg-step${statusClass}`}>
                  <div className="rpg-step-num">
                    {isCompleted ? <i className="fa-solid fa-check" style={{ fontSize: "12px" }}></i>
                      : isSkipped ? <i className="fa-solid fa-forward" style={{ fontSize: "12px" }}></i>
                      : index + 1}
                  </div>
                  <div className="rpg-step-title">{step.title}</div>
                  <div className="rpg-step-tool">
                    {step.toolImg && (
                      <div style={{ position: "relative", width: "36px", height: "24px" }}>
                        <Image
                          src={step.toolImg}
                          alt=""
                          fill
                          unoptimized
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    )}
                    {step.toolName}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      {/* ──── WHY THIS ROUTINE WORKS ──── */}
      <section className="rpg-card rpg-why">
        <h2>{sectionTitle}</h2>
        <p>{sectionDesc}</p>
        <div className="rpg-benefits" style={{ gridTemplateColumns: `repeat(${sectionItems.length}, 1fr)` }}>
          {sectionItems.map((item, idx) => {
            let iconClass = item.icon || "fa-solid fa-check";
            if (iconClass.startsWith("Fa") && !iconClass.includes(" ")) {
              const kebabName = iconClass
                .substring(2)
                .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
                .toLowerCase();
              iconClass = `fa-solid fa-${kebabName}`;
            }
            return (
              <div className="rpg-benefit" key={idx}>
                <div className="rpg-benefit-icon"><i className={iconClass}></i></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
