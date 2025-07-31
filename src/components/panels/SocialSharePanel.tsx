import React, { useState, useCallback } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator.tsx";
import { Badge } from "../ui/badge.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Share2,
  Link2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  Users,
  Mail,
  MessageSquare,
  QrCode,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

interface ShareLink {
  id: string;
  url: string;
  accessLevel: "view" | "edit";
  expiresAt?: string;
  password?: string;
  isActive: boolean;
}

export const SocialSharePanel: React.FC = () => {
  const { currentFloorPlan } = useFloorPlanStore();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const generateShareLink = useCallback(
    (accessLevel: "view" | "edit") => {
      const newLink: ShareLink = {
        id: `link_${Date.now()}`,
        url: `${window.location.origin}/floorplan/share/${
          currentFloorPlan?.id
        }?access=${accessLevel}&token=${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        accessLevel,
        isActive: true,
      };

      if (sharePassword) {
        newLink.password = sharePassword;
      }

      setShareLinks((prev) => [...prev, newLink]);
      return newLink;
    },
    [currentFloorPlan, sharePassword]
  );

  const copyToClipboard = useCallback(async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, []);

  const shareToSocialMedia = useCallback(
    (platform: string, url: string) => {
      const message = shareMessage || `Check out my floor plan design!`;
      const encodedUrl = encodeURIComponent(url);
      const encodedMessage = encodeURIComponent(message);

      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
        email: `mailto:?subject=${encodedMessage}&body=${encodedUrl}`,
      };

      const shareUrl = shareUrls[platform as keyof typeof shareUrls];
      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
      }
    },
    [shareMessage]
  );

  const toggleLinkStatus = useCallback((linkId: string) => {
    setShareLinks((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, isActive: !link.isActive } : link
      )
    );
  }, []);

  const deleteLink = useCallback((linkId: string) => {
    setShareLinks((prev) => prev.filter((link) => link.id !== linkId));
  }, []);

  const generateQRCode = useCallback((url: string) => {
    // In a real implementation, you would use a QR code library
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      url
    )}`;
    return qrCodeUrl;
  }, []);

  return (
    <FloatingPanel panelId="socialShare">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Share & Collaborate</h3>
        </div>

        {currentFloorPlan ? (
          <>
            {/* Public/Private Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  <Label htmlFor="public-toggle" className="text-sm">
                    Public Access
                  </Label>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "Anyone with the link can view this floor plan"
                  : "Only people you share with can access this floor plan"}
              </p>
            </div>

            <Separator />

            {/* Share Message */}
            <div className="space-y-2">
              <Label className="text-sm">Custom Message (Optional)</Label>
              <Input
                placeholder="Add a message to share with your floor plan..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <Label className="text-sm">Password Protection (Optional)</Label>
              <Input
                type="password"
                placeholder="Enter password for shared links"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                className="text-xs"
              />
            </div>

            <Separator />

            {/* Generate Share Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Generate Share Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateShareLink("view")}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">View Only</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateShareLink("edit")}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Collaborate</span>
                </Button>
              </div>
            </div>

            {/* Active Share Links */}
            {shareLinks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Active Share Links</h4>
                <div className="space-y-2">
                  {shareLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`p-3 border rounded-lg space-y-2 ${
                        link.isActive ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            link.accessLevel === "edit"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {link.accessLevel === "edit"
                            ? "Edit Access"
                            : "View Only"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(link.url, link.id)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedLinkId === link.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowQRCode(!showQRCode)}
                            className="h-6 w-6 p-0"
                          >
                            <QrCode className="h-3 w-3" />
                          </Button>
                          <Switch
                            checked={link.isActive}
                            onCheckedChange={() => toggleLinkStatus(link.id)}
                            className="scale-75"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {link.url}
                      </div>
                      {link.password && (
                        <div className="text-xs text-amber-600">
                          🔒 Password protected
                        </div>
                      )}
                      {showQRCode && (
                        <div className="flex justify-center">
                          <img
                            src={generateQRCode(link.url)}
                            alt="QR Code"
                            className="w-24 h-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Social Media Sharing */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Share on Social Media</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    shareToSocialMedia(
                      "facebook",
                      shareLinks[0]?.url || window.location.href
                    )
                  }
                  className="flex items-center gap-1 p-2"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    shareToSocialMedia(
                      "twitter",
                      shareLinks[0]?.url || window.location.href
                    )
                  }
                  className="flex items-center gap-1 p-2"
                >
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    shareToSocialMedia(
                      "linkedin",
                      shareLinks[0]?.url || window.location.href
                    )
                  }
                  className="flex items-center gap-1 p-2"
                >
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    shareToSocialMedia(
                      "whatsapp",
                      shareLinks[0]?.url || window.location.href
                    )
                  }
                  className="flex items-center gap-1 p-2"
                >
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="sr-only">WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    shareToSocialMedia(
                      "telegram",
                      shareLinks[0]?.url || window.location.href
                    )
                  }
                  className="flex items-center gap-1 p-2"
                >
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="sr-only">Telegram</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    shareToSocialMedia(
                      "email",
                      shareLinks[0]?.url || window.location.href
                    )
                  }
                  className="flex items-center gap-1 p-2"
                >
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="sr-only">Email</span>
                </Button>
              </div>
            </div>

            {/* Native Share API */}
            {navigator.share && (
              <>
                <Separator />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    navigator.share({
                      title: currentFloorPlan.title || "My Floor Plan",
                      text: shareMessage || "Check out my floor plan design!",
                      url: shareLinks[0]?.url || window.location.href,
                    });
                  }}
                  className="w-full flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Share via Device</span>
                </Button>
              </>
            )}
          </>
        ) : (
          <Alert>
            <AlertDescription className="text-sm">
              Save your floor plan to enable sharing options.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </FloatingPanel>
  );
};

export default SocialSharePanel;
