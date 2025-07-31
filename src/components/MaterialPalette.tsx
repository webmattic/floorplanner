import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { Input } from "./ui/input";
import { Search, Paintbrush } from "lucide-react";
// @ts-ignore - Importing local component
import { DraggableMaterial } from "./DraggableMaterial";
import useFloorPlanStore from "../stores/floorPlanStore";

export interface MaterialData {
  id: number;
  name: string;
  category: string; // 'wall', 'floor', 'fabric'
  previewUrl: string;
  textureUrl: string;
  color: string;
  description?: string;
}

const MaterialPalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Mock materials data - In a real app, this would come from an API
  const materials: MaterialData[] = [
    // Wall materials
    {
      id: 1,
      name: "Soft White",
      category: "wall",
      previewUrl: "/materials/wall-white.jpg",
      textureUrl: "/materials/textures/wall-white.jpg",
      color: "#f5f5f5",
      description: "Clean white wall finish",
    },
    {
      id: 2,
      name: "Classic Brick",
      category: "wall",
      previewUrl: "/materials/wall-brick.jpg",
      textureUrl: "/materials/textures/wall-brick.jpg",
      color: "#c1665a",
      description: "Traditional red brick texture",
    },
    {
      id: 3,
      name: "Modern Concrete",
      category: "wall",
      previewUrl: "/materials/wall-concrete.jpg",
      textureUrl: "/materials/textures/wall-concrete.jpg",
      color: "#ababab",
      description: "Sleek concrete finish",
    },
    // Floor materials
    {
      id: 4,
      name: "Oak Hardwood",
      category: "floor",
      previewUrl: "/materials/floor-wood.jpg",
      textureUrl: "/materials/textures/floor-wood.jpg",
      color: "#b2916d",
      description: "Natural oak planks",
    },
    {
      id: 5,
      name: "White Marble",
      category: "floor",
      previewUrl: "/materials/floor-marble.jpg",
      textureUrl: "/materials/textures/floor-marble.jpg",
      color: "#e8e8e8",
      description: "Luxury white marble tile",
    },
    {
      id: 6,
      name: "Grey Carpet",
      category: "floor",
      previewUrl: "/materials/floor-carpet.jpg",
      textureUrl: "/materials/textures/floor-carpet.jpg",
      color: "#7d7d7d",
      description: "Soft plush carpeting",
    },
    // Fabric materials
    {
      id: 7,
      name: "Blue Cotton",
      category: "fabric",
      previewUrl: "/materials/fabric-blue.jpg",
      textureUrl: "/materials/textures/fabric-blue.jpg",
      color: "#4a6da7",
      description: "Soft blue cotton fabric",
    },
    {
      id: 8,
      name: "Charcoal Linen",
      category: "fabric",
      previewUrl: "/materials/fabric-charcoal.jpg",
      textureUrl: "/materials/textures/fabric-charcoal.jpg",
      color: "#333333",
      description: "Dark linen upholstery",
    },
    {
      id: 9,
      name: "Beige Canvas",
      category: "fabric",
      previewUrl: "/materials/fabric-beige.jpg",
      textureUrl: "/materials/textures/fabric-beige.jpg",
      color: "#d7ceb2",
      description: "Natural beige canvas",
    },
  ];

  const handleApplyMaterial = (material: MaterialData) => {
    const store = useFloorPlanStore.getState();
    const { selectedElement, updateElement } = store;

    if (!selectedElement) {
      alert("Please select an element to apply material");
      return;
    }

    // Make sure updateElement method exists
    if (!updateElement) {
      console.error("updateElement method not available in store");
      return;
    }

    // Apply material based on type
    if (selectedElement.type === "wall" && material.category === "wall") {
      updateElement({
        material: material.textureUrl,
        color: material.color,
      });
    } else if (
      selectedElement.type === "room" &&
      material.category === "floor"
    ) {
      updateElement({
        material: material.textureUrl,
        color: material.color,
      });
    } else if (
      selectedElement.type === "furniture" &&
      material.category === "fabric"
    ) {
      updateElement({
        material: material.textureUrl,
        color: material.color,
      });
    } else {
      alert(
        `This ${material.category} material cannot be applied to the selected ${selectedElement.type}`
      );
    }
  };

  // Filter materials based on search and category
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || material.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Materials
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Search input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-4 p-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="wall">Walls</TabsTrigger>
            <TabsTrigger value="floor">Floors</TabsTrigger>
            <TabsTrigger value="fabric">Fabrics</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] p-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredMaterials.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Paintbrush className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No materials found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              ) : (
                filteredMaterials.map((material) => (
                  <DraggableMaterial
                    key={material.id}
                    material={material}
                    onApply={handleApplyMaterial}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MaterialPalette;
