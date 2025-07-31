import React, { useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Badge } from "./badge.tsx";
import { Separator } from "./separator.tsx";
import { ScrollArea } from "./scroll-area.tsx";
import {
  Keyboard,
  MousePointer,
  Move,
  Square,
  DoorOpen,
  RectangleHorizontal,
  Ruler,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Redo2,
  Trash2,
  X,
  Hand,
  Grid3x3,
} from "lucide-react";

interface ShortcutGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: {
    key: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Drawing Tools",
    icon: Move,
    shortcuts: [
      { key: "V", description: "Select Tool", icon: MousePointer },
      { key: "W", description: "Wall Tool", icon: Move },
      { key: "R", description: "Room Tool", icon: Square },
      { key: "D", description: "Door Tool", icon: DoorOpen },
      { key: "M", description: "Measurement Tool", icon: Ruler },
      { key: "T", description: "Text Tool", icon: Type },
      { key: "H", description: "Hand Tool (Pan)", icon: Hand },
    ],
  },
  {
    title: "View Controls",
    icon: ZoomIn,
    shortcuts: [
      { key: "Ctrl + 0", description: "Reset Zoom & Pan" },
      { key: "Mouse Wheel", description: "Zoom In/Out" },
      { key: "Space + Drag", description: "Pan Canvas" },
      { key: "Ctrl + +", description: "Zoom In" },
      { key: "Ctrl + -", description: "Zoom Out" },
      { key: "G", description: "Toggle Grid", icon: Grid3x3 },
    ],
  },
  {
    title: "Edit Operations",
    icon: RotateCcw,
    shortcuts: [
      { key: "Ctrl + Z", description: "Undo", icon: RotateCcw },
      { key: "Ctrl + Y", description: "Redo", icon: Redo2 },
      { key: "Delete", description: "Delete Selected", icon: Trash2 },
      { key: "Backspace", description: "Delete Selected", icon: Trash2 },
      { key: "Ctrl + A", description: "Select All" },
      { key: "Ctrl + D", description: "Duplicate Selected" },
    ],
  },
  {
    title: "General",
    icon: Keyboard,
    shortcuts: [
      { key: "Escape", description: "Cancel Current Operation", icon: X },
      { key: "Enter", description: "Confirm Operation" },
      { key: "Shift + Click", description: "Multi-select" },
      { key: "Ctrl + S", description: "Save Floor Plan" },
      { key: "F11", description: "Toggle Fullscreen" },
      { key: "?", description: "Show This Help" },
    ],
  },
  {
    title: "Panel Management",
    icon: Square,
    shortcuts: [
      { key: "1", description: "Toggle Drawing Tools Panel" },
      { key: "2", description: "Toggle Furniture Library Panel" },
      { key: "3", description: "Toggle Material Palette Panel" },
      { key: "4", description: "Toggle Properties Panel" },
      { key: "5", description: "Toggle Layers Panel" },
      { key: "6", description: "Toggle 3D View Panel" },
      { key: "7", description: "Toggle Collaboration Panel" },
      { key: "8", description: "Toggle Export Panel" },
      { key: "9", description: "Toggle Revision History Panel" },
      { key: "0", description: "Toggle CAD Import Panel" },
    ],
  },
  {
    title: "Precision Drawing",
    icon: Ruler,
    shortcuts: [
      { key: "Shift + Draw", description: "Constrain to 45° angles" },
      { key: "Alt + Draw", description: "Disable snap-to-grid" },
      { key: "Ctrl + Draw", description: "Duplicate while drawing" },
      { key: "Shift + Resize", description: "Maintain aspect ratio" },
      { key: "Alt + Move", description: "Fine positioning" },
    ],
  },
];

const KeyboardShortcut: React.FC<{ shortcut: string }> = ({ shortcut }) => {
  const keys = shortcut.split(" + ");

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <Badge variant="outline" className="px-2 py-1 text-xs font-mono">
            {key}
          </Badge>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle '?' key to open help
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-4 right-4 z-[1000]">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-10 w-10 rounded-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts & Controls
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SHORTCUT_GROUPS.map((group, groupIndex) => {
                  const IconComponent = group.icon;

                  return (
                    <div key={groupIndex} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">{group.title}</h3>
                      </div>

                      <div className="space-y-2">
                        {group.shortcuts.map((shortcut, shortcutIndex) => {
                          const ShortcutIcon = shortcut.icon;

                          return (
                            <div
                              key={shortcutIndex}
                              className="flex items-center justify-between py-1"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                {ShortcutIcon && (
                                  <ShortcutIcon className="h-3 w-3 text-muted-foreground" />
                                )}
                                <span className="text-sm text-foreground">
                                  {shortcut.description}
                                </span>
                              </div>
                              <KeyboardShortcut shortcut={shortcut.key} />
                            </div>
                          );
                        })}
                      </div>

                      {groupIndex < SHORTCUT_GROUPS.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Footer with tips */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>💡 Pro Tips:</strong>
                </p>
                <p>
                  • Hold{" "}
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    Shift
                  </Badge>{" "}
                  while drawing for straight lines and constrained angles
                </p>
                <p>
                  • Use{" "}
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    Alt
                  </Badge>{" "}
                  to temporarily disable snap-to-grid for precise positioning
                </p>
                <p>
                  •{" "}
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    Mouse Wheel
                  </Badge>{" "}
                  over canvas to zoom in/out smoothly
                </p>
                <p>
                  •{" "}
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    Space + Drag
                  </Badge>{" "}
                  to pan around the canvas quickly
                </p>
                <p>• Double-click objects to edit properties directly</p>
                <p>
                  • Use{" "}
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    Ctrl + Click
                  </Badge>{" "}
                  to multi-select objects
                </p>
                <p>
                  • Press{" "}
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    ?
                  </Badge>{" "}
                  anytime to show this help dialog
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
