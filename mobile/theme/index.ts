import { colors } from './colors';
import { borderRadius, fontFamily, fontSize, fontWeight, spacing } from './spacing';

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  fontFamily,
};

export type Theme = typeof theme;
export { colors } from './colors';
export type { ThemeColors } from './colors';
