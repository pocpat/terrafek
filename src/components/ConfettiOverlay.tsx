import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiOverlayProps {
  /** Key that changes to trigger a new confetti burst */
  trigger: number;
  /** Optional message to display in the center */
  message?: string;
  /** Intensity: small for task, big for lab completion */
  intensity?: "task" | "lab";
}

/**
 * Full-screen confetti overlay. Renders on top of ALL panels (z-[9999]).
 * Fires when the `trigger` prop changes to a new non-zero value.
 * Covers ~2/3 of the screen with a celebratory burst + optional message.
 */
export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
  trigger,
  message,
  intensity = "task",
}) => {
  const prevTrigger = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 0 || trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;

    // Big multi-burst confetti covering 2/3 of screen
    const isLab = intensity === "lab";
    const particleCount = isLab ? 200 : 120;
    const spread = isLab ? 120 : 90;
    const startVelocity = isLab ? 45 : 35;

    // First burst — center wide
    confetti({
      particleCount,
      spread,
      origin: { y: 0.5 },
      startVelocity,
      scalar: 1.2,
      ticks: 200,
      colors: ["#fbbf24", "#f59e0b", "#6366f1", "#3b82f6", "#10b981", "#ef4444", "#ec4899"],
    });

    // Second burst — from left side, slight delay
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount * 0.6),
        spread: 70,
        origin: { x: 0.1, y: 0.6 },
        angle: 60,
        startVelocity,
        scalar: 1.1,
        colors: ["#fbbf24", "#f59e0b", "#6366f1", "#10b981"],
      });
    }, 150);

    // Third burst — from right side
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount * 0.6),
        spread: 70,
        origin: { x: 0.9, y: 0.6 },
        angle: 120,
        startVelocity,
        scalar: 1.1,
        colors: ["#3b82f6", "#ec4899", "#ef4444", "#10b981"],
      });
    }, 300);

    // Fourth burst — top center for a "rain" effect
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount * 0.4),
        spread: 360,
        origin: { x: 0.5, y: 0 },
        startVelocity,
        scalar: 1.0,
        gravity: 0.8,
        ticks: 300,
        colors: ["#fbbf24", "#6366f1", "#3b82f6", "#10b981", "#ec4899"],
      });
    }, 450);

    // Remove the overlay text after 3.5 seconds
    if (overlayRef.current) {
      overlayRef.current.style.opacity = "1";
      const timer = setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.style.opacity = "0";
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [trigger, intensity]);

  if (trigger === 0) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none transition-opacity duration-1000"
      style={{ opacity: 1 }}
    >
      {/* Semi-transparent backdrop covering 2/3 of screen — centered */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "66vw",
          height: "66vh",
          maxWidth: "900px",
          maxHeight: "700px",
        }}
      >
        {/* Celebration Message Card */}
        {message && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-amber-300 px-10 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="text-5xl mb-3">🎉</div>
              <div className="font-serif text-2xl font-bold text-stone-900 mb-1">
                {message}
              </div>
              <div className="text-sm text-stone-500 font-sans mt-2">
                {intensity === "lab" ? "Lab Complete!" : "Task Passed!"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};