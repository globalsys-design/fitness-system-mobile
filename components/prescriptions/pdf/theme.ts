/**
 * PDF Theme — Conversão oklch → HEX para @react-pdf/renderer
 *
 * @react-pdf/renderer não suporta oklch() nativamente.
 * Estes valores são equivalentes HEX dos tokens definidos em globals.css.
 *
 * primary:            oklch(0.6566 0.1120 194.7713) → #3BA5A8 (teal)
 * primary-foreground:  oklch(0.9846 0.0017 247.8389) → #FAFBFC
 * foreground:          oklch(0.1448 0 0)              → #1A1A1A
 * muted:               oklch(0.9702 0 0)              → #F5F5F5
 * muted-foreground:    oklch(0.5555 0 0)              → #808080
 * border:              oklch(0.9219 0 0)              → #E5E5E5
 * background:          oklch(1.0 0 0)                 → #FFFFFF
 * destructive:         oklch(0.5830 0.2387 28.4765)   → #DC2626
 */

export const pdfColors = {
  primary: "#3BA5A8",
  primaryForeground: "#FAFBFC",
  foreground: "#1A1A1A",
  muted: "#F5F5F5",
  mutedForeground: "#808080",
  border: "#E5E5E5",
  background: "#FFFFFF",
  destructive: "#DC2626",
  // Cores auxiliares para o PDF
  headerBg: "#3BA5A8",
  headerText: "#FFFFFF",
  tableBg: "#F8FAFB",
  tableAltBg: "#FFFFFF",
  accent: "#E6F5F5",
} as const;

export const pdfFonts = {
  /** Tamanhos de fonte padronizados para A4 */
  xs: 7,
  sm: 8,
  base: 9,
  md: 10,
  lg: 12,
  xl: 14,
  "2xl": 18,
  "3xl": 22,
} as const;

export const pdfSpacing = {
  /** Espaçamento em pontos (72pt = 1 inch) */
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
} as const;
