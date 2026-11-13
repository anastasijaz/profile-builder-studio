import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

type Props = {
  youPhoto?: string;
  themPhoto?: string;
  themName: string;
  matchId: string;
  onClose: () => void;
};

export function MatchMeltOverlay({ youPhoto, themPhoto, themName, matchId, onClose }: Props) {
  const navigate = useNavigate();

  // Auto-navigate to chat after the melt completes
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: "/chats/$matchId", params: { matchId } });
    }, 2800);
    return () => clearTimeout(t);
  }, [matchId, navigate]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const drops = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div
      role="dialog"
      aria-label={`It's a melt with ${themName}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-page/95 backdrop-blur-sm"
    >
      {/* warm radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, color-mix(in oklab, var(--melt-peach) 70%, transparent) 0%, transparent 70%)",
          animation: "melt-glow 2.4s ease-in-out infinite",
        }}
      />

      {/* falling drops */}
      <div className="pointer-events-none absolute inset-0">
        {drops.map((i) => {
          const left = 12 + i * 9; // spread across width
          const dxStart = (i % 2 === 0 ? -1 : 1) * (6 + (i % 3) * 4);
          const dxEnd = (i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 6);
          const delay = 0.7 + (i % 5) * 0.12;
          const duration = 1.6 + (i % 3) * 0.25;
          const size = 14 + (i % 4) * 6;
          return (
            <span
              key={i}
              className="absolute block bg-melt-orange shadow-[0_6px_14px_-4px_rgba(255,143,31,0.55)]"
              style={{
                left: `${left}%`,
                top: 0,
                width: size,
                height: size * 1.35,
                borderRadius: "50% 50% 45% 45% / 60% 60% 40% 40%",
                opacity: 0,
                ["--dx-start" as never]: `${dxStart}px`,
                ["--dx-end" as never]: `${dxEnd}px`,
                animation: `drop-fall ${duration}s ${delay}s cubic-bezier(0.45,0.05,0.55,0.95) forwards`,
              }}
            />
          );
        })}
      </div>

      {/* headline */}
      <div
        className="relative px-8 text-center"
        style={{ animation: "match-pop 0.55s 0.05s ease-out both" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-melt-orange">
          It&apos;s a
        </p>
        <h2 className="mt-1 font-serif text-6xl italic text-ink">melt</h2>
        <p className="mt-2 text-sm text-ink/70">
          You and {themName} are melting together
        </p>
      </div>

      {/* avatars melting */}
      <div className="relative mt-8 flex items-end justify-center gap-4">
        <Avatar
          src={youPhoto}
          delay={0.5}
          direction="right"
          ring="border-melt-orange"
        />
        <Avatar
          src={themPhoto}
          delay={0.55}
          direction="left"
          ring="border-melt-peach"
        />
      </div>

      {/* CTA */}
      <div
        className="relative mt-10 flex flex-col items-center gap-3 px-8"
        style={{ animation: "fade-up 0.5s 0.6s ease-out both" }}
      >
        <button
          onClick={() => navigate({ to: "/chats/$matchId", params: { matchId } })}
          className="flex h-12 items-center gap-2 rounded-full bg-melt-orange px-7 text-sm font-semibold text-surface shadow-[0_10px_24px_-6px_rgba(255,143,31,0.65)] active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          Say hi
        </button>
        <button
          onClick={onClose}
          className="h-10 rounded-full px-5 text-xs font-semibold text-ink/60 active:scale-95"
        >
          Keep swiping
        </button>
      </div>
    </div>
  );
}

function Avatar({
  src,
  delay,
  direction,
  ring,
}: {
  src?: string;
  delay: number;
  direction: "left" | "right";
  ring: string;
}) {
  return (
    <div className="relative" style={{ width: 128, height: 128 }}>
      {/* Avatar pops in, leans toward partner, then stretches and drops */}
      <div
        className={`absolute inset-0 overflow-hidden rounded-full border-4 ${ring} bg-surface shadow-[0_12px_28px_-8px_rgba(34,23,42,0.35)]`}
        style={{
          transformOrigin: "50% 0%",
          animation: `match-pop 0.5s ${delay}s ease-out both,
            ${direction === "right" ? "melt-lean-right" : "melt-lean-left"} 0.6s ${delay + 0.5}s ease-in-out forwards,
            melt-stretch 1.2s ${delay + 1.0}s cubic-bezier(0.6,0,0.7,1) forwards`,
        }}
      >
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
