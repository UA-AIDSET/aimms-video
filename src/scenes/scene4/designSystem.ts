/**
 * Scene 4 — Global Visual System (tokens only)
 * Unified “premium medical UI”: deep navy → blue depth, soft medical green accents, glass panels.
 */
import { Easing } from "remotion";
import { colors, fonts } from "../../theme";

/** Soft medical green for active / clinical emphasis (calmer than raw ecg neon) */
const medicalGreen = "#5FD4A0";
const medicalGreenSoft = `${medicalGreen}55`;

/* ── Canvas & atmosphere (layered; never flat) ─────────────────────────── */
export const scene4 = {
  /** Deep navy → deep blue cinematic base */
  backgroundGradient: `
    radial-gradient(ellipse 130% 100% at 50% -10%, #0a1628 0%, #071018 38%, #040a14 100%),
    linear-gradient(180deg, #0d1a2c 0%, #060d18 45%, #03070e 100%)
  `,
  /** Cool blue lift — center-weighted */
  ambientWash: `radial-gradient(ellipse 85% 70% at 50% 48%, ${colors.arizonaBlue}22 0%, transparent 58%)`,
  /** Deep edge vignette */
  vignette: `radial-gradient(ellipse 96% 92% at 50% 50%, transparent 38%, rgba(0,0,0,0.52) 100%)`,
  /** Primary grid — clinical precision */
  gridOverlay: `repeating-linear-gradient(
    0deg,
    transparent,
    transparent 46px,
    rgba(95, 212, 160, 0.045) 47px
  ),
  repeating-linear-gradient(
    90deg,
    transparent,
    transparent 46px,
    rgba(255, 255, 255, 0.018) 47px
  )`,
  /** Finer secondary grid */
  gridFine: `repeating-linear-gradient(
    -8deg,
    transparent,
    transparent 22px,
    rgba(95, 212, 160, 0.03) 23px
  )`,
} as const;

/* ── Semantic accents (green-forward active state + existing semantics) ─── */
export const scene4Accent = {
  /** Primary “active” accent — soft medical green */
  active: medicalGreen,
  activeSoft: medicalGreenSoft,
  product: colors.azurite,
  productSoft: `${colors.azurite}55`,
  interactive: colors.oasis,
  clinical: colors.ecgGreen,
  caution: colors.vitalsWarning,
  critical: colors.vitalsCritical,
  success: colors.vitalsNormal,
  brand: colors.arizonaBlue,
} as const;

/* ── Glass / premium panel chrome — translucent dark blue ──────────────── */
export const scene4Panel = {
  /** Default border when shots don’t pass a custom accent */
  defaultAccent: `rgba(95, 212, 160, 0.22)`,
  glass: {
    background: `linear-gradient(
      155deg,
      rgba(8, 18, 42, 0.78) 0%,
      rgba(4, 12, 32, 0.88) 48%,
      rgba(3, 8, 22, 0.92) 100%
    )`,
    border: `1px solid rgba(95, 212, 160, 0.18)`,
    boxShadow: `
      0 28px 72px rgba(0, 0, 0, 0.58),
      0 0 48px rgba(95, 212, 160, 0.08),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset,
      0 1px 0 rgba(255, 255, 255, 0.05) inset
    `,
  },
  glassLift: {
    boxShadow: `
      0 36px 88px rgba(0, 0, 0, 0.52),
      0 0 56px rgba(95, 212, 160, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.07)
    `,
  },
  highlightTop: `linear-gradient(90deg, transparent, rgba(95, 212, 160, 0.12), transparent)`,
} as const;

export const scene4Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const scene4Type = {
  hero: {
    fontFamily: fonts.heading,
    fontWeight: 800 as const,
    fontSize: 64,
    letterSpacing: -0.5,
    lineHeight: 1.1,
    color: colors.white,
  },
  title: {
    fontFamily: fonts.heading,
    fontWeight: 700 as const,
    fontSize: 48,
    lineHeight: 1.2,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 30,
    fontWeight: 500,
    lineHeight: 1.4,
    color: `rgba(255, 255, 255, 0.82)`,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 26,
    lineHeight: 1.45,
    color: `rgba(255, 255, 255, 0.88)`,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 17,
    fontWeight: 700 as const,
    letterSpacing: 3.5,
    textTransform: "uppercase" as const,
    color: `rgba(255, 255, 255, 0.58)`,
  },
  data: {
    fontFamily: fonts.mono,
    fontSize: 24,
    fontWeight: 700,
    color: colors.white,
  },
} as const;

export const scene4Space = {
  inset: 72,
  gapLg: 40,
  gapMd: 24,
  gapSm: 16,
  contentMax: 1200,
  contentNarrow: 920,
} as const;

export const scene4Motion = {
  easeInOut: Easing.inOut(Easing.cubic),
  easeOut: Easing.out(Easing.cubic),
  frames: {
    enter: 18,
    holdMin: 24,
    transition: 15,
  },
  depthEnterScale: { from: 0.97, to: 1 },
  depthParallaxY: 12,
} as const;

export const scene4Z = {
  bg: 0,
  ambient: 1,
  content: 2,
  focal: 3,
  overlay: 4,
} as const;

export const s4Bg = "#060d18";
export const s4Panel = "rgba(6, 12, 28, 0.92)";
