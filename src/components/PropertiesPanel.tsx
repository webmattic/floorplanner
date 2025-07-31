import React from 'react'
import useFloorPlanStore from '../stores/floorPlanStore.js'

const PropertiesPanel = () => {
  const { 
    selectedElements, 
    updateWall, 
    updateRoom, 
    updateFurniture,
    removeWall,
    removeRoom,
    removeFurniture,
    currentTool
  } = useFloorPlanStore()

  if (selectedElements.length === 0) {
    return (
      <div className="properties-panel">
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          Properties
        </h3>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>
          {currentTool === 'select' 
            ? 'Select an element to edit properties'
            : `${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)} tool selected`
          }
        </div>
        {currentTool !== 'select' && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
            {currentTool === 'wall' && 'Click and drag to draw walls'}
            {currentTool === 'room' && 'Click to place rooms'}
            {currentTool === 'furniture' && 'Click to place furniture'}
            {currentTool === 'measure' && 'Click to measure distances'}
          </div>
        )}
      </div>
    )
  }

  const element = selectedElements[0]
  
  const handleUpdate = (updates) => {
    switch (element.type) {
      case 'wall':
        updateWall(element.id, updates)
        break
      case 'room':
        updateRoom(element.id, updates)
        break
      case 'furniture':
        updateFurniture(element.id, updates)
        break
    }
  }

  const handleDelete = () => {
    switch (element.type) {
      case 'wall':
        removeWall(element.id)
        break
      case 'room':
        removeRoom(element.id)
        break
      case 'furniture':
        removeFurniture(element.id)
        break
    }
  }

  return (
    <div className="properties-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Properties
        </h3>
        <button
          onClick={handleDelete}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🗑️ Delete
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Common properties */}
        {element.type !== 'wall' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Position X
              </label>
              <input
                type="number"
                value={Math.round(element.x || 0)}
                onChange={(e) => handleUpdate({ x: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Position Y
              </label>
              <input
                type="number"
                value={Math.round(element.y || 0)}
                onChange={(e) => handleUpdate({ y: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Width
              </label>
              <input
                type="number"
                value={Math.round(element.width || 0)}
                onChange={(e) => handleUpdate({ width: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Height
              </label>
              <input
                type="number"
                value={Math.round(element.height || 0)}
                onChange={(e) => handleUpdate({ height: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>
          </>
        )}

        {/* Label for rooms and furniture */}
        {(element.type === 'room' || element.type === 'furniture') && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              Label
            </label>
            <input
              type="text"
              value={element.label || ''}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              style={{
                width: '100%',
                padding: '6px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
          </div>
        )}

        {/* Wall-specific properties */}
        {element.type === 'wall' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              Thickness
            </label>
            <input
              type="number"
              value={element.thickness || 8}
              onChange={(e) => handleUpdate({ thickness: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '6px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
          </div>
        )}

        {/* Color picker */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
            Color
          </label>
          <input
            type="color"
            value={element.color || '#374151'}
            onChange={(e) => handleUpdate({ color: e.target.value })}
            style={{
              width: '100%',
              height: '32px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Element info */}
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          background: '#f3f4f6', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#374151'
        }}>
          <div><strong>ID:</strong> {element.id}</div>
          <div><strong>Type:</strong> {element.type}</div>
          {element.type === 'wall' && element.points && (
            <div><strong>Points:</strong> {element.points.length / 2} points</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
