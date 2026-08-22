import React from 'react';
import Svg, { Circle, G, Rect } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

/**
 * Faithful port of saudi_app_react/src/assets/logo.svg: a green rounded-square
 * badge with an ascending 3-bar "stats" glyph and a gold accent dot.
 */
export default function Logo({ size = 40 }: LogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityRole="image"
      accessibilityLabel="لوحة تحكم السعودية"
    >
      <Rect x={2} y={2} width={60} height={60} rx={16} fill="#006C35" />
      <Rect x={2} y={2} width={60} height={60} rx={16} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={1.5} />
      <G fill="#ffffff">
        <Rect x={15} y={34} width={8} height={16} rx={2} />
        <Rect x={28} y={24} width={8} height={26} rx={2} />
        <Rect x={41} y={16} width={8} height={34} rx={2} />
      </G>
      <Circle cx={45} cy={14} r={4} fill="#f2c94c" />
    </Svg>
  );
}
