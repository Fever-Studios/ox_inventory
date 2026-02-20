// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION CENTRALISÉE — ox_inventory UI
// Modifiez ce fichier pour personnaliser l'apparence sans toucher aux composants.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeLocale = 'en' | 'fr' | 'es';

export interface ThemeConfig {
  glass: {
    /** Opacité du fond sombre des panneaux (0 = transparent, 1 = opaque) */
    bgOpacity: number;
    /** Intensité du flou backdrop-filter en px */
    blur: number;
    /** Opacité de la bordure blanche (0 = invisible, 1 = pleine) */
    borderOpacity: number;
  };
  colors: {
    /** Couleur de la barre de vie */
    health: string;
    /** Couleur de la barre d'armure */
    armor: string;
    /** Couleur de la barre de faim */
    hunger: string;
    /** Couleur de la barre de soif */
    thirst: string;
    /** Barre de poids — état normal (< 70 %) */
    weightNormal: string;
    /** Barre de poids — état d'avertissement (> 70 %) */
    weightWarning: string;
    /** Barre de poids — état critique (> 90 %) */
    weightDanger: string;
  };
  borderRadius: {
    /** Panneaux glass : PlayerCard, inventaire secondaire, tooltip… */
    panel: string;
    /** Slots d'inventaire individuels */
    slot: string;
    /** Boutons d'action (Use, Give, Drop…) */
    button: string;
    /** Pills arrondies : badge de rôle, indicateur de poids… */
    pill: string;
  };
  ui: {
    /** false → masquer le panneau droit quand aucun inventaire secondaire n'est ouvert */
    showRightPanelWhenEmpty: boolean;
    /** false → masquer entièrement la colonne d'équipement */
    showEquipmentPanel: boolean;
    /** false → masquer les labels sous les slots d'équipement */
    showEquipmentLabels: boolean;
    /** false → masquer la grille Santé / Armure / Faim / Soif */
    showVitals: boolean;
    /** false → masquer la barre de poids dans le PlayerCard */
    showWeightBar: boolean;
    /** false → masquer la hotbar en bas d'écran */
    showHotbar: boolean;
    /** false → masquer l'en-tête du PlayerCard (nom + avatar) */
    showPlayerCardTitle: boolean;
  };
  i18n: {
    /**
     * Langue active pour les chaînes UI personnalisées.
     * NE remplace PAS le système Locale d'ox (ui_use, ui_give…) — uniquement
     * pour les éléments que vous ajoutez vous-même.
     */
    locale: ThemeLocale;
    strings: Record<ThemeLocale, Record<string, string>>;
  };
}

// ─── Configuration ─────────────────────────────────────────────────────────────

export const theme = {
  glass: {
    bgOpacity:     0.4,   // rgba(10, 10, 10, 0.4)
    blur:          24,    // px
    borderOpacity: 0.08,  // rgba(255, 255, 255, 0.08)
  },

  colors: {
    health:        '#f43f5e',  // rose-500
    armor:         '#3b82f6',  // blue-500
    hunger:        '#f59e0b',  // amber-500
    thirst:        '#06b6d4',  // cyan-500
    weightNormal:  '#a1a1aa',  // zinc-400
    weightWarning: '#f59e0b',  // amber-500 (> 70 %)
    weightDanger:  '#f43f5e',  // rose-500  (> 90 %)
  },

  borderRadius: {
    panel:  '1rem',
    slot:   '0.5rem',
    button: '0.375rem',
    pill:   '9999px',
  },

  ui: {
    showRightPanelWhenEmpty: false,
    showEquipmentPanel:      true,
    showEquipmentLabels:     true,
    showVitals:              true,
    showWeightBar:           true,
    showHotbar:              true,
    showPlayerCardTitle:     true,
  },

  i18n: {
    locale: 'fr' as ThemeLocale,
    strings: {
      en: {
        carrying:  'Carrying Load',
        equipment: 'Equipment',
        // Ajoutez ici vos clés UI personnalisées en anglais
      },
      fr: {
        carrying:  'Charge portée',
        equipment: 'Équipement',
        // Ajoutez ici vos clés UI personnalisées en français
      },
      es: {
        carrying:  'Carga actual',
        equipment: 'Equipo',
        // Añade aquí tus claves UI personalizadas en español
      },
    },
  },
} satisfies ThemeConfig;

// ─── Helper i18n ───────────────────────────────────────────────────────────────

/**
 * Retourne la chaîne traduite pour la clé donnée selon `theme.i18n.locale`.
 * Si la clé est absente, retourne la clé elle-même (comportement safe).
 *
 * Usage :
 *   import { t } from '../../config/theme';
 *   <span>{t('carrying')}</span>  // → "Charge portée" si locale = 'fr'
 *
 * ⚠️  Ne pas utiliser pour les clés gérées par le système Locale d'ox
 *     (ui_use, ui_give, ui_drop…) — celles-ci sont injectées côté serveur Lua.
 */
export function t(key: string): string {
  const dict = theme.i18n.strings[theme.i18n.locale] as Record<string, string>;
  return dict?.[key] ?? key;
}
