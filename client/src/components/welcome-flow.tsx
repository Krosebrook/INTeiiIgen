import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, BarChart3, Cloud, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const GOALS = [
  {
    id: "upload-analyze",
    icon: Upload,
    title: "Upload & Analyze Data",
    description: "Import spreadsheets or files and create instant visualizations",
    route: "/upload",
  },
  {
    id: "build-dashboard",
    icon: BarChart3,
    title: "Build a Dashboard",
    description: "Create interactive dashboards with charts and widgets",
    route: "/new",
  },
  {
    id: "connect-cloud",
    icon: Cloud,
    title: "Connect Cloud Storage",
    description: "Link Google Drive, OneDrive, or Notion to import data",
    route: "/cloud",
  },
  {
    id: "explore",
    icon: Sparkles,
    title: "Just Explore",
    description: "Take a look around and discover what DashGen can do",
    route: "/",
  },
];

export function WelcomeFlow() {
  const { state, markWelcomed, openAssistant } = useOnboarding();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const handleStart = () => {
    const goal = GOALS.find(g => g.id === selectedGoal);
    markWelcomed();
    openAssistant();
    if (goal && goal.route !== "/") {
      setLocation(goal.route);
    }
  };

  if (state.welcomed || state.dismissed) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, pointerEvents: "none" as any }}
        data-testid="dialog-welcome-flow"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ maxWidth: 480, width: "100%" }}
          className="mx-4"
        >
          <Card className="p-6 shadow-2xl">
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold">
                    Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    DashGen turns your data into powerful, interactive dashboards in seconds.
                    Let's get you set up.
                  </p>
                </div>
                <Button
                  onClick={() => setStep(1)}
                  className="gap-1.5"
                  data-testid="button-welcome-continue"
                >
                  Let's Go
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div>
                  <button
                    onClick={() => {
                      markWelcomed();
                    }}
                    className="text-xs text-muted-foreground hover:underline"
                    data-testid="button-skip-welcome"
                  >
                    Skip setup
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">What do you want to do first?</h3>
                  <p className="text-xs text-muted-foreground">
                    We'll customize your experience based on your goal.
                  </p>
                </div>

                <div className="space-y-2">
                  {GOALS.map(goal => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => setSelectedGoal(goal.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all border ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover-elevate"
                        }`}
                        data-testid={`goal-${goal.id}`}
                      >
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{goal.title}</p>
                          <p className="text-xs text-muted-foreground">{goal.description}</p>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <ChevronRight className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(0)}
                    className="text-xs"
                    data-testid="button-welcome-back"
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleStart}
                    disabled={!selectedGoal}
                    className="gap-1.5"
                    data-testid="button-welcome-start"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
