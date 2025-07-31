import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge.tsx";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { Star, MapPin, Users, MessageCircle } from "lucide-react";
import useFloorPlanStore from "../stores/floorPlanStore";

interface Professional {
  id: number;
  business_name: string;
  user: string;
  category: string | null;
  city: string;
  state: string;
  rating: number;
  review_count: number;
  short_bio: string;
  is_verified: boolean;
  profile_photo: string | null;
}

interface ProfessionalSuggestionsProps {
  floorplanId: number;
  onCollaborationRequest?: (professionalId: number) => void;
}

const ProfessionalSuggestions: React.FC<ProfessionalSuggestionsProps> = ({
  floorplanId,
  onCollaborationRequest,
}) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestingCollaboration, setRequestingCollaboration] = useState<
    number | null
  >(null);

  const { apiConfig } = useFloorPlanStore();

  useEffect(() => {
    loadProfessionals();
  }, [floorplanId]);

  const loadProfessionals = async () => {
    if (!apiConfig?.baseUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/api/floorplans/${floorplanId}/suggest_professionals/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load professional suggestions");
      }

      const data = await response.json();
      setProfessionals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const requestCollaboration = async (professionalId: number) => {
    if (!apiConfig?.baseUrl) return;

    setRequestingCollaboration(professionalId);

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/api/floorplans/${floorplanId}/collaborate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            professional_id: professionalId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request collaboration");
      }

      // Success notification
      if (onCollaborationRequest) {
        onCollaborationRequest(professionalId);
      }

      // Remove the professional from suggestions or mark as requested
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === professionalId ? { ...p, requested: true } : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setRequestingCollaboration(null);
    }
  };

  const renderRating = (rating: number, reviewCount: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({reviewCount})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Professional Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading suggestions...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Professional Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Error: {error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadProfessionals}
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
          <Users className="h-5 w-5" />
          Professional Suggestions
          <Badge variant="secondary">{professionals.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-4 p-4">
            {professionals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No professional suggestions available</p>
                <p className="text-sm">
                  Try adding more details to your floorplan
                </p>
              </div>
            ) : (
              professionals.map((professional) => (
                <Card key={professional.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-12 w-12">
                        {professional.profile_photo ? (
                          <AvatarImage
                            src={professional.profile_photo}
                            alt={professional.business_name}
                          />
                        ) : (
                          <AvatarFallback>
                            {professional.business_name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm leading-5">
                              {professional.business_name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              by {professional.user}
                            </p>
                          </div>
                          {professional.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>

                        {professional.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {professional.category}
                          </Badge>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          {professional.rating > 0 && (
                            <div className="flex items-center gap-1">
                              {renderRating(
                                professional.rating,
                                professional.review_count
                              )}
                            </div>
                          )}
                          {professional.city && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {professional.city}
                              {professional.state && `, ${professional.state}`}
                            </div>
                          )}
                        </div>

                        {professional.short_bio && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {professional.short_bio}
                          </p>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() =>
                              requestCollaboration(professional.id)
                            }
                            disabled={
                              requestingCollaboration === professional.id
                            }
                            className="text-xs"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {requestingCollaboration === professional.id
                              ? "Requesting..."
                              : "Request Collaboration"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProfessionalSuggestions;
