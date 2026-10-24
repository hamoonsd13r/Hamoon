// V02 · line icons drawn on over the kinetic-type pages (one per page), so no page is text alone.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";

type P = { d: string[]; extra?: React.ReactNode };
// 200×200 viewBox, stroke only
export const ICONS: Record<string, P> = {
  dumbbell: { d: ["M30 100 H170", "M44 70 V130", "M60 58 V142", "M156 70 V130", "M140 58 V142", "M18 88 V112", "M182 88 V112"] },
  floors: { d: ["M40 175 V40 H160 V175", "M40 107 H160", "M70 175 V140 H95 V175", "M70 65 H95 V88 H70 Z", "M110 65 H135 V88 H110 Z", "M110 128 H135 V151 H110 Z", "M20 175 H180"] },
  cardio: { d: ["M100 168 C40 125 18 92 30 62 C42 34 80 32 100 60 C120 32 158 34 170 62 C182 92 160 125 100 168 Z", "M38 104 H74 L86 80 L102 130 L116 92 L124 104 H162"] },
  barbell: { d: ["M14 100 H186", "M36 62 V138", "M52 50 V150", "M164 62 V138", "M148 50 V150", "M70 92 V108", "M130 92 V108"] },
  kettlebell: { d: ["M70 78 C60 30 140 30 130 78", "M100 180 C48 180 38 150 44 122 C50 92 72 78 100 78 C128 78 150 92 156 122 C162 150 152 180 100 180 Z", "M80 132 H120"] },
  pin: { d: ["M100 182 C64 136 44 108 44 80 C44 48 70 24 100 24 C130 24 156 48 156 80 C156 108 136 136 100 182 Z", "M100 104 A22 22 0 1 0 100 60 A22 22 0 1 0 100 104 Z"] },
  tower: { d: ["M56 180 V44 L100 24 L144 44 V180", "M30 180 H170", "M76 64 H124", "M76 88 H124", "M76 112 H124", "M76 136 H124", "M90 180 V156 H110 V180"] },
  bolt: { d: ["M114 18 L52 112 H96 L84 182 L148 86 H104 Z"] },
  insta: { d: ["M60 30 H140 A30 30 0 0 1 170 60 V140 A30 30 0 0 1 140 170 H60 A30 30 0 0 1 30 140 V60 A30 30 0 0 1 60 30 Z", "M100 132 A32 32 0 1 0 100 68 A32 32 0 1 0 100 132 Z", "M140 54 h0.1"] },
};

export type IconPage = { at: number; end: number; icon: keyof typeof ICONS; color: string };

export const IconLayer: React.FC<{ pages: IconPage[]; t: number; fps: number }> = ({ pages, t, fps }) => {
  const P = pages.find((p) => t >= p.at && t < p.end);
  if (!P) return null;
  const lt = t - P.at, left = P.end - t;
  const k = spring({ frame: Math.max(0, (lt - 0.1) * fps), fps, config: { damping: 11, stiffness: 140 } });
  const draw = interpolate(lt, [0.08, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(left, [0.12, 0.24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = (0.55 + 0.45 * k) * (0.85 + 0.15 * out) * (1 + 0.025 * lt); // slow push while it sits
  const rot = (1 - k) * -14 + Math.sin(lt * 2.4) * 3;
  const bob = Math.sin(lt * 3.1) * 10;
  const ic = ICONS[P.icon];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg viewBox="0 0 200 200" width={440} height={440}
        style={{ position: "absolute", left: 320, top: 930 + bob, opacity: out * Math.min(1, lt / 0.1), transform: `scale(${s}) rotate(${rot}deg)` }}>
        {ic.d.map((d, i) => (
          <path key={i} d={d} pathLength={1} fill="none" stroke={P.color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, draw * 1.4 - i * 0.06))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
