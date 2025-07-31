import React, { useState, useCallback, useEffect } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator.tsx";
import { Badge } from "../ui/badge.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Progress } from "../ui/progress.tsx";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox.tsx";
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
  Image,
  Video,
  Palette,
  Sparkles,
  RefreshCw,
  Heart,
  Send,
  Calendar,
  Settings,
  TrendingUp,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
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

interface SocialPost {
  id: string;
  platform: "instagram" | "facebook" | "twitter" | "linkedin";
  content: string;
  image_url: string;
  status: "draft" | "scheduled" | "posting" | "posted" | "failed";
  scheduled_at?: Date;
  posted_at?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  error_message?: string;
}

interface SocialTemplate {
  id: string;
  name: string;
  platform: "instagram" | "facebook" | "twitter" | "linkedin" | "all";
  template: string;
  hashtags: string[];
  style: {
    overlay_color: string;
    text_color: string;
    font_size: number;
    logo_position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
    watermark_opacity: number;
  };
}

interface BrandingOptions {
  logo_url?: string;
  watermark_enabled: boolean;
  brand_colors: string[];
  custom_hashtags: string[];
  company_name?: string;
  website_url?: string;
  auto_branding: boolean;
}

interface SocialAnalytics {
  total_shares: number;
  platform_breakdown: Record<string, number>;
  engagement_rate: number;
  best_performing_post: string;
  optimal_posting_times: string[];
}

