/**
 * Polli's semantic design tokens for React Native styles and navigation.
 * NativeWind equivalents are defined in `tailwind.config.js`.
 */
export const theme = {
  color: {
    brand: "#5E5CE6",
    brandStrong: "#4947C8",
    brandSoft: "#EEEDFF",
    brandSubtle: "#F7F7FF",
    canvas: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",
    inkStrong: "#172033",
    ink: "#334155",
    inkMuted: "#64748B",
    inkDisabled: "#94A3B8",
    inverse: "#FFFFFF",
    line: "#CBD5E1",
    lineSubtle: "#E2E8F0",
    lineStrong: "#94A3B8",
    success: "#15803D",
    successSoft: "#DCFCE7",
    warning: "#B45309",
    warningSoft: "#FEF3C7",
    danger: "#DC2626",
    dangerSoft: "#FEE2E2",
    info: "#2563EB",
    infoSoft: "#DBEAFE",
  },
  radius: {
    control: 12,
    card: 16,
    modal: 20,
    pill: 999,
  },
  spacing: {
    screen: 16,
    section: 24,
    card: 16,
    control: 12,
    inline: 8,
  },
} as const;

export type Theme = typeof theme;
