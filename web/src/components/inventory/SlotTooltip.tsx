import { Inventory, SlotWithItem } from '../../typings';
import React, { Fragment, useMemo } from 'react';
import { Items } from '../../store/items';
import { Locale } from '../../store/locale';
import ReactMarkdown from 'react-markdown';
import { useAppSelector } from '../../store';
import ClockIcon from '../utils/icons/ClockIcon';
import { getItemUrl } from '../../helpers';

const SlotTooltip: React.ForwardRefRenderFunction<
  HTMLDivElement,
  { item: SlotWithItem; inventoryType: Inventory['type']; style: React.CSSProperties }
> = ({ item, inventoryType, style }, ref) => {
  const additionalMetadata = useAppSelector((state) => state.inventory.additionalMetadata);
  const itemData = useMemo(() => Items[item.name], [item]);

  const ingredients = useMemo(() => {
    if (!item.ingredients) return null;
    return Object.entries(item.ingredients).sort((a, b) => a[1] - b[1]);
  }, [item]);

  const description = item.metadata?.description || itemData?.description;
  const ammoName = itemData?.ammoName && Items[itemData?.ammoName]?.label;

  // Sécurité si l'item n'existe pas dans la base
  if (!itemData) {
    return (
      <div className="tooltip-wrapper" ref={ref} style={style}>
        <div className="tooltip-header-wrapper">
          <p>{item.name}</p>
        </div>
        <div className="divider" style={{ margin: '4px 0 8px 0' }} />
      </div>
    );
  }

  return (
    <div className="tooltip-wrapper" ref={ref} style={style}>
      {/* ── En-tête ── */}
      <div className="tooltip-header-wrapper">
        <p>{item.metadata?.label || itemData.label || item.name}</p>

        {inventoryType === 'crafting' ? (
          <div className="tooltip-crafting-duration">
            <ClockIcon />
            <p>{(item.duration !== undefined ? item.duration : 3000) / 1000}s</p>
          </div>
        ) : (
          <p style={{ color: '#a1a1aa', fontSize: '11px', fontWeight: 500 }}>
            {item.metadata?.type || ''}
          </p>
        )}
      </div>

      <div className="divider" style={{ margin: '4px 0 8px 0' }} />

      {/* ── Description ── */}
      {description && (
        <div className="tooltip-description tooltip-markdown">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      )}

      {/* ── Contenu dynamique (Inventaire normal vs Crafting) ── */}
      {inventoryType !== 'crafting' ? (
        <div style={{ paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {item.durability !== undefined && (
            <p>
              <span style={{ color: '#71717a' }}>{Locale.ui_durability}:</span> {Math.trunc(item.durability)}
            </p>
          )}

          {item.metadata?.ammo !== undefined && (
            <p>
              <span style={{ color: '#71717a' }}>{Locale.ui_ammo}:</span> {item.metadata.ammo}
            </p>
          )}

          {ammoName && (
            <p>
              <span style={{ color: '#71717a' }}>{Locale.ammo_type}:</span> {ammoName}
            </p>
          )}

          {item.metadata?.serial && (
            <p>
              <span style={{ color: '#71717a' }}>{Locale.ui_serial}:</span> {item.metadata.serial}
            </p>
          )}

          {item.metadata?.components && item.metadata?.components[0] && (
            <p>
              <span style={{ color: '#71717a' }}>{Locale.ui_components}:</span>{' '}
              {(item.metadata?.components).map((component: string, index: number, array: []) =>
                index + 1 === array.length ? Items[component]?.label : Items[component]?.label + ', '
              )}
            </p>
          )}

          {item.metadata?.weapontint && (
            <p>
              <span style={{ color: '#71717a' }}>{Locale.ui_tint}:</span> {item.metadata.weapontint}
            </p>
          )}

          {/* Métadonnées dynamiques personnalisées (framework/serveur) */}
          {additionalMetadata.map((data: { metadata: string; value: string }, index: number) => (
            <Fragment key={`metadata-${index}`}>
              {item.metadata && item.metadata[data.metadata] && (
                <p>
                  <span style={{ color: '#71717a' }}>{data.value}:</span> {item.metadata[data.metadata]}
                </p>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        /* ── Zone Crafting (Ingrédients) ── */
        <div className="tooltip-ingredients">
          {ingredients &&
            ingredients.map((ingredient) => {
              const [reqItemName, count] = [ingredient[0], ingredient[1]];
              return (
                <div className="tooltip-ingredient" key={`ingredient-${reqItemName}`}>
                  <img
                    src={reqItemName ? getItemUrl(reqItemName) : 'none'}
                    alt=""
                    style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                  />
                  <p>
                    {count >= 1
                      ? `${count}x ${Items[reqItemName]?.label || reqItemName}`
                      : count === 0
                      ? `${Items[reqItemName]?.label || reqItemName}`
                      : count < 1 && `${count * 100}% ${Items[reqItemName]?.label || reqItemName}`}
                  </p>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default React.forwardRef(SlotTooltip);
