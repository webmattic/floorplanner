import React, { useState } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Download,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  Zap,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

export const EnhancedSocialSharePanel: React.FC = () => {
  const { currentFloorPlan } = useFloorPlanStore();
  const [activeTab, setActiveTab] = useState("share");
  const [isGenerating, setIsGenerating] = useState(false);

  const socialPlatforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "#1DA1F2" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  ];

  const handleShare = (platform: string) => {
    if (!currentFloorPlan) return;

    const shareUrl = window.location.href;
    const shareText = `Check out my floor plan: ${currentFloorPlan.title}`;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      instagram: shareUrl, // Instagram doesn't support direct URL sharing
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(
        urls[platform as keyof typeof urls],
        "_blank",
        "width=600,height=400"
      );
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  const handleGenerateImage = () => {
    setIsGenerating(true);
    // Simulate image generation
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would generate and download an image
      alert("Image generation would happen here in a full implementation");
    }, 2000);
  };

  return (
    <FloatingPanel panelId="socialShare">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Share
          </h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4">
            {!currentFloorPlan ? (
              <Alert>
                <AlertDescription>
                  Create or load a floor plan to share it.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Share on Social Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {socialPlatforms.map((platform) => {
                        const IconComponent = platform.icon;
                        return (
                          <Button
                            key={platform.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(platform.id)}
                            className="flex items-center gap-2"
                          >
                            <IconComponent
                              className="h-4 w-4"
                              style={{ color: platform.color }}
                            />
                            {platform.name}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Direct Link</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Export for Social Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !currentFloorPlan}
                  className="w-full"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {isGenerating ? "Generating..." : "Generate Image"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!currentFloorPlan}
                  className="w-full"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Export as PDF
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!currentFloorPlan}
                  className="w-full"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Assets
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Social media analytics will be available when connected to a
                backend service.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mock Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Shares:</span>
                  <Badge variant="secondary">42</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Views:</span>
                  <Badge variant="secondary">1,234</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Likes:</span>
                  <Badge variant="secondary">89</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FloatingPanel>
  );
};
