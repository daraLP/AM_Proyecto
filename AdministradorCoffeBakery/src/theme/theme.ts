import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const scale = SCREEN_WIDTH / 375;

export function normalizeText(size: number): number {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const theme = {
  colors: {
    primary: "#2ED573",
    primaryDark: "#22B55E",
    primaryLight: "#E8FAEF",
    secondary: "#4A3728",
    background: "#F8F9FA",
    surface: "#FFFFFF",
    textPrimary: "#1E272C",
    textSecondary: "#636E72",
    textMuted: "#B2BEC3",
    border: "#DFE4EA",
    error: "#D63031",
    errorLight: "#FFECEC",
    warning: "#E17055",
    warningLight: "#FFEAA7",
    disabled: "#CED6E0",
    white: "#FFFFFF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    pill: 999,
  },
  fontSize: {
    xs: normalizeText(12),
    sm: normalizeText(14),
    md: normalizeText(16),
    lg: normalizeText(20),
    xl: normalizeText(26),
    xxl: normalizeText(32),
  },
};
