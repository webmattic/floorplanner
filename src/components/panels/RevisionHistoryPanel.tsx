import React, { useState } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import {
  RotateCcw,
  RotateCw,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

export const RevisionHistoryPanel: React.FC = () => {
  const { currentFloorPlan, undo, redo } = useFloorPlanStore();
  const [activeTab, setActiveTab] = useState("history");

  // Mock revision data since store doesn't have revision history yet
  const mockRevisions = [
    {
      id: "rev-1",
      timestamp: new Date().toISOString(),
      description: "Initial floor plan creation",
      author: "Demo User",
      type: "manual",
    },
    {
      id: "rev-2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      description: "Added living room",
      author: "Demo User",
      type: "auto-save",
    },
  ];

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  return (
    <FloatingPanel panelId="revisionHistory">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Revision History</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Undo
            </Button>
            <Button variant="outline" size="sm" onClick={handleRedo}>
              <RotateCw className="h-3 w-3 mr-1" />
              Redo
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {mockRevisions.map((revision) => (
                  <Card key={revision.id} className="p-3">
                    <CardHeader className="p-0 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          {revision.description}
                        </CardTitle>
                        <Badge
                          variant={
                            revision.type === "manual" ? "default" : "secondary"
                          }
                        >
                          {revision.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-xs text-muted-foreground">
                        <div>By {revision.author}</div>
                        <div>
                          {new Date(revision.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Revision history settings will be available in a future update.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {!currentFloorPlan && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No floor plan loaded. Create or load a floor plan to see revision
              history.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </FloatingPanel>
  );
};
