import { createElement } from 'react';

import { getHabitIcon } from '../constants/Icons';

type HabitGlyphProps = {
  name: string;
  size?: number;
  color: string;
  strokeWidth?: number;
};

/**
 * Icon habit dipilih dari registry statis. Dibungkus komponen stabil agar
 * React Compiler tidak menganggapnya sebagai komponen baru tiap render.
 */
export default function HabitGlyph({
  name,
  size = 24,
  color,
  strokeWidth = 2,
}: HabitGlyphProps) {
  return createElement(getHabitIcon(name), { size, color, strokeWidth });
}
