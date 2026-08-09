/**
 * Cloud Intelligence design tokens — UrbanLens PRD spec.
 *
 * Theme: clean, spacious, premium, professional, soft, calm, intelligent.
 * Every value here follows the PRD spacing / color / radius / shadow tables.
 */

/* ── Colors ────────────────────────────────────────────────── */
const COLORS = {
  bg: '#F7F9FC',          // Cloud White — entire app background
  card: '#FFFFFF',        // Every major card background
  primary: '#2563EB',     // Buttons, links, active nav, progress, selected tabs
  primaryHover: '#1D4ED8',
  lightBlue: '#DBEAFE',   // AI cards, info backgrounds, recommendation badges
  accent: '#14B8A6',      // Secondary accent (teal)
  aiAccent: '#7C3AED',    // AI icons & badges ONLY — never used everywhere
  ink: '#1E293B',         // Heading text
  body: '#334155',        // Body / paragraph text
  muted: '#64748B',       // Secondary text
  border: '#E2E8F0',      // Card borders, dividers
  soft: '#F1F5F9',        // Subtle backgrounds
  success: '#16A34A',     // Recommendation, safe, good AQI
  warning: '#F59E0B',     // Traffic, rain, moderate crowd
  danger: '#EF4444',      // Road closure, unsafe, heavy traffic
} as const;

/* ── Spacing (px) ─────────────────────────────────────────── */
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/* ── Border Radius ────────────────────────────────────────── */
const RADIUS = {
  button: 16,
  card: 20,
  sheet: 28,
  search: 18,
  fab: 9999,  // circular
} as const;

/* ── Shadow System ────────────────────────────────────────── */
const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  hero: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 30,
    elevation: 6,
  },
  search: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
} as const;

/* ── Typography font families ─────────────────────────────── */
/* Instant system fonts — no network download before first paint. */
const FONTS = {
  heading: 'sans-serif-medium',
  body: 'sans-serif',
  number: 'sans-serif-medium',
} as const;

/* ── Buttons ──────────────────────────────────────────────── */
const BUTTONS = {
  height: 56,
} as const;

/* ── Exported Token Object ────────────────────────────────── */
export const CLOUD = {
  // Colors
  ...COLORS,

  // Spacing
  spacing: SPACING,

  // Radius
  radii: RADIUS,

  // Shadows
  shadows: SHADOWS,

  // Typography
  fonts: FONTS,

  // Buttons
  buttons: BUTTONS,

  // ── Backward-compatible aliases ─────────────────────────
  // These keep old CLOUD.pad / CLOUD.radius / CLOUD.shadow references working.
  pad: SPACING.lg,
  gap: 20,
  cardPad: 20,          // PRD: Card padding 20px
  searchH: 56,          // Search bar matches button height
  cardW: 168,
  navH: 84,
  radius: RADIUS.card,  // default radius for cards
  shadow: SHADOWS.card, // default shadow for cards
} as const;

