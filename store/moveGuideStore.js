import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Storage key ────────────────────────────────────────────────────────────
const STORAGE_KEY = "yuvo-move-guide-session";

// ─── Initial / empty session shape ──────────────────────────────────────────
const emptySession = {
  moveGuideId: null,
  currentStepIndex: 0,
  timeLeft: 0,
  isRunning: false,
  isDone: false,
  completedSteps: [],
  skippedSteps: [],
  totalElapsed: 0,
  progressPercent: 0,
  lastUpdatedAt: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useMoveGuideStore = create(
  persist(
    (set, get) => ({
      ...emptySession,

      // ── initSession ────────────────────────────────────────────────────────
      // Called on component mount. Accepts the guide object + the derived steps
      // array. If the persisted session belongs to a different guide, resets
      // cleanly. If it matches, the persisted state is already in the store
      // (loaded by the middleware) so we only need to refresh timeLeft if needed.
      initSession: (guide, steps) => {
        const state = get();
        const guideId = String(guide?.id ?? guide?.slug ?? "");

        // Different guide — start fresh
        if (state.moveGuideId && state.moveGuideId !== guideId) {
          set({
            ...emptySession,
            moveGuideId: guideId,
            timeLeft: steps[0]?.time ?? 0,
            lastUpdatedAt: Date.now(),
          });
          return;
        }

        // No existing session — initialise
        if (!state.moveGuideId) {
          set({
            ...emptySession,
            moveGuideId: guideId,
            timeLeft: steps[0]?.time ?? 0,
            lastUpdatedAt: Date.now(),
          });
          return;
        }

        // Matching session — guard against stale / corrupted index
        const safeIndex = Math.min(
          state.currentStepIndex,
          steps.length - 1
        );
        if (safeIndex !== state.currentStepIndex) {
          set({ currentStepIndex: safeIndex, timeLeft: steps[safeIndex]?.time ?? 0 });
        }
      },

      // ── startWorkout ───────────────────────────────────────────────────────
      startWorkout: () => {
        if (get().isDone) return;
        set({ isRunning: true, lastUpdatedAt: Date.now() });
      },

      // ── pauseWorkout ───────────────────────────────────────────────────────
      pauseWorkout: () => {
        set({ isRunning: false, lastUpdatedAt: Date.now() });
      },

      // ── resumeWorkout ──────────────────────────────────────────────────────
      resumeWorkout: () => {
        if (get().isDone) return;
        set({ isRunning: true, lastUpdatedAt: Date.now() });
      },

      // ── nextMovement ───────────────────────────────────────────────────────
      nextMovement: (steps) => {
        const { currentStepIndex, completedSteps } = get();
        const nextIndex = currentStepIndex + 1;

        if (nextIndex >= steps.length) {
          // Last step just finished → complete workout
          get().completeWorkout();
          return;
        }

        const updatedCompleted = completedSteps.includes(currentStepIndex)
          ? completedSteps
          : [...completedSteps, currentStepIndex];

        const totalSteps = steps.length;
        const progressPercent = Math.round((updatedCompleted.length / totalSteps) * 100);

        set({
          currentStepIndex: nextIndex,
          timeLeft: steps[nextIndex].time,
          completedSteps: updatedCompleted,
          progressPercent,
          lastUpdatedAt: Date.now(),
        });
      },

      // ── previousMovement ───────────────────────────────────────────────────
      previousMovement: (steps) => {
        const { currentStepIndex, completedSteps } = get();
        if (currentStepIndex === 0) return;

        const prevIndex = currentStepIndex - 1;

        // Remove prevIndex from completed if it was marked done
        const updatedCompleted = completedSteps.filter((i) => i !== prevIndex);
        const totalSteps = steps.length;
        const progressPercent = Math.round((updatedCompleted.length / totalSteps) * 100);

        set({
          currentStepIndex: prevIndex,
          timeLeft: steps[prevIndex].time,
          isRunning: false,
          completedSteps: updatedCompleted,
          progressPercent,
          lastUpdatedAt: Date.now(),
        });
      },

      // ── skipMovement ───────────────────────────────────────────────────────
      skipMovement: (steps) => {
        const { currentStepIndex, skippedSteps } = get();
        if (get().isDone) return;

        const updatedSkipped = skippedSteps.includes(currentStepIndex)
          ? skippedSteps
          : [...skippedSteps, currentStepIndex];

        const nextIndex = currentStepIndex + 1;

        if (nextIndex >= steps.length) {
          get().completeWorkout();
          return;
        }

        set({
          currentStepIndex: nextIndex,
          timeLeft: steps[nextIndex].time,
          skippedSteps: updatedSkipped,
          lastUpdatedAt: Date.now(),
        });
      },

      // ── completeWorkout ────────────────────────────────────────────────────
      completeWorkout: () => {
        set({ isRunning: false, isDone: true, lastUpdatedAt: Date.now() });
        // Auto-clear persisted session so a fresh visit starts clean
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
      },

      // ── restartWorkout ─────────────────────────────────────────────────────
      restartWorkout: (steps) => {
        const { moveGuideId } = get();
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        set({
          ...emptySession,
          moveGuideId,
          timeLeft: steps[0]?.time ?? 0,
          lastUpdatedAt: Date.now(),
        });
      },

      // ── resetWorkout ───────────────────────────────────────────────────────
      resetWorkout: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        set({ ...emptySession });
      },

      // ── updateTimer ────────────────────────────────────────────────────────
      // Called every second by the interval in the component.
      // Returns whether the step just ended (so the component can trigger nextMovement).
      updateTimer: () => {
        const { timeLeft, isDone } = get();
        if (isDone || timeLeft <= 0) return true; // step ended

        set((state) => ({
          timeLeft: state.timeLeft - 1,
          totalElapsed: state.totalElapsed + 1,
          lastUpdatedAt: Date.now(),
        }));

        return get().timeLeft <= 0; // true if we just hit 0
      },

      // ── clearSession ───────────────────────────────────────────────────────
      clearSession: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        set({ ...emptySession });
      },
    }),

    // ── Persist config ────────────────────────────────────────────────────────
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist the minimal session fields — omit actions
      partialize: (state) => ({
        moveGuideId: state.moveGuideId,
        currentStepIndex: state.currentStepIndex,
        timeLeft: state.timeLeft,
        isRunning: state.isRunning,
        isDone: state.isDone,
        completedSteps: state.completedSteps,
        skippedSteps: state.skippedSteps,
        totalElapsed: state.totalElapsed,
        progressPercent: state.progressPercent,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
);
