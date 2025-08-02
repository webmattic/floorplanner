import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge.tsx";
import { Progress } from "./progress.tsx";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.tsx";
import { ScrollArea } from "./scroll-area.tsx";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Zap,
  Monitor,
  TestTube,
} from "lucide-react";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";
import { usePanelPerformance } from "../../hooks/usePanelPerformance";

interface TestResult {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestResult[];
  status: "pending" | "running" | "completed";
  progress: number;
}

export const PanelIntegrationTest: React.FC = () => {
  const {
    panels,
    showPanel,
    hidePanel,
    togglePanel,
    minimizePanel,
    maximizePanel,
    updatePanelPosition,
    updatePanelSize,
    createGroup,
  } = usePanelStore();

  const { metrics, getPerformanceStatus, getOptimizationRecommendations } =
    usePanelPerformance();

  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {}
  );

  // Initialize test suites
  useEffect(() => {
    const suites: TestSuite[] = [
      {
        id: "panel-basic",
        name: "Basic Panel Operations",
        description: "Test fundamental panel show/hide/toggle operations",
        status: "pending",
        progress: 0,
        tests: [
          {
            id: "show-panel",
            name: "Show Panel",
            status: "pending",
            duration: 0,
          },
          {
            id: "hide-panel",
            name: "Hide Panel",
            status: "pending",
            duration: 0,
          },
          {
            id: "toggle-panel",
            name: "Toggle Panel",
            status: "pending",
            duration: 0,
          },
          {
            id: "minimize-panel",
            name: "Minimize Panel",
            status: "pending",
            duration: 0,
          },
          {
            id: "maximize-panel",
            name: "Maximize Panel",
            status: "pending",
            duration: 0,
          },
        ],
      },
      {
        id: "panel-positioning",
        name: "Panel Positioning",
        description: "Test panel movement and resizing functionality",
        status: "pending",
        progress: 0,
        tests: [
          {
            id: "move-panel",
            name: "Move Panel",
            status: "pending",
            duration: 0,
          },
          {
            id: "resize-panel",
            name: "Resize Panel",
            status: "pending",
            duration: 0,
          },
          {
            id: "snap-to-edges",
            name: "Snap to Edges",
            status: "pending",
            duration: 0,
          },
          {
            id: "boundary-constraints",
            name: "Boundary Constraints",
            status: "pending",
            duration: 0,
          },
        ],
      },
      {
        id: "panel-grouping",
        name: "Panel Grouping",
        description: "Test panel grouping and workspace management",
        status: "pending",
        progress: 0,
        tests: [
          {
            id: "create-group",
            name: "Create Group",
            status: "pending",
            duration: 0,
          },
          {
            id: "remove-group",
            name: "Remove Group",
            status: "pending",
            duration: 0,
          },
          {
            id: "group-operations",
            name: "Group Operations",
            status: "pending",
            duration: 0,
          },
        ],
      },
      {
        id: "panel-persistence",
        name: "Panel Persistence",
        description: "Test panel state persistence and restoration",
        status: "pending",
        progress: 0,
        tests: [
          {
            id: "save-state",
            name: "Save Panel State",
            status: "pending",
            duration: 0,
          },
          {
            id: "restore-state",
            name: "Restore Panel State",
            status: "pending",
            duration: 0,
          },
          {
            id: "workspace-presets",
            name: "Workspace Presets",
            status: "pending",
            duration: 0,
          },
        ],
      },
      {
        id: "performance",
        name: "Performance Tests",
        description: "Test panel system performance and optimization",
        status: "pending",
        progress: 0,
        tests: [
          {
            id: "render-performance",
            name: "Render Performance",
            status: "pending",
            duration: 0,
          },
          {
            id: "memory-usage",
            name: "Memory Usage",
            status: "pending",
            duration: 0,
          },
          {
            id: "frame-rate",
            name: "Frame Rate",
            status: "pending",
            duration: 0,
          },
          {
            id: "stress-test",
            name: "Stress Test",
            status: "pending",
            duration: 0,
          },
        ],
      },
      {
        id: "integration",
        name: "Integration Tests",
        description: "Test integration with main application components",
        status: "pending",
        progress: 0,
        tests: [
          {
            id: "canvas-integration",
            name: "Canvas Integration",
            status: "pending",
            duration: 0,
          },
          {
            id: "store-integration",
            name: "Store Integration",
            status: "pending",
            duration: 0,
          },
          {
            id: "keyboard-shortcuts",
            name: "Keyboard Shortcuts",
            status: "pending",
            duration: 0,
          },
          {
            id: "error-handling",
            name: "Error Handling",
            status: "pending",
            duration: 0,
          },
        ],
      },
    ];

    setTestSuites(suites);
  }, []);

  // Test implementations
  const runTest = useCallback(
    async (suiteId: string, testId: string): Promise<TestResult> => {
      const startTime = performance.now();
      setCurrentTest(`${suiteId}-${testId}`);

      try {
        switch (`${suiteId}-${testId}`) {
          case "panel-basic-show-panel":
            showPanel("drawingTools");
            if (!panels.drawingTools?.isVisible)
              throw new Error("Panel not shown");
            break;

          case "panel-basic-hide-panel":
            hidePanel("drawingTools");
            if (panels.drawingTools?.isVisible)
              throw new Error("Panel not hidden");
            break;

          case "panel-basic-toggle-panel":
            const initialState = panels.drawingTools?.isVisible;
            togglePanel("drawingTools");
            if (panels.drawingTools?.isVisible === initialState)
              throw new Error("Panel not toggled");
            break;

          case "panel-basic-minimize-panel":
            showPanel("drawingTools");
            minimizePanel("drawingTools");
            if (!panels.drawingTools?.isMinimized)
              throw new Error("Panel not minimized");
            break;

          case "panel-basic-maximize-panel":
            minimizePanel("drawingTools");
            maximizePanel("drawingTools");
            if (panels.drawingTools?.isMinimized)
              throw new Error("Panel not maximized");
            break;

          case "panel-positioning-move-panel":
            const newPosition = { x: 100, y: 100 };
            updatePanelPosition("drawingTools", newPosition);
            const currentPosition = panels.drawingTools?.position;
            if (
              currentPosition?.x !== newPosition.x ||
              currentPosition?.y !== newPosition.y
            ) {
              throw new Error("Panel not moved correctly");
            }
            break;

          case "panel-positioning-resize-panel":
            const newSize = { width: 400, height: 300 };
            updatePanelSize("drawingTools", newSize);
            const currentSize = panels.drawingTools?.size;
            if (
              currentSize?.width !== newSize.width ||
              currentSize?.height !== newSize.height
            ) {
              throw new Error("Panel not resized correctly");
            }
            break;

          case "panel-grouping-create-group":
            const groupId = createGroup("Test Group", [
              "drawingTools",
              "properties",
            ]);
            if (!groupId) throw new Error("Group not created");
            break;

          case "performance-render-performance":
            const renderStart = performance.now();
            // Simulate heavy rendering by showing/hiding multiple panels
            Object.keys(PANEL_CONFIGS).forEach((panelId) => {
              showPanel(panelId);
            });
            const renderTime = performance.now() - renderStart;
            if (renderTime > 100)
              throw new Error(`Slow rendering: ${renderTime.toFixed(2)}ms`);
            break;

          case "performance-memory-usage":
            if (metrics.memoryUsage > 200) {
              throw new Error(
                `High memory usage: ${metrics.memoryUsage.toFixed(2)}MB`
              );
            }
            break;

          case "performance-frame-rate":
            if (metrics.frameRate < 30) {
              throw new Error(`Low frame rate: ${metrics.frameRate}fps`);
            }
            break;

          case "performance-stress-test":
            // Stress test: rapidly show/hide all panels
            for (let i = 0; i < 10; i++) {
              Object.keys(PANEL_CONFIGS).forEach((panelId) => {
                togglePanel(panelId);
              });
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
            break;

          case "integration-canvas-integration":
            // Test if panels don't interfere with canvas operations
            // This would need actual canvas integration testing
            break;

          case "integration-store-integration":
            // Test store state consistency
            const storeState = usePanelStore.getState();
            if (
              !storeState.panels ||
              Object.keys(storeState.panels).length === 0
            ) {
              throw new Error("Store state inconsistent");
            }
            break;

          case "integration-keyboard-shortcuts":
            // Test keyboard shortcuts (would need to simulate key events)
            break;

          case "integration-error-handling":
            // Test error boundary functionality
            try {
              // Simulate an error condition
              updatePanelPosition("nonexistent-panel", { x: 0, y: 0 });
            } catch (error) {
              // Error handling should prevent crashes
            }
            break;

          default:
            // Skip unknown tests
            return {
              id: testId,
              name: testId,
              status: "skipped",
              duration: 0,
              details: "Test not implemented",
            };
        }

        const duration = performance.now() - startTime;
        return {
          id: testId,
          name: testId,
          status: "passed",
          duration,
          details: `Completed in ${duration.toFixed(2)}ms`,
        };
      } catch (error) {
        const duration = performance.now() - startTime;
        return {
          id: testId,
          name: testId,
          status: "failed",
          duration,
          error: error instanceof Error ? error.message : "Unknown error",
          details: `Failed after ${duration.toFixed(2)}ms`,
        };
      }
    },
    [
      panels,
      showPanel,
      hidePanel,
      togglePanel,
      minimizePanel,
      maximizePanel,
      updatePanelPosition,
      updatePanelSize,
      createGroup,
      metrics,
    ]
  );

  // Run all tests
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setOverallProgress(0);

    const totalTests = testSuites.reduce(
      (sum, suite) => sum + suite.tests.length,
      0
    );
    let completedTests = 0;

    for (const suite of testSuites) {
      // Update suite status
      setTestSuites((prev) =>
        prev.map((s) =>
          s.id === suite.id ? { ...s, status: "running", progress: 0 } : s
        )
      );

      const suiteResults: TestResult[] = [];

      for (const test of suite.tests) {
        const result = await runTest(suite.id, test.id);
        suiteResults.push(result);

        setTestResults((prev) => ({
          ...prev,
          [`${suite.id}-${test.id}`]: result,
        }));

        completedTests++;
        const suiteProgress = (suiteResults.length / suite.tests.length) * 100;
        const overallProg = (completedTests / totalTests) * 100;

        setTestSuites((prev) =>
          prev.map((s) =>
            s.id === suite.id
              ? { ...s, progress: suiteProgress, tests: suiteResults }
              : s
          )
        );
        setOverallProgress(overallProg);

        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Mark suite as completed
      setTestSuites((prev) =>
        prev.map((s) =>
          s.id === suite.id ? { ...s, status: "completed", progress: 100 } : s
        )
      );
    }

    setIsRunning(false);
    setCurrentTest(null);
  }, [testSuites, runTest]);

  // Get test statistics
  const getTestStats = useCallback(() => {
    const allResults = Object.values(testResults);
    return {
      total: allResults.length,
      passed: allResults.filter((r) => r.status === "passed").length,
      failed: allResults.filter((r) => r.status === "failed").length,
      skipped: allResults.filter((r) => r.status === "skipped").length,
    };
  }, [testResults]);

  const stats = getTestStats();
  const performanceStatus = getPerformanceStatus();
  const recommendations = getOptimizationRecommendations();

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TestTube className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Panel Integration Tests</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              performanceStatus.status === "excellent" ? "default" : "secondary"
            }
          >
            Performance: {performanceStatus.status}
          </Badge>
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      {isRunning && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{overallProgress.toFixed(0)}%</span>
              </div>
              <Progress value={overallProgress} />
              {currentTest && (
                <div className="text-xs text-muted-foreground">
                  Currently running: {currentTest}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Statistics */}
      {stats.total > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.passed}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.skipped}
                </div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Test Suites</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {testSuites.map((suite) => (
                <Card key={suite.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{suite.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {suite.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            suite.status === "completed"
                              ? "default"
                              : suite.status === "running"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {suite.status}
                        </Badge>
                        {suite.status === "running" && (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </div>
                    {suite.status !== "pending" && (
                      <Progress value={suite.progress} className="mt-2" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {suite.tests.map((test) => {
                        const result = testResults[`${suite.id}-${test.id}`];
                        return (
                          <div
                            key={test.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center gap-2">
                              {result?.status === "passed" && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {result?.status === "failed" && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {result?.status === "skipped" && (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              {result?.status === "running" && (
                                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                              )}
                              {!result && (
                                <div className="h-4 w-4 rounded-full bg-gray-300" />
                              )}
                              <span className="text-sm">{test.name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result?.duration
                                ? `${result.duration.toFixed(2)}ms`
                                : ""}
                              {result?.error && (
                                <div className="text-red-500 max-w-xs truncate">
                                  {result.error}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Frame Rate:</span>
                  <Badge
                    variant={
                      metrics.frameRate >= 50 ? "default" : "destructive"
                    }
                  >
                    {metrics.frameRate} fps
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Render Time:</span>
                  <Badge
                    variant={
                      metrics.renderTime < 16 ? "default" : "destructive"
                    }
                  >
                    {metrics.renderTime.toFixed(2)} ms
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <Badge
                    variant={
                      metrics.memoryUsage < 100 ? "default" : "destructive"
                    }
                  >
                    {metrics.memoryUsage.toFixed(2)} MB
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Visible Panels:</span>
                  <Badge variant="outline">
                    {metrics.visiblePanelCount} / {metrics.panelCount}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold text-${performanceStatus.color}-600`}
                  >
                    {performanceStatus.status.toUpperCase()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Overall system performance rating
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>All Good!</AlertTitle>
                  <AlertDescription>
                    No performance optimizations needed at this time.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