export const EnhancedSocialSharePanel: React.FC = () => {
  const { currentFloorPlan, apiConfig } = useFloorPlanStore();
  
  // Basic sharing state
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Enhanced social media features
  const [activeTab, setActiveTab] = useState("share");
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [socialTemplates, setSocialTemplates] = useState<SocialTemplate[]>([]);
  const [brandingOptions, setBrandingOptions] = useState<BrandingOptions>({
    watermark_enabled: true,
    brand_colors: ["#3b82f6", "#1e40af", "#1d4ed8"],
    custom_hashtags: ["#floorplan", "#interiordesign", "#homedecor"],
    auto_branding: true,
  });
  const [socialAnalytics, setSocialAnalytics] = useState<SocialAnalytics | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customContent, setCustomContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [isConnectedToSocial, setIsConnectedToSocial] = useState({
    instagram: false,
    facebook: false,
    twitter: false,
    linkedin: false,
  });

  // Load social media templates and analytics
  useEffect(() => {
    loadSocialTemplates();
    loadSocialAnalytics();
    checkSocialConnections();
  }, []);

  const loadSocialTemplates = async () => {
    try {
      const response = await fetch(`${apiConfig?.baseUrl}/social/templates/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSocialTemplates(data.results || []);
      }
    } catch (error) {
      console.error("Failed to load social templates:", error);
    }
  };

  const loadSocialAnalytics = async () => {
    if (!currentFloorPlan) return;
    
    try {
      const response = await fetch(
        `${apiConfig?.baseUrl}/social/analytics/${currentFloorPlan.id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSocialAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to load social analytics:", error);
    }
  };

  const checkSocialConnections = async () => {
    try {
      const response = await fetch(`${apiConfig?.baseUrl}/social/connections/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsConnectedToSocial(data);
      }
    } catch (error) {
      console.error("Failed to check social connections:", error);
    }
  };

  const generateBrandedImage = async (platform: string) => {
    if (!currentFloorPlan) return null;

    setIsGeneratingContent(true);
    try {
      const response = await fetch(`${apiConfig?.baseUrl}/social/generate-image/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          floorplan_id: currentFloorPlan.id,
          platform,
          branding: brandingOptions,
          template_id: selectedTemplate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.image_url;
      }
    } catch (error) {
      console.error("Failed to generate branded image:", error);
    } finally {
      setIsGeneratingContent(false);
    }
    return null;
  };

  const generateSocialContent = async (platform: string) => {
    if (!currentFloorPlan) return "";

    try {
      const response = await fetch(`${apiConfig?.baseUrl}/social/generate-content/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          floorplan_id: currentFloorPlan.id,
          platform,
          template_id: selectedTemplate,
          custom_hashtags: brandingOptions.custom_hashtags,
          company_name: brandingOptions.company_name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content;
      }
    } catch (error) {
      console.error("Failed to generate social content:", error);
    }
    return "";
  };

  const createSocialPost = async (platform: string, content: string, imageUrl: string, scheduleDate?: Date) => {
    const newPost: SocialPost = {
      id: `post_${Date.now()}_${platform}`,
      platform: platform as SocialPost["platform"],
      content,
      image_url: imageUrl,
      status: scheduleDate ? "scheduled" : "draft",
      scheduled_at: scheduleDate,
    };

    setSocialPosts(prev => [...prev, newPost]);
    return newPost;
  };

  const postToSocialMedia = async (postId: string) => {
    const post = socialPosts.find(p => p.id === postId);
    if (!post) return;

    setSocialPosts(prev => 
      prev.map(p => p.id === postId ? { ...p, status: "posting" } : p)
    );

    try {
      const response = await fetch(`${apiConfig?.baseUrl}/social/post/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          platform: post.platform,
          content: post.content,
          image_url: post.image_url,
          scheduled_at: post.scheduled_at,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSocialPosts(prev => 
          prev.map(p => p.id === postId ? { 
            ...p, 
            status: "posted", 
            posted_at: new Date(),
            engagement: data.engagement 
          } : p)
        );
      } else {
        throw new Error("Failed to post");
      }
    } catch (error) {
      console.error("Failed to post to social media:", error);
      setSocialPosts(prev => 
        prev.map(p => p.id === postId ? { 
          ...p, 
          status: "failed", 
          error_message: error instanceof Error ? error.message : "Unknown error"
        } : p)
      );
    }
  };

  const handleCreatePost = async () => {
    if (!currentFloorPlan || selectedPlatforms.length === 0) return;

    setIsGeneratingContent(true);

    for (const platform of selectedPlatforms) {
      try {
        // Generate branded image
        const imageUrl = await generateBrandedImage(platform);
        if (!imageUrl) continue;

        // Generate or use custom content
        const content = customContent || await generateSocialContent(platform);
        
        // Create post
        const scheduleDate = scheduledDate ? new Date(scheduledDate) : undefined;
        const post = await createSocialPost(platform, content, imageUrl, scheduleDate);

        // Post immediately if not scheduled
        if (!scheduleDate) {
          await postToSocialMedia(post.id);
        }
      } catch (error) {
        console.error(`Failed to create post for ${platform}:`, error);
      }
    }

    setIsGeneratingContent(false);
  };

  const connectSocialAccount = (platform: string) => {
    // In a real implementation, this would open OAuth flow
    const authUrl = `${apiConfig?.baseUrl}/social/connect/${platform}/`;
    window.open(authUrl, "_blank", "width=600,height=400");
  };

  // Basic sharing functions (from original component)
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

  const generateQRCode = useCallback((url: string) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      url
    )}`;
    return qrCodeUrl;
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return Instagram;
      case "facebook": return Facebook;
      case "twitter": return Twitter;
      case "linkedin": return Linkedin;
      default: return Share2;
    }
  };

  const getStatusIcon = (status: SocialPost["status"]) => {
    switch (status) {
      case "draft": return Edit;
      case "scheduled": return Clock;
      case "posting": return RefreshCw;
      case "posted": return CheckCircle;
      case "failed": return XCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <FloatingPanel panelId="socialShare">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Basic Sharing Tab */}
        <TabsContent value="share" className="space-y-4 mt-4">
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

              {/* Quick Social Share */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Quick Share</h4>
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
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <AlertDescription className="text-sm">
                Save your floor plan to enable sharing options.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Enhanced Social Media Tab */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Social Media Posts</h3>
            <Button onClick={handleCreatePost} size="sm" disabled={isGeneratingContent}>
              {isGeneratingContent ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Post
            </Button>
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Select Platforms</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(isConnectedToSocial).map(([platform, connected]) => {
                const Icon = getPlatformIcon(platform);
                return (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlatforms(prev => [...prev, platform]);
                        } else {
                          setSelectedPlatforms(prev => prev.filter(p => p !== platform));
                        }
                      }}
                      disabled={!connected}
                    />
                    <Label htmlFor={platform} className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4" />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      {!connected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => connectSocialAccount(platform)}
                          className="h-6 text-xs"
                        >
                          Connect
                        </Button>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label className="text-sm">Custom Content (Optional)</Label>
            <Textarea
              placeholder="Write your custom post content or leave empty for AI-generated content..."
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              rows={3}
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {socialTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Option */}
          <div className="space-y-2">
            <Label className="text-sm">Schedule Post (Optional)</Label>
            <Input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          {/* Recent Posts */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Posts</h4>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {socialPosts.map((post) => {
                  const Icon = getPlatformIcon(post.platform);
                  const StatusIcon = getStatusIcon(post.status);
                  return (
                    <Card key={post.id} className="p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{post.platform}</span>
                          <StatusIcon className={`h-3 w-3 ${
                            post.status === "posted" ? "text-green-500" :
                            post.status === "failed" ? "text-red-500" :
                            post.status === "posting" ? "text-blue-500 animate-spin" :
                            "text-gray-500"
                          }`} />
                        </div>
                        {post.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => postToSocialMedia(post.id)}
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {post.content}
                      </p>
                      {post.engagement && (
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.engagement.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.engagement.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {post.engagement.shares}
                          </span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4 mt-4">
          <h3 className="font-semibold">Brand Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto-branding</Label>
              <Switch
                checked={brandingOptions.auto_branding}
                onCheckedChange={(checked) =>
                  setBrandingOptions(prev => ({ ...prev, auto_branding: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Watermark</Label>
              <Switch
                checked={brandingOptions.watermark_enabled}
                onCheckedChange={(checked) =>
                  setBrandingOptions(prev => ({ ...prev, watermark_enabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Company Name</Label>
              <Input
                placeholder="Your Company Name"
                value={brandingOptions.company_name || ""}
                onChange={(e) =>
                  setBrandingOptions(prev => ({ ...prev, company_name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Website URL</Label>
              <Input
                placeholder="https://yourwebsite.com"
                value={brandingOptions.website_url || ""}
                onChange={(e) =>
                  setBrandingOptions(prev => ({ ...prev, website_url: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Custom Hashtags</Label>
              <Input
                placeholder="#hashtag1 #hashtag2 #hashtag3"
                value={brandingOptions.custom_hashtags.join(" ")}
                onChange={(e) =>
                  setBrandingOptions(prev => ({
                    ...prev,
                    custom_hashtags: e.target.value.split(" ").filter(tag => tag.startsWith("#"))
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Brand Colors</Label>
              <div className="flex gap-2">
                {brandingOptions.brand_colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      // In a real implementation, this would open a color picker
                      console.log("Open color picker for", color);
                    }}
                  />
                ))}
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <h3 className="font-semibold">Social Analytics</h3>

          {socialAnalytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-3">
                  <div className="text-2xl font-bold">{socialAnalytics.total_shares}</div>
                  <div className="text-xs text-muted-foreground">Total Shares</div>
                </Card>
                <Card className="p-3">
                  <div className="text-2xl font-bold">{socialAnalytics.engagement_rate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Engagement Rate</div>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Platform Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(socialAnalytics.platform_breakdown).map(([platform, count]) => {
                      const Icon = getPlatformIcon(platform);
                      const percentage = (count / socialAnalytics.total_shares) * 100;
                      return (
                        <div key={platform} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm capitalize">{platform}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Optimal Posting Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {socialAnalytics.optimal_posting_times.map((time, index) => (
                      <div key={index} className="text-sm">
                        {time}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Share your floor plans on social media to see analytics data.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
};