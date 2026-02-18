import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';

// Center column — player's own pockets.
// Weight is now shown in the grid header.
// Action bar (Use / Give / Drop) is rendered at the bottom of this panel.

const LeftInventory: React.FC = () => {
  const leftInventory = useAppSelector(selectLeftInventory);

  return <InventoryGrid inventory={leftInventory} showWeight={true} showActionBar={true} />;
};

export default LeftInventory;
