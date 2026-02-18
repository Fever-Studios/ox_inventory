import React from 'react';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectItemAmount, setItemAmount } from '../../store/inventory';
import { DragSource } from '../../typings';
import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { onDrop } from '../../dnd/onDrop';
import { fetchNui } from '../../utils/fetchNui';
import { Locale } from '../../store/locale';

// ─── Action bar rendered at the bottom of the player inventory panel.
// Matches the aura_ui.html reference: quantity input + Use / Give / Drop buttons.

const InventoryActionBar: React.FC = () => {
  const itemAmount = useAppSelector(selectItemAmount);
  const dispatch = useAppDispatch();

  // DnD drop targets — drag a slot onto these buttons to trigger the action
  const [, useRef] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      if (source.inventory === 'player') onUse(source.item);
    },
  }));

  const [, giveRef] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      if (source.inventory === 'player') onGive(source.item);
    },
  }));

  const [, dropRef] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      onDrop({ item: source.item, inventory: source.inventory });
    },
  }));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.valueAsNumber;
    e.target.valueAsNumber = isNaN(val) || val < 0 ? 0 : Math.floor(val);
    dispatch(setItemAmount(e.target.valueAsNumber));
  };

  return (
    <div className="action-bar">
      {/* Left: hotbar hint */}
      <div className="action-bar-hint">
        <span className="action-bar-hint-label">HOTBAR</span>
        <span>1 – 5</span>
      </div>

      {/* Right: controls */}
      <div className="action-bar-controls">
        {/* Quantity input */}
        <input
          type="number"
          className="action-qty"
          defaultValue={itemAmount}
          min={0}
          onChange={handleAmountChange}
        />

        {/* Use */}
        <button className="action-btn" ref={useRef}>
          {Locale.ui_use || 'Use'}
        </button>

        {/* Give */}
        <button className="action-btn" ref={giveRef}>
          {Locale.ui_give || 'Give'}
        </button>

        {/* Drop — rose accent from reference: bg-rose-900/30 text-rose-300 border-rose-500/20 */}
        <button className="action-btn action-btn-danger" ref={dropRef}>
          Drop
        </button>

        {/* Close */}
        <button className="action-btn action-btn-close" onClick={() => fetchNui('exit')}>
          {Locale.ui_close || 'Close'}
        </button>
      </div>
    </div>
  );
};

export default InventoryActionBar;
