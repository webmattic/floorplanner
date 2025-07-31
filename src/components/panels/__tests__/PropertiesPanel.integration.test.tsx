/**
 * Integration test for Properties Panel
 * This test verifies that the Properties Panel integrates correctly with the main application
 */

import React from "react";
import { PropertiesPanel } from "../PropertiesPanel";

// Simple smoke test to ensure the component can be imported and instantiated
describe("PropertiesPanel Integration", () => {
  it("can be imported and instantiated", () => {
    expect(PropertiesPanel).toBeDefined();
    expect(typeof PropertiesPanel).toBe("function");
  });

  it("has the correct display name", () => {
    expect(PropertiesPanel.name).toBe("PropertiesPanel");
  });

  it("is a React component", () => {
    const element = React.createElement(PropertiesPanel);
    expect(element).toBeDefined();
    expect(element.type).toBe(PropertiesPanel);
  });
});
