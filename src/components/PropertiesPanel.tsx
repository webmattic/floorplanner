import React from 'react'
import './PropertiesPanel.css'
import useFloorPlanStore from '../stores/floorPlanStore'


const TAB_PROPERTIES = 'properties';
const TAB_LAYERS = 'layers';

export const PropertiesPanel = () => {
  const {
    selectedElements = [],
    walls = [],
    rooms = [],
    furniture = [],
    updateWall = () => { },
    updateRoom = () => { },
    updateFurniture = () => { },
    removeWall = () => { },
    removeRoom = () => { },
    removeFurniture = () => { },
    clearSelection = () => { }
  } = useFloorPlanStore() || {};

  const [activeTab, setActiveTab] = React.useState(TAB_PROPERTIES);

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h2 className="properties-heading">Properties</h2>

        {/* --- Corrected: Added both tab buttons to the tablist container --- */}
        <div className="properties-tabs" role="tablist">
          <button
            id="properties-tab"
            role="tab"
            aria-selected={activeTab === TAB_PROPERTIES ? 'true' : 'false'}
            aria-controls="properties-tab-panel"
            tabIndex={activeTab === TAB_PROPERTIES ? 0 : -1}
            className={activeTab === TAB_PROPERTIES ? 'active' : ''}
            onClick={() => setActiveTab(TAB_PROPERTIES)}
          >
            Properties
          </button>
          <button
            id="layers-tab"
            role="tab"
            aria-selected={activeTab === TAB_LAYERS ? 'true' : 'false'}
            aria-controls="layers-tab-panel"
            tabIndex={activeTab === TAB_LAYERS ? 0 : -1}
            className={activeTab === TAB_LAYERS ? 'active' : ''}
                <span className="properties-selection-status" data-testid="selection-status">
            {selectedElements.length === 1 ? '1 object selected' : `${selectedElements.length} objects selected`}
          </span>
        </button>
      </div>
    </div>

      {/* --- Tab Panels --- */ }
      <div className="properties-tab-content">
        <div
          id="properties-tab-panel"
                        <label htmlFor={`layer-${el.id}`}>Layer assignment</label>
                        <select id={`layer-${el.id}`} defaultValue="wall">
                          <option value="wall">Wall</option>
                          <option value="room">Room</option>
                          <option value="furniture">Furniture</option>
                        </select>
          role="tabpanel"
          aria-labelledby="properties-tab"
        >
                        <label htmlFor={`thickness-${el.id}`}>Wall Thickness</label>
                        <input id={`thickness-${el.id}`} type="number" value={el.thickness || 8} onChange={(e) => updateWall(el.id, { thickness: parseInt(e.target.value) })} />
                        <span>{`Wall Thickness ${el.thickness || 8}px`}</span>
          ) : (
            <>
              {/* Selection status as a single text node, no markup splitting */}
              <div className="properties-selection-status" data-testid="selection-status">
                {`${selectedElements.length === 1 ? '1 object selected' : selectedElements.length + ' objects selected'}`}
              </div>
              {selectedElements.map((meta, idx) => {
                if (meta.type === 'wall') {
                  const el = walls.find(w => w.id === meta.id);
                  if (!el) return null;
                  return (
                    <div className="properties-section" key={el.id || idx}>
                      <div className="properties-category-label">Wall Properties</div>
                      {/* Layer assignment dropdown - label and select directly associated */}
                      <label htmlFor={`layer-${el.id}`}>Layer assignment</label><select id={`layer-${el.id}`} defaultValue="wall"><option value="wall">Wall</option><option value="room">Room</option><option value="furniture">Furniture</option></select>
                      {/* Wall Type as single text node */}
                      <div>Wall Type</div>
                      {/* Wall Thickness as a single text node, no markup splitting */}
                      <label htmlFor={`thickness-${el.id}`}>Wall Thickness</label><input id={`thickness-${el.id}`} type="number" value={el.thickness || 8} onChange={(e) => updateWall(el.id, { thickness: parseInt(e.target.value) })} />
                      <div>{`Wall Thickness ${el.thickness || 8}px`}</div>
                      {/* Wall does not have x, y, width, height fields */}
                      <label htmlFor={`color-${el.id}`}>Color</label>
                      <input
                        id={`color-${el.id}`}
                        <label htmlFor={`layer-${el.id}`}>Layer assignment</label>
                        <select id={`layer-${el.id}`} defaultValue="room">
                          <option value="wall">Wall</option>
                          <option value="room">Room</option>
                          <option value="furniture">Furniture</option>
                        </select>
                        value={el.color || '#374151'}
                        onChange={(e) => updateWall(el.id, { color: e.target.value })}
                      />
                      <button onClick={() => { removeWall(el.id); clearSelection(); }} aria-label="Delete">Delete</button>
                      <div className="properties-element-info">
                        <strong>ID:</strong> {el.id}<br />
                        <strong>Type:</strong> wall<br />
                        {el.points && Array.isArray(el.points) ? (
                          <span><strong>Points:</strong> {el.points.length / 2} points</span>
                        ) : null}
                      </div>
                    </div>
                  );
                } else if (meta.type === 'room') {
                  const el = rooms.find(r => r.id === meta.id);
                  if (!el) return null;
                  return (
                    <div className="properties-section" key={el.id || idx}>
                      <div className="properties-category-label">Room Properties</div>
                      {/* Layer assignment dropdown - label and select directly associated */}
                      <label htmlFor={`layer-${el.id}`}>Layer assignment</label><select id={`layer-${el.id}`} defaultValue="room"><option value="wall">Wall</option><option value="room">Room</option><option value="furniture">Furniture</option></select>
                      <label htmlFor={`label-${el.id}`}>Label</label>
                      <input
                        id={`label-${el.id}`}
                        type="text"
                        value={el.label || ''}
                        onChange={(e) => updateRoom(el.id, { label: e.target.value })}
                      />
                      <label htmlFor={`position-x-${el.id}`}>X</label>
                      <input
                        id={`position-x-${el.id}`}
                        type="number"
                        value={Math.round(el.x || 0)}
                        onChange={(e) => updateRoom(el.id, { x: parseInt(e.target.value) })}
                      />
                      <label htmlFor={`position-y-${el.id}`}>Y</label>
                      <input
                        id={`position-y-${el.id}`}
                        type="number"
                        value={Math.round(el.y || 0)}
                        onChange={(e) => updateRoom(el.id, { y: parseInt(e.target.value) })}
                      />
                      <label htmlFor={`width-${el.id}`}>Width</label>
                      <input
                        id={`width-${el.id}`}
                        type="number"
                        value={Math.round(el.width || 0)}
                        onChange={(e) => updateRoom(el.id, { width: parseInt(e.target.value) })}
                      />
                      <label htmlFor={`height-${el.id}`}>Height</label>
                      <input
                        id={`height-${el.id}`}
                        type="number"
                        value={Math.round(el.height || 0)}
                        onChange={(e) => updateRoom(el.id, { height: parseInt(e.target.value) })}
                      />
                        <label htmlFor={`layer-${el.id}`}>Layer assignment</label>
                        <select id={`layer-${el.id}`} defaultValue="furniture">
                          <option value="wall">Wall</option>
                          <option value="room">Room</option>
                          <option value="furniture">Furniture</option>
                        </select>
                      <input
                        id={`color-${el.id}`}
                        type="color"
                        value={el.color || '#374151'}
                        onChange={(e) => updateRoom(el.id, { color: e.target.value })}
                      />
                      <button onClick={() => { removeRoom(el.id); clearSelection(); }} aria-label="Delete">Delete</button>
                      <div className="properties-element-info">
                        <strong>ID:</strong> {el.id}<br />
                        <strong>Type:</strong> room<br />
                      </div>
                    </div>
                  );
                } else if (meta.type === 'furniture') {
                  const el = furniture.find(f => f.id === meta.id);
                  if (!el) return null;
                  return (
                    <div className="properties-section" key={el.id || idx}>
                      <div className="properties-category-label">Furniture Properties</div>
                      {/* Layer assignment dropdown - label and select directly associated */}
                      <label htmlFor={`layer-${el.id}`}>Layer assignment</label><select id={`layer-${el.id}`} defaultValue="furniture"><option value="wall">Wall</option><option value="room">Room</option><option value="furniture">Furniture</option></select>
                      <label htmlFor={`label-${el.id}`}>Label</label>
                      <input
                        id={`label-${el.id}`}
                        type="text"
                        value={el.label || ''}
                        onChange={(e) => updateFurniture(el.id, { label: e.target.value })}
                      />
                      <label htmlFor={`position-x-${el.id}`}>X</label>
                      <input
                        id={`position-x-${el.id}`}
                        type="number"
                        value={Math.round(el.x || 0)}
                        onChange={(e) => updateFurniture(el.id, { x: parseInt(e.target.value) })}
                      />
                      <label htmlFor={`position-y-${el.id}`}>Y</label>
                      <input
                        id={`position-y-${el.id}`}
                        type="number"
                        value={Math.round(el.y || 0)}
                        onChange={(e) => updateFurniture(el.id, { y: parseInt(e.target.value) })}
                      />
                      <label htmlFor={`width-${el.id}`}>Width</label>
                      <input
                        id={`width-${el.id}`}
                        type="number"
                        value={Math.round(el.width || 0)}
                        onChange={(e) => updateFurniture(el.id, { width: parseInt(e.target.value) })}
                      />
                      <label htmlFor={`height-${el.id}`}>Height</label>
                      <input
                        id={`height-${el.id}`}
                        type="number"
                        value={Math.round(el.height || 0)}
                        onChange={(e) => updateFurniture(el.id, { height: parseInt(e.target.value) })}
                      />
                      <label htmlFor={`color-${el.id}`}>Color</label>
                      <input
                        id={`color-${el.id}`}
                        type="color"
                        value={el.color || '#374151'}
                        onChange={(e) => updateFurniture(el.id, { color: e.target.value })}
                      />
                      <button onClick={() => { removeFurniture(el.id); clearSelection(); }} aria-label="Delete">Delete</button>
                      <div className="properties-element-info">
                        <strong>ID:</strong> {el.id}<br />
                        <strong>Type:</strong> furniture<br />
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </>
          )}
        </div>

        <div
          id="layers-tab-panel"
          hidden={activeTab !== TAB_LAYERS}
          role="tabpanel"
          aria-labelledby="layers-tab"
        >
          {/* Layers tab content goes here */}
        </div>
      </div >
    </div >
  );
}