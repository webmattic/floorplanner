import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sun, Moon, Cloud, CloudSun } from "lucide-react";
import { Slider } from "../components/ui/slider.tsx";
import useFloorPlanStore from "../stores/floorPlanStore";

interface LightingPreset {
  name: string;
  icon: React.ReactNode;
  settings: {
    intensity: number;
    temperature: number;
    ambientLight: number;
  };
}

const LightingControls: React.FC = () => {
  // State for lighting parameters
  const [intensity, setIntensity] = useState(75);
  const [temperature, setTemperature] = useState(50);
  const [ambientLight, setAmbientLight] = useState(30);

  // Define lighting presets
  const presets: LightingPreset[] = [
    {
      name: "Morning",
      icon: <CloudSun className="h-5 w-5" />,
      settings: {
        intensity: 60,
        temperature: 40, // Cooler
        ambientLight: 35,
      },
    },
    {
      name: "Noon",
      icon: <Sun className="h-5 w-5" />,
      settings: {
        intensity: 90,
        temperature: 50, // Neutral
        ambientLight: 25,
      },
    },
    {
      name: "Evening",
      icon: <Cloud className="h-5 w-5" />,
      settings: {
        intensity: 50,
        temperature: 70, // Warmer
        ambientLight: 40,
      },
    },
    {
      name: "Night",
      icon: <Moon className="h-5 w-5" />,
      settings: {
        intensity: 30,
        temperature: 75, // Very warm
        ambientLight: 60,
      },
    },
  ];

  // Apply preset
  const applyPreset = (preset: LightingPreset) => {
    setIntensity(preset.settings.intensity);
    setTemperature(preset.settings.temperature);
    setAmbientLight(preset.settings.ambientLight);

    // Apply lighting to the scene
    updateLighting(
      preset.settings.intensity,
      preset.settings.temperature,
      preset.settings.ambientLight
    );
  };

  // Update lighting in the store/scene
  const updateLighting = (
    intensity: number,
    temperature: number,
    ambientLight: number
  ) => {
    // Convert values to what Three.js expects
    const lightIntensity = intensity / 100;
    const colorTemp = mapToKelvin(temperature);
    const ambientIntensity = ambientLight / 100;

    // Update scene lighting
    const floorPlanStore = useFloorPlanStore.getState();

    // Check if updateLighting method exists
    if (floorPlanStore.updateSceneLighting) {
      floorPlanStore.updateSceneLighting({
        mainLight: lightIntensity,
        ambientLight: ambientIntensity,
        temperature: colorTemp,
      });
    } else {
      console.log("Lighting update - values to be implemented in store:", {
        mainLight: lightIntensity,
        ambientLight: ambientIntensity,
        temperature: colorTemp,
      });
    }
  };

  // Map slider value (0-100) to color temperature in Kelvin (1000K-10000K)
  const mapToKelvin = (value: number): number => {
    // Map 0-100 to 10000-2000 (higher value = warmer)
    return 10000 - (value / 100) * 8000;
  };

  // Convert Kelvin to RGB for preview
  const kelvinToRGB = (kelvin: number): string => {
    let r, g, b;

    // Temperature to RGB conversion algorithm
    // Approximation based on common color temperature charts
    if (kelvin < 6600) {
      r = 255;
      g = kelvin / 100 - 2;
      b = kelvin < 2000 ? 0 : ((kelvin - 2000) / 4000) * 255;
    } else {
      r = Math.max(
        0,
        329.698727446 * Math.pow(kelvin / 100 - 60, -0.1332047592)
      );
      g = Math.max(
        0,
        288.1221695283 * Math.pow(kelvin / 100 - 60, -0.0755148492)
      );
      b = 255;
    }

    // Clamp and convert to hex
    return `rgb(${Math.min(255, Math.max(0, Math.round(r)))}, ${Math.min(
      255,
      Math.max(0, Math.round(g))
    )}, ${Math.min(255, Math.max(0, Math.round(b)))})`;
  };

  // Color temperature preview
  const tempColor = kelvinToRGB(mapToKelvin(temperature));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Lighting
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lighting presets */}
        <div>
          <label className="block text-sm font-medium mb-3">Time of Day</label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center justify-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                {preset.icon}
                <span className="text-xs mt-1">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium mb-2">
            <span>Light Intensity</span>
            <span className="text-xs text-muted-foreground">{intensity}%</span>
          </label>
          <Slider
            value={[intensity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value: number[]) => {
              setIntensity(value[0]);
              updateLighting(value[0], temperature, ambientLight);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Dim</span>
            <span>Bright</span>
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium mb-2">
            <span>Color Temperature</span>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tempColor }}
              />
              <span className="text-xs text-muted-foreground">
                {Math.round(mapToKelvin(temperature))}K
              </span>
            </div>
          </label>
          <Slider
            value={[temperature]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value: number[]) => {
              setTemperature(value[0]);
              updateLighting(intensity, value[0], ambientLight);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Cool</span>
            <span>Warm</span>
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium mb-2">
            <span>Ambient Light</span>
            <span className="text-xs text-muted-foreground">
              {ambientLight}%
            </span>
          </label>
          <Slider
            value={[ambientLight]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value: number[]) => {
              setAmbientLight(value[0]);
              updateLighting(intensity, temperature, value[0]);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Soft</span>
            <span>Strong</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LightingControls;
