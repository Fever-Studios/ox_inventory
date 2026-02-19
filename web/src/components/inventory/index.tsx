import React, { useState } from 'react';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryHotbar from './InventoryHotbar';
import { useAppDispatch } from '../../store';
import { refreshSlots, setAdditionalMetadata, setupInventory } from '../../store/inventory';
import { useExitListener } from '../../hooks/useExitListener';
import type { Inventory as InventoryProps } from '../../typings';
import RightInventory from './RightInventory';
import LeftInventory from './LeftInventory';
import PlayerCard from './PlayerCard';
import Tooltip from '../utils/Tooltip';
import { closeTooltip } from '../../store/tooltip';
import InventoryContext from './InventoryContext';
import { closeContextMenu } from '../../store/contextMenu';
import Fade from '../utils/transitions/Fade';
import UsefulControls from './UsefulControls';
import EquipmentPanel from './EquipmentPanel';

// ─── Main inventory layout — 3-column grid matching aura_ui.html:
//   col 1 (25%): PlayerCard  (profile + vitals + weight)
//   col 2 (42%): LeftInventory (player pockets + action bar)
//   col 3 (33%): RightInventory (ground / chest / trunk)

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const dispatch = useAppDispatch();

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    dispatch(closeContextMenu());
    dispatch(closeTooltip());
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: InventoryProps;
    rightInventory?: InventoryProps;
  }>('setupInventory', (data) => {
    dispatch(setupInventory(data));
    !inventoryVisible && setInventoryVisible(true);
  });

  useNuiEvent('refreshSlots', (data) => dispatch(refreshSlots(data)));

  useNuiEvent('displayMetadata', (data: Array<{ metadata: string; value: string }>) => {
    dispatch(setAdditionalMetadata(data));
  });

  return (
    <>
      <Fade in={inventoryVisible}>
        {/* 3-column grid with proper gaps and modern layout */}
        <div
          className="inventory-wrapper"
          style={{
            display: 'grid',
            gridTemplateColumns: '25% 42% 33%',
            gap: '1.5rem',
            padding: '2rem',
            maxWidth: '1600px',
            margin: '0 auto',
            height: 'calc(100vh - 4rem)',
            alignItems: 'start',
          }}
        >
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%'}}>
            {/* Left column: profile card with vitals - height fits content */}
            <div className="inventory-panel h-fit">
              <PlayerCard />
            </div>

            {/* Nouveau wrapper (Même style que tes autres colonnes) */}
            <div
              className="inventory-panel"
              style={{
                flex: 1, // Dit à la div de prendre tout l'espace restant sous la PlayerCard
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <EquipmentPanel />
            </div>
          </div>

          {/* Center column: player pockets with action bar at the bottom */}
          <div
            className="inventory-panel"
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <LeftInventory />
          </div>

          {/* Right column: secondary inventory (ground / chest / trunk) */}
          <div
            className="inventory-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RightInventory />
          </div>

          <Tooltip />
          <InventoryContext />
        </div>
      </Fade>

      {/* Hotbar stays at bottom of screen, outside main grid */}
      <InventoryHotbar />

      {/* Floating useful-controls dialog + its trigger button */}
      <UsefulControls infoVisible={infoVisible} setInfoVisible={setInfoVisible} />
      <button
        className="useful-controls-button"
        onClick={() => setInfoVisible(true)}
        title="Controls"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(24, 24, 27, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(63, 63, 70, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 1000,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="1.4em"
          viewBox="0 0 512 512"
          fill="currentColor"
          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
        >
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
        </svg>
      </button>
    </>
  );
};

export default Inventory;
