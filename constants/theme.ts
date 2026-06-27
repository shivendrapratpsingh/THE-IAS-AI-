// Central theme tokens for the IAS Prep Companion app.
// Color scheme: Deep navy primary + saffron accent, inspired by the
// tricolor / Ashoka Chakra patriotic art used across the app.

export const lightTheme = {
  mode: "light" as const,
  primary: "#1A2B4A", // deep navy
  accent: "#FF9933", // saffron
  accentGreen: "#138808", // India green
  background: "#F5F6FA",
  card: "#FFFFFF",
  text: "#1A2B4A",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  success: "#138808",
  error: "#D32F2F",
  warning: "#FF9933",
  white: "#FFFFFF",
};

export const darkTheme = {
  mode: "dark" as const,
  primary: "#0F1B33",
  accent: "#FFB04D",
  accentGreen: "#3DDC84",
  background: "#10141F",
  card: "#1B2438",
  text: "#F5F6FA",
  textMuted: "#9AA4BD",
  border: "#2A3552",
  success: "#3DDC84",
  error: "#FF6B6B",
  warning: "#FFB04D",
  white: "#FFFFFF",
};

export type Theme = typeof lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
};
