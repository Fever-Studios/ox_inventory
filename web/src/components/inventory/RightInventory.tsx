import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectRightInventory } from '../../store/inventory';

// Right column — secondary inventory (ground drop, chest, trunk, etc.).
// Shows the weight header since this isn't in the PlayerCard.

const RightInventory: React.FC = () => {
  const rightInventory = useAppSelector(selectRightInventory);

  return (
    <InventoryGrid
      inventory={rightInventory}
      showWeight={true}
      showActionBar={false}
    />
  );
};

export default RightInventory;
