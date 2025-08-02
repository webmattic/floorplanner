import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { Input } from "./ui/input";
import {
  Eye,
  Heart,
  Share2,
  Download,
  Search,
  Grid,
  List,
  Filter,
} from "lucide-react";
import useFloorPlanStore from "../stores/floorPlanStore";

interface FloorPlan {
  id: number;
  title: string;
  description: string;
  user: string;
  professional: string | null;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_template: boolean;
  thumbnail_url: string | null;
}

interface GalleryProps {
  showPublicOnly?: boolean;
  showTemplatesOnly?: boolean;
  allowEdit?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({
  showPublicOnly = false,
  showTemplatesOnly = false,
  allowEdit: _allowEdit = false,
}) => {
  const [floorplans, setFloorplans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "public" | "templates">("all");

  const { apiConfig } = useFloorPlanStore();

  useEffect(() => {
    loadFloorplans();
  }, [filter]);

  const loadFloorplans = async () => {
    if (!apiConfig?.baseUrl) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = "/api/floorplans/";

      // Add query parameters based on filters
      const params = new URLSearchParams();
      if (showPublicOnly || filter === "public") {
        params.append("is_public", "true");
      }
      if (showTemplatesOnly || filter === "templates") {
        params.append("is_template", "true");
      }

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load floorplans");
      }

      const data = await response.json();
      setFloorplans(data.results || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (floorplan: FloorPlan) => {
    const shareUrl = `${window.location.origin}/floorplanner/gallery/${floorplan.id}/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: floorplan.title,
          text: floorplan.description,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Link copied to clipboard!");
      });
  };

  const handleLike = async (floorplan: FloorPlan) => {
    // TODO: Implement like functionality
    console.log("Liking floorplan:", floorplan.title);
    alert("Like feature coming soon!");
  };

  const handleView = (floorplan: FloorPlan) => {
    // Navigate to floorplan detail or open in editor
    window.open(`/floorplanner/${floorplan.id}/`, "_blank");
  };

  const handleDownload = async (floorplan: FloorPlan) => {
    // TODO: Implement download functionality
    console.log("Downloading floorplan:", floorplan.title);
    alert("Download feature coming soon!");
  };

  const filteredFloorplans = floorplans.filter(
    (floorplan) =>
      floorplan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      floorplan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      floorplan.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFloorplanCard = (floorplan: FloorPlan) => (
    <Card
      key={floorplan.id}
      className="overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-video bg-gray-100 relative">
        {floorplan.thumbnail_url ? (
          <img
            src={floorplan.thumbnail_url}
            alt={floorplan.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Grid className="h-12 w-12" />
          </div>
        )}

        {/* Overlay buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleView(floorplan)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleShare(floorplan)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDownload(floorplan)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">
            {floorplan.title}
          </h3>
          <div className="flex gap-1">
            {floorplan.is_public && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
            {floorplan.is_template && (
              <Badge variant="outline" className="text-xs">
                Template
              </Badge>
            )}
          </div>
        </div>

        {floorplan.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {floorplan.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>by {floorplan.user}</span>
          <span>{new Date(floorplan.updated_at).toLocaleDateString()}</span>
        </div>

        {floorplan.professional && (
          <div className="mt-2 text-xs text-blue-600">
            Professional: {floorplan.professional}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLike(floorplan)}
            className="flex-1"
          >
            <Heart className="h-3 w-3 mr-1" />
            Like
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(floorplan)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFloorplanList = (floorplan: FloorPlan) => (
    <Card key={floorplan.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            {floorplan.thumbnail_url ? (
              <img
                src={floorplan.thumbnail_url}
                alt={floorplan.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Grid className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {floorplan.title}
              </h3>
              <div className="flex gap-1 ml-2">
                {floorplan.is_public && (
                  <Badge variant="secondary" className="text-xs">
                    Public
                  </Badge>
                )}
                {floorplan.is_template && (
                  <Badge variant="outline" className="text-xs">
                    Template
                  </Badge>
                )}
              </div>
            </div>

            {floorplan.description && (
              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                {floorplan.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>by {floorplan.user}</span>
              <span>{new Date(floorplan.updated_at).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleView(floorplan)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare(floorplan)}
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLike(floorplan)}
              >
                <Heart className="h-3 w-3 mr-1" />
                Like
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading gallery...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Error: {error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadFloorplans}
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
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">FloorPlan Gallery</h2>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search floorplans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "public" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("public")}
          >
            <Filter className="h-3 w-3 mr-1" />
            Public
          </Button>
          <Button
            variant={filter === "templates" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("templates")}
          >
            Templates
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 mb-4">
        {filteredFloorplans.length} floorplan
        {filteredFloorplans.length !== 1 ? "s" : ""} found
      </div>

      {/* Gallery Content */}
      <ScrollArea className="h-96">
        {filteredFloorplans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Grid className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No floorplans found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFloorplans.map(renderFloorplanCard)}
          </div>
        ) : (
          <div>{filteredFloorplans.map(renderFloorplanList)}</div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Gallery;
