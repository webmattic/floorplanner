/**
 * Color theory utilities for generating harmonious color palettes
 */

export interface HSL {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

export interface RGB {
  r: number; // Red (0-255)
  g: number; // Green (0-255)
  b: number; // Blue (0-255)
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  type:
    | "monochromatic"
    | "analogous"
    | "complementary"
    | "triadic"
    | "tetradic"
    | "split-complementary";
  description?: string;
}

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): HSL {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate monochromatic color palette
 */
export function generateMonochromaticPalette(
  baseColor: string,
  count: number = 5
): string[] {
  const hsl = hexToHsl(baseColor);
  const colors: string[] = [];

  // Generate variations by adjusting lightness
  const lightnessStep = 80 / (count - 1);

  for (let i = 0; i < count; i++) {
    const lightness = Math.max(10, Math.min(90, 20 + i * lightnessStep));
    colors.push(
      hslToHex({
        h: hsl.h,
        s: Math.max(10, hsl.s),
        l: lightness,
      })
    );
  }

  return colors;
}

/**
 * Generate analogous color palette
 */
export function generateAnalogousPalette(
  baseColor: string,
  count: number = 5
): string[] {
  const hsl = hexToHsl(baseColor);
  const colors: string[] = [];

  // Generate colors within 30 degrees on either side
  const hueStep = 60 / (count - 1);

  for (let i = 0; i < count; i++) {
    const hue = (hsl.h - 30 + i * hueStep + 360) % 360;
    colors.push(
      hslToHex({
        h: hue,
        s: Math.max(30, hsl.s),
        l: Math.max(20, Math.min(80, hsl.l)),
      })
    );
  }

  return colors;
}

/**
 * Generate complementary color palette
 */
export function generateComplementaryPalette(baseColor: string): string[] {
  const hsl = hexToHsl(baseColor);
  const complementaryHue = (hsl.h + 180) % 360;

  return [
    baseColor,
    hslToHex({ h: complementaryHue, s: hsl.s, l: hsl.l }),
    hslToHex({
      h: hsl.h,
      s: Math.max(20, hsl.s - 20),
      l: Math.min(90, hsl.l + 20),
    }),
    hslToHex({
      h: complementaryHue,
      s: Math.max(20, hsl.s - 20),
      l: Math.min(90, hsl.l + 20),
    }),
    hslToHex({
      h: hsl.h,
      s: Math.min(100, hsl.s + 20),
      l: Math.max(10, hsl.l - 20),
    }),
  ];
}

/**
 * Generate triadic color palette
 */
export function generateTriadicPalette(baseColor: string): string[] {
  const hsl = hexToHsl(baseColor);

  return [
    baseColor,
    hslToHex({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({
      h: hsl.h,
      s: Math.max(20, hsl.s - 30),
      l: Math.min(90, hsl.l + 30),
    }),
    hslToHex({
      h: (hsl.h + 120) % 360,
      s: Math.max(20, hsl.s - 30),
      l: Math.min(90, hsl.l + 30),
    }),
  ];
}

/**
 * Generate split-complementary color palette
 */
export function generateSplitComplementaryPalette(baseColor: string): string[] {
  const hsl = hexToHsl(baseColor);
  const complementary = (hsl.h + 180) % 360;

  return [
    baseColor,
    hslToHex({ h: (complementary - 30 + 360) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (complementary + 30) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({
      h: hsl.h,
      s: Math.max(20, hsl.s - 20),
      l: Math.min(90, hsl.l + 20),
    }),
    hslToHex({
      h: complementary,
      s: Math.max(20, hsl.s - 20),
      l: Math.min(90, hsl.l + 20),
    }),
  ];
}

/**
 * Generate tetradic (square) color palette
 */
export function generateTetradicPalette(baseColor: string): string[] {
  const hsl = hexToHsl(baseColor);

  return [
    baseColor,
    hslToHex({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({
      h: hsl.h,
      s: Math.max(20, hsl.s - 20),
      l: Math.min(90, hsl.l + 20),
    }),
  ];
}

/**
 * Generate smart color palette based on type
 */
export function generateSmartPalette(
  baseColor: string,
  type: ColorPalette["type"],
  count: number = 5
): ColorPalette {
  let colors: string[];
  let name: string;
  let description: string;

  switch (type) {
    case "monochromatic":
      colors = generateMonochromaticPalette(baseColor, count);
      name = "Monochromatic";
      description = "Variations of the same hue with different lightness";
      break;
    case "analogous":
      colors = generateAnalogousPalette(baseColor, count);
      name = "Analogous";
      description = "Colors adjacent on the color wheel";
      break;
    case "complementary":
      colors = generateComplementaryPalette(baseColor);
      name = "Complementary";
      description = "Colors opposite on the color wheel";
      break;
    case "triadic":
      colors = generateTriadicPalette(baseColor);
      name = "Triadic";
      description = "Three colors evenly spaced on the color wheel";
      break;
    case "split-complementary":
      colors = generateSplitComplementaryPalette(baseColor);
      name = "Split Complementary";
      description = "Base color plus two colors adjacent to its complement";
      break;
    case "tetradic":
      colors = generateTetradicPalette(baseColor);
      name = "Tetradic";
      description = "Four colors forming a square on the color wheel";
      break;
    default:
      colors = [baseColor];
      name = "Custom";
      description = "Custom color selection";
  }

  return {
    id: `${type}-${Date.now()}`,
    name,
    colors,
    type,
    description,
  };
}

/**
 * Get color contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = {
      r: parseInt(hex.slice(1, 3), 16) / 255,
      g: parseInt(hex.slice(3, 5), 16) / 255,
      b: parseInt(hex.slice(5, 7), 16) / 255,
    };

    const sRGB = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * sRGB(rgb.r) + 0.7152 * sRGB(rgb.g) + 0.0722 * sRGB(rgb.b);
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

/**
 * Check if color combination is accessible
 */
export function isAccessible(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA"
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === "AA" ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generate accessible color pairs
 */
export function generateAccessiblePairs(
  baseColor: string
): Array<{ foreground: string; background: string }> {
  const pairs: Array<{ foreground: string; background: string }> = [];
  const hsl = hexToHsl(baseColor);

  // Generate light backgrounds with dark text
  for (let l = 80; l <= 95; l += 5) {
    const background = hslToHex({ h: hsl.h, s: Math.max(10, hsl.s - 40), l });
    const foreground = hslToHex({ h: hsl.h, s: hsl.s, l: 20 });

    if (isAccessible(foreground, background)) {
      pairs.push({ foreground, background });
    }
  }

  // Generate dark backgrounds with light text
  for (let l = 10; l <= 25; l += 5) {
    const background = hslToHex({ h: hsl.h, s: hsl.s, l });
    const foreground = hslToHex({
      h: hsl.h,
      s: Math.max(10, hsl.s - 20),
      l: 90,
    });

    if (isAccessible(foreground, background)) {
      pairs.push({ foreground, background });
    }
  }

  return pairs;
}
