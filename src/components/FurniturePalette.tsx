import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { Input } from "./ui/input";
import { Search, Grid, Package, Sofa, Bed, Lamp, Table } from "lucide-react";
import { DraggableFurniture, FurnitureItemData } from "./DraggableFurniture";

interface FurniturePaletteProps {
  onItemSelect?: (item: FurnitureItemData) => void;
}

const FurniturePalette: React.FC<FurniturePaletteProps> = ({
  onItemSelect,
}) => {
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock furniture data - In a real app, this would come from an API
  const mockFurnitureData: FurnitureItemData[] = [
    {
      id: 1,
      name: "Modern Sofa",
      category: "seating",
      description: "Comfortable 3-seater modern sofa",
      price: 15999,
      dimensions: { width: 200, height: 80, depth: 90 },
      style: "modern",
      material: "fabric",
      color: "gray",
    },
    {
      id: 2,
      name: "Dining Table",
      category: "tables",
      description: "Wooden dining table for 6 people",
      price: 12999,
      dimensions: { width: 180, height: 75, depth: 90 },
      style: "classic",
      material: "wood",
      color: "brown",
    },
    {
      id: 3,
      name: "Office Chair",
      category: "seating",
      description: "Ergonomic office chair with lumbar support",
      price: 8999,
      dimensions: { width: 60, height: 110, depth: 60 },
      style: "modern",
      material: "mesh",
      color: "black",
    },
    {
      id: 4,
      name: "Floor Lamp",
      category: "lighting",
      description: "Contemporary floor lamp with adjustable arm",
      price: 2999,
      dimensions: { width: 40, height: 160, depth: 40 },
      style: "modern",
      material: "metal",
      color: "black",
    },
    {
      id: 5,
      name: "Coffee Table",
      category: "tables",
      description: "Glass top coffee table with metal legs",
      price: 5999,
      dimensions: { width: 120, height: 45, depth: 60 },
      style: "modern",
      material: "glass",
      color: "clear",
    },
    {
      id: 6,
      name: "Bookshelf",
      category: "storage",
      description: "5-tier wooden bookshelf",
      price: 4999,
      dimensions: { width: 80, height: 180, depth: 30 },
      style: "classic",
      material: "wood",
      color: "brown",
    },
    {
      id: 7,
      name: "Bed Frame",
      category: "bedroom",
      description: "Queen size bed frame with headboard",
      price: 18999,
      dimensions: { width: 160, height: 120, depth: 200 },
      style: "modern",
      material: "wood",
      color: "white",
    },
    {
      id: 8,
      name: "Wardrobe",
      category: "storage",
      description: "3-door wardrobe with mirror",
      price: 22999,
      dimensions: { width: 150, height: 200, depth: 60 },
      style: "classic",
      material: "wood",
      color: "brown",
    },
    {
      id: 9,
      name: "Side Table",
      category: "tables",
      description: "Bedside table with drawer",
      price: 2999,
      dimensions: { width: 40, height: 55, depth: 35 },
      style: "modern",
      material: "wood",
      color: "white",
    },
    {
      id: 10,
      name: "Ceiling Light",
      category: "lighting",
      description: "Modern LED ceiling light",
      price: 3999,
      dimensions: { width: 60, height: 15, depth: 60 },
      style: "modern",
      material: "metal",
      color: "white",
    },
  ];

  const categories = [
    { id: "all", name: "All Items", icon: Grid },
    { id: "seating", name: "Seating", icon: Sofa },
    { id: "tables", name: "Tables", icon: Table },
    { id: "lighting", name: "Lighting", icon: Lamp },
    { id: "storage", name: "Storage", icon: Package },
    { id: "bedroom", name: "Bedroom", icon: Bed },
  ];

  useEffect(() => {
    loadFurniture();
  }, []);

  const loadFurniture = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${apiConfig?.baseUrl}/api/furniture/`);
      // const data = await response.json();
      // setFurnitureItems(data);

      // For now, use mock data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading
      setFurnitureItems(mockFurnitureData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleItemAdd = (item: FurnitureItemData) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
    // Add visual feedback
    alert(`Added ${item.name} to floorplan!`);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const IconComponent = category?.icon || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  const filteredItems = furnitureItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Furniture Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading furniture...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Furniture Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Error: {error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadFurniture}
              className="ml-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Furniture Library
          <Badge variant="secondary">{filteredItems.length}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search furniture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-1 text-xs"
              >
                {getCategoryIcon(category.id)}
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Furniture Items */}
        <ScrollArea className="h-80">
          <div className="p-4 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No furniture items found</p>
                <p className="text-sm">Try adjusting your search or category</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="mb-3">
                  <DraggableFurniture
                    item={item}
                    onAdd={handleItemAdd}
                    getCategoryIcon={getCategoryIcon}
                  />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FurniturePalette;
