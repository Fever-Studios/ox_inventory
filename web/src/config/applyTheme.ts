// ═══════════════════════════════════════════════════════════════════════════════
// APPLY THEME — Injecteur de CSS custom properties
// Fait le pont entre theme.ts (TypeScript, runtime) et les styles SCSS
// (compilés au build) en écrivant les valeurs sur :root au démarrage.
// ═══════════════════════════════════════════════════════════════════════════════

import { theme } from './theme';

/**
 * Injecte les valeurs de `theme.ts` en tant que CSS custom properties sur
 * `document.documentElement` (:root). Doit être appelé une seule fois,
 * avant `createRoot()`, dans `main.tsx`.
 *
 * Après l'appel, les variables suivantes sont disponibles dans tout le CSS :
 *
 *   Glassmorphism :
 *     --glass-bg       → ex. rgba(10, 10, 10, 0.4)
 *     --glass-blur     → ex. 24px
 *     --glass-border   → ex. rgba(255, 255, 255, 0.08)
 *
 *   Couleurs :
 *     --color-health         --color-armor
 *     --color-hunger         --color-thirst
 *     --color-weight-normal  --color-weight-warning  --color-weight-danger
 *
 *   Border radius :
 *     --radius-panel  --radius-slot  --radius-button  --radius-pill
 */
export function applyTheme(): void {
  const root = document.documentElement;
  const { glass, colors, borderRadius } = theme;

  // ─── Glassmorphism ──────────────────────────────────────────────────────────
  // Les valeurs entières sont stockées dans la variable afin que le SCSS puisse
  // utiliser var(--glass-bg, fallback) sans que SCSS n'essaie d'évaluer rgba().
  root.style.setProperty('--glass-bg',     `rgba(10, 10, 10, ${glass.bgOpacity})`);
  root.style.setProperty('--glass-blur',   `${glass.blur}px`);
  root.style.setProperty('--glass-border', `rgba(255, 255, 255, ${glass.borderOpacity})`);

  // ─── Couleurs des vitaux ────────────────────────────────────────────────────
  root.style.setProperty('--color-health', colors.health);
  root.style.setProperty('--color-armor',  colors.armor);
  root.style.setProperty('--color-hunger', colors.hunger);
  root.style.setProperty('--color-thirst', colors.thirst);

  // ─── Couleurs de la barre de poids ──────────────────────────────────────────
  root.style.setProperty('--color-weight-normal',  colors.weightNormal);
  root.style.setProperty('--color-weight-warning', colors.weightWarning);
  root.style.setProperty('--color-weight-danger',  colors.weightDanger);

  // ─── Border radius ──────────────────────────────────────────────────────────
  root.style.setProperty('--radius-panel',  borderRadius.panel);
  root.style.setProperty('--radius-slot',   borderRadius.slot);
  root.style.setProperty('--radius-button', borderRadius.button);
  root.style.setProperty('--radius-pill',   borderRadius.pill);
}
