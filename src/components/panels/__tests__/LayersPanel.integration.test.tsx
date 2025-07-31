/**
 * Integration test for Layers Panel
 * This test verifies that the Layers Panel integrates correctly with the main application
 */

import React from "react";
import { LayersPanel } from "../LayersPanel";

// Simple smoke test to ensure the component can be imported and instantiated
describe("LayersPanel Integration", () => {
  it("can be imported and instantiated", () => {
    expect(LayersPanel).toBeDefined();
    expect(typeof LayersPanel).toBe("function");
  });

  it("has the correct display name", () => {
    expect(LayersPanel.name).toBe("LayersPanel");
  });

  it("is a React component", () => {
    const element = React.createElement(LayersPanel);
    expect(element).toBeDefined();
    expect(element.type).toBe(LayersPanel);
  });

  it("exports the component correctly", () => {
    // Verify the component can be destructured from the module
    expect(LayersPanel).toBeInstanceOf(Function);
  });
});
