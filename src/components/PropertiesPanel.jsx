import React from "react";
import useFloorPlanStore from "../stores/floorPlanStore.js";

const PropertiesPanel = () => {
  const { selectedElement, updateElement } = useFloorPlanStore();

  if (!selectedElement) {
    return (
      <div className="properties-placeholder">
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateElement({ [name]: value });
  };

  return (
    <div>
      <h4 className="font-bold mb-2">{selectedElement.type} Properties</h4>
      {/* Example: Wall thickness */}
      {selectedElement.type === "wall" && (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Thickness
          </label>
          <input
            type="number"
            name="thickness"
            value={selectedElement.thickness || 5}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
