import React, { useMemo, useState } from 'react';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';
import { getTotalWeight } from '../../helpers';
import useNuiEvent from '../../hooks/useNuiEvent';

// ─── Minimal inline SVG icons ────────────────────────────────────────────────

const HeartIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const ShieldIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

const FoodIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
  </svg>
);

const DropletIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
    <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z" />
  </svg>
);

const UserIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vitals {
  health: number;
  armor:  number;
  hunger: number;
  thirst: number;
}

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

interface VitalConfig {
  label: string;
  key:   keyof Vitals;
  Icon:  React.FC<IconProps>;
  color: string;  // CSS color value for the fill
}

const VITALS: VitalConfig[] = [
  { label: 'Health', key: 'health', Icon: HeartIcon,  color: '#f43f5e' },   // rose-500
  { label: 'Armor',  key: 'armor',  Icon: ShieldIcon,  color: '#3b82f6' },   // blue-500
  { label: 'Hunger', key: 'hunger', Icon: FoodIcon,    color: '#f59e0b' },   // amber-500
  { label: 'Thirst', key: 'thirst', Icon: DropletIcon, color: '#06b6d4' },   // cyan-500
];

// ─── Component ────────────────────────────────────────────────────────────────

const PlayerCard: React.FC = () => {
  const inventory = useAppSelector(selectLeftInventory);

  const [vitals, setVitals] = useState<Vitals>({ health: 100, armor: 0, hunger: 100, thirst: 100 });

  useNuiEvent<Vitals>('setVitals', setVitals);

  const weight = useMemo(
    () => (inventory.maxWeight ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );

  const weightPct = inventory.maxWeight ? Math.min((weight / inventory.maxWeight) * 100, 100) : 0;
  const weightFillColor = weightPct > 90 ? '#f43f5e' : weightPct > 70 ? '#f59e0b' : '#a1a1aa';

  // Use inventory label as player name (Ox sets this to the player's name)
  const playerName = inventory.label || 'Player';

  return (
    <div className="player-card">
      {/* Top accent stripe — zinc gradient like reference */}
      <div className="player-card-accent" />

      {/* ── Profile header ─────────────────────────────── */}
      <div className="player-card-header">
        <div className="player-card-avatar">
          <UserIcon />
        </div>
        <div className="player-card-info">
          <h2 className="player-card-name">{playerName}</h2>
          <div className="player-card-badges">
            <span className="player-card-role">CITIZEN</span>
            <span className="player-card-id">ID: {inventory.id || '—'}</span>
          </div>
        </div>
      </div>

      {/* ── Vitals 2×2 grid ────────────────────────────── */}
      <div className="vitals-grid">
        {VITALS.map(({ label, key, Icon, color }) => (
          <div className="vital-card" key={key}>
            <div className="vital-card-header">
              <span className="vital-label">{label}</span>
              <Icon className="vital-icon" style={{ color }} />
            </div>
            <div className="vital-track">
              <div
                className="vital-fill"
                style={{ width: `${vitals[key]}%`, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Carrying load ───────────────────────────────── */}
      {inventory.maxWeight !== undefined && inventory.maxWeight > 0 && (
        <div className="weight-section">
          <div className="weight-section-label">
            <span>Carrying Load</span>
            <span>{(weight / 1000).toLocaleString('en-us', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / {inventory.maxWeight / 1000}kg</span>
          </div>
          <div className="weight-section-track">
            <div
              className="weight-section-fill"
              style={{ width: `${weightPct}%`, backgroundColor: weightFillColor }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
