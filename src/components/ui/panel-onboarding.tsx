import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge.tsx";
import { Progress } from "./progress.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.tsx";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  Keyboard,
  Mouse,
  Smartphone,
  Monitor,
  Zap,
  Star,
  ArrowRight,
  Eye,
  Move,
  Settings,
} from "lucide-react";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: () => void;
  panelId?: string;
  position?: { x: number; y: number };
  highlight?: boolean;
}

interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  category: "beginner" | "intermediate" | "advanced";
}

export const PanelOnboarding: React.FC = () => {
  const {
    showPanel,
    hidePanel,
    focusPanel,
    resetPanelLayout,
    createWorkspaceLayout,
  } = usePanelStore();

  const [isOpen, setIsOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOnFirstVisit, setShowOnFirstVisit] = useState(true);

  // Define onboarding tours
  const tours: OnboardingTour[] = [
    {
      id: "getting-started",
      name: "Getting Started",
      description: "Learn the basics of the panel system",
      category: "beginner",
      steps: [
        {
          id: "welcome",
          title: "Welcome to FloorPlanner!",
          description: "Let's take a quick tour of the floating panel system",
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-lg">
                  FloorPlanner uses a flexible panel system that lets you customize your workspace exactly how you want it.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-blue-500" />
                  <span>Drag panels anywhere</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span>Show/hide as needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-500" />
                  <span>Customize layouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-orange-500" />
                  <span>Keyboard shortcuts</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "drawing-tools",
          title: "Drawing Tools Panel",
          description: "Your main toolkit for creating floor plans",
          panelId: "drawingTools",
          content: (
            <div className="space-y-3">
              <p>The Drawing Tools panel contains all the tools you need to create your floor plan:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Wall tool for drawing walls</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Room tool for creating rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span>Door and window tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Measurement tools</span>
                </li>
              </ul>
            </div>
          ),
          action: () => showPanel("drawingTools"),
        },
        {
          id: "furniture-library",
          title: "Furniture Library",
          description: "Browse and add furniture to your floor plan",
          panelId: "furnitureLibrary",
          content: (
            <div className="space-y-3">
              <p>The Furniture Library lets you add furniture to your design:</p>
              <ul className="space-y-2 text-sm">
                <li>• Browse furniture by category</li>
                <li>• Drag and drop items onto your floor plan</li>
                <li>• Search for specific furniture pieces</li>
                <li>• Resize items after placement</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Items automatically snap to grid when enabled!
                </p>
              </div>
            </div>
          ),
          action: () => showPanel("furnitureLibrary"),
        },
        {
          id: "properties-panel",
          title: "Properties Panel",
          description: "Edit selected objects and their properties",
          panelId: "properties",
          content: (
            <div className="space-y-3">
              <p>The Properties panel shows details about selected objects:</p>
              <ul className="space-y-2 text-sm">
                <li>• View and edit dimensions</li>
                <li>• Change colors and materials</li>
                <li>• Adjust object properties</li>
                <li>• Layer management</li>
              </ul>
            </div>
          ),
          action: () => showPanel("properties"),
        },
        {
          id: "keyboard-shortcuts",
          title: "Keyboard Shortcuts",
          description: "Speed up your workflow with keyboard shortcuts",
          content: (
            <div className="space-y-4">
              <p>Learn these essential keyboard shortcuts:</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Toggle Drawing Tools</span>
                  <Badge variant="outline">Ctrl + 1</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Toggle Furniture Library</span>
                  <Badge variant="outline">Ctrl + 2</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Toggle Properties</span>
                  <Badge variant="outline">Ctrl + 4</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Reset Layout</span>
                  <Badge variant="outline">Ctrl + 0</Badge>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  🎯 <strong>Pro Tip:</strong> Use Alt + number to focus panels instead of toggling them!
                </p>
              </div>
            </div>
          ),
        },
        {
          id: "completion",
          title: "You're All Set!",
          description: "Start creating amazing floor plans",
          content: (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-lg">
                Congratulations! You've completed the basic tour.
              </p>
              <p className="text-sm text-muted-foreground">
                You can always access this tour again from the help menu, or explore advanced features with other tours.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  onClick={() => setCurrentTour("advanced-features")}
                  variant="outline"
                  size="sm"
                >
                  Advanced Tour
                </Button>
                <Button
                  onClick={() => createWorkspaceLayout("My First Workspace")}
                  size="sm"
                >
                  Save This Layout
                </Button>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "advanced-features",
      name: "Advanced Features",
      description: "Discover powerful panel management features",
      category: "advanced",
      steps: [
        {
          id: "panel-grouping",
          title: "Panel Grouping",
          description: "Group related panels together",
          content: (
            <div className="space-y-3">
              <p>Group panels for better organization:</p>
              <ul className="space-y-2 text-sm">
                <li>• Select multiple panels</li>
                <li>• Create groups for related tools</li>
                <li>• Move groups together</li>
                <li>• Save grouped layouts</li>
              </ul>
            </div>
          ),
        },
        {
          id: "workspace-presets",
          title: "Workspace Presets",
          description: "Save and switch between different layouts",
          content: (
            <div className="space-y-3">
              <p>Create custom workspaces for different tasks:</p>
              <ul className="space-y-2 text-sm">
                <li>• Design workspace with drawing tools</li>
                <li>• Review workspace with measurement tools</li>
                <li>• Presentation workspace with 3D view</li>
                <li>• Switch instantly between layouts</li>
              </ul>
            </div>
          ),
        },
        {
          id: "performance-optimization",
          title: "Performance Tips",
          description: "Keep your workspace running smoothly",
          content: (
            <div className="space-y-3">
              <p>Optimize performance with these tips:</p>
              <ul className="space-y-2 text-sm">
                <li>• Hide unused panels</li>
                <li>• Use panel grouping to reduce clutter</li>
                <li>• Enable magnetic boundaries for easier positioning</li>
                <li>• Monitor performance in the advanced panel manager</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    {
      id: "mobile-usage",
      name: "Mobile & Touch",
      description: "Using FloorPlanner on mobile devices",
      category: "intermediate",
      steps: [
        {
          id: "touch-gestures",
          title: "Touch Gestures",
          description: "Navigate with touch on mobile devices",
          content: (
            <div className="space-y-3">
              <p>Master these touch gestures:</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Smartphone className="h-4 w-4" />
                  <span>Tap to select tools and objects</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Move className="h-4 w-4" />
                  <span>Drag to move panels and objects</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Zap className="h-4 w-4" />
                  <span>Pinch to zoom in and out</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "mobile-panels",
          title: "Mobile Panel Layout",
          description: "Panels adapt automatically to mobile screens",
          content: (
            <div className="space-y-3">
              <p>On mobile devices, panels automatically:</p>
              <ul className="space-y-2 text-sm">
                <li>• Resize to fit your screen</li>
                <li>• Stack vertically when needed</li>
                <li>• Show essential tools first</li>
                <li>• Provide touch-friendly controls</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ];

  // Check if user is new
  useEffect(() => {
    const hasVisited = localStorage.getItem("floorplanner-visited");
    const completed = JSON.parse(localStorage.getItem("floorplanner-completed-tours") || "[]");
    
    setCompletedTours(completed);
    
    if (!hasVisited && showOnFirstVisit) {
      setIsOpen(true);
      setCurrentTour("getting-started");
      localStorage.setItem("floorplanner-visited", "true");
    }
  }, [showOnFirstVisit]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !currentTour) return;

    const tour = tours.find(t => t.id === currentTour);
    if (!tour || currentStep >= tour.steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 5000); // 5 seconds per step

    return () => clearTimeout(timer);
  }, [isPlaying, currentTour, currentStep, tours]);

  const startTour = useCallback((tourId: string) => {
    setCurrentTour(tourId);
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const nextStep = useCallback(() => {
    const tour = tours.find(t => t.id === currentTour);
    if (!tour) return;

    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tour completed
      const newCompleted = [...completedTours, currentTour];
      setCompletedTours(newCompleted);
      localStorage.setItem("floorplanner-completed-tours", JSON.stringify(newCompleted));
      setIsOpen(false);
      setCurrentTour(null);
      setCurrentStep(0);
    }
  }, [currentTour, currentStep, tours, completedTours]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    setCurrentTour(null);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  // Execute step action
  useEffect(() => {
    if (!currentTour) return;

    const tour = tours.find(t => t.id === currentTour);
    const step = tour?.steps[currentStep];
    
    if (step?.action) {
      step.action();
    }
  }, [currentTour, currentStep, tours]);

  const currentTourData = tours.find(t => t.id === currentTour);
  const currentStepData = currentTourData?.steps[currentStep];
  const progress = currentTourData ? ((currentStep + 1) / currentTourData.steps.length) * 100 : 0;

  return (
    <>
      {/* Tour Selection Dialog */}
      {!currentTour && isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Welcome to FloorPlanner
              </DialogTitle>
              <DialogDescription>
                Choose a tour to get started or learn advanced features
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="beginner" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {["beginner", "intermediate", "advanced"].map(category => (
                <TabsContent key={category} value={category} className="space-y-4">
                  {tours
                    .filter(tour => tour.category === category)
                    .map(tour => (
                      <Card key={tour.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{tour.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              {completedTours.includes(tour.id) && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <Badge variant="outline">
                                {tour.steps.length} steps
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {tour.description}
                          </p>
                          <Button
                            onClick={() => startTour(tour.id)}
                            className="w-full"
                            variant={completedTours.includes(tour.id) ? "outline" : "default"}
                          >
                            {completedTours.includes(tour.id) ? "Retake Tour" : "Start Tour"}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="ghost" onClick={closeTour}>
                Skip Tours
              </Button>
              <div className="text-sm text-muted-foreground">
                You can access tours anytime from the help menu
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Active Tour Dialog */}
      {currentTour && currentStepData && (
        <Dialog open={isOpen} onOpenChange={closeTour}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {currentStep + 1}
                    </span>
                  </div>
                  {currentStepData.title}
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={closeTour}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currentTourData.name}</span>
                  <span>
                    {currentStep + 1} of {currentTourData.steps.length}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {currentStepData.description}
              </p>
              
              <div className="min-h-[200px]">
                {currentStepData.content}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={currentStep >= currentTourData.steps.length - 1}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStep(0);
                    setIsPlaying(false);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  {currentStep === currentTourData.steps.length - 1 ? (
                    "Finish"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Hook for triggering onboarding
export const useOnboarding = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const showOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
  }, []);

  const hideOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
  }, []);

  return {
    isOnboardingOpen,
    showOnboarding,
    hideOnboarding,
  };
};