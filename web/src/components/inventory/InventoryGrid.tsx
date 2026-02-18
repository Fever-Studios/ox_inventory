import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot from './InventorySlot';
import InventoryActionBar from './InventoryActionBar';
import { getTotalWeight, isSlotWithItem } from '../../helpers';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';

const PAGE_SIZE = 30;

// ─── Panel-header icons — minimal inline SVGs ─────────────────────────────────

const PlayerIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
    />
  </svg>
);

const ShopIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
);

const CraftIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
    />
  </svg>
);

const BoxIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
);

const TYPE_ICON_MAP: Record<string, React.ReactElement> = {
  player: <PlayerIcon />,
  shop: <ShopIcon />,
  crafting: <CraftIcon />,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface InventoryGridProps {
  inventory: Inventory;
  /** Show the carrying-weight bar in the panel header (false for player — it lives in PlayerCard) */
  showWeight?: boolean;
  /** Render the Use / Give / Drop action bar at the bottom (true for player inventory only) */
  showActionBar?: boolean;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ inventory, showWeight = true, showActionBar = false }) => {
  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );

  const [page, setPage] = useState(0);
  const [filterText, setFilterText] = useState('');
  const containerRef = useRef(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => ++prev);
    }
  }, [entry]);

  // Reset pagination + filter when a different inventory opens
  useEffect(() => {
    setPage(0);
    setFilterText('');
  }, [inventory.id]);

  const displayItems = useMemo(() => {
    // 1. Mode recherche (filtre)
    if (filterText.trim()) {
      const lc = filterText.toLowerCase();
      return inventory.items.filter((item) => isSlotWithItem(item) && item.name.toLowerCase().includes(lc));
    }

    let itemsToConsider = inventory.items;

    // 2. Réduction dynamique pour tous les inventaires SAUF celui du joueur
    if (inventory.type !== 'player') {
      let lastOccupiedIndex = -1;

      // On cherche l'index du dernier objet présent
      for (let i = itemsToConsider.length - 1; i >= 0; i--) {
        if (isSlotWithItem(itemsToConsider[i])) {
          lastOccupiedIndex = i;
          break;
        }
      }

      // On calcule combien de cases afficher (Dernier item + 6 cases vides, minimum 10)
      const neededSlots = Math.max(10, lastOccupiedIndex + 5);
      const slotsToKeep = Math.ceil(neededSlots / 5) * 5; // Arrondi pour faire des lignes complètes de 5

      console.log(`[Ox_Inventory] Nettoyage : Garde ${slotsToKeep} slots sur ${itemsToConsider.length}`);

      itemsToConsider = itemsToConsider.slice(0, slotsToKeep);
    }

    // 3. Pagination habituelle
    return itemsToConsider.slice(0, (page + 1) * PAGE_SIZE);
  }, [inventory.items, page, filterText, inventory.type]);

  const typeIcon = TYPE_ICON_MAP[inventory.type] ?? <BoxIcon />;

  // Titre dynamique : 'Inventaire' pour le joueur, 'Sol' pour les drops au sol, label par défaut sinon
  const displayTitle = inventory.type === 'player' ? 'Inventaire' : inventory.type === 'drop' ? 'Sol' : inventory.label;

  return (
    <div
      className={`inventory-panel inventory-grid-wrapper ${inventory.type === 'drop' ? 'h-fit' : ''}`}
      style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
    >
      {/* ── Panel header ─────────────────────────────────── */}
      <div className="inventory-grid-header">
        <div className="inventory-grid-header-wrapper">
          {/* Left: small type icon + inventory label */}
          <div className="grid-header-title">
            <span className="grid-header-icon">{typeIcon}</span>
            <span>{displayTitle}</span>
          </div>

          {/* Right: weight pill + filter input */}
          <div className="grid-header-right">
            <input
              className="grid-header-filter"
              type="text"
              placeholder="Filter…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>

        {/* Weight bar only on inventories that show weight */}
        {showWeight && inventory.maxWeight !== undefined && inventory.maxWeight > 0 && inventory.type !== 'drop' && (
          <WeightBar percent={(weight / inventory.maxWeight) * 100} />
        )}
      </div>

      {/* ── Slot grid (scrollable, full width, 5 columns) ────────────────────────── */}
      <div className="inventory-grid-container" ref={containerRef}>
        {displayItems.map((item, index) => (
          <InventorySlot
            key={`${inventory.type}-${inventory.id}-${item.slot}`}
            item={item}
            ref={!filterText && index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
            inventoryType={inventory.type}
            inventoryGroups={inventory.groups}
            inventoryId={inventory.id}
          />
        ))}
      </div>

      {/* ── Action bar (player inventory only) ───────────── */}
      {showActionBar && <InventoryActionBar />}
    </div>
  );
};

export default InventoryGrid;
