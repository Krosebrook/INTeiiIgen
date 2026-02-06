import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOnboarding } from "@/hooks/use-onboarding";
import { apiRequest } from "@/lib/queryClient";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTooltipPosition(
  rect: SpotlightRect,
  placement: "top" | "bottom" | "left" | "right",
  tooltipWidth: number,
  tooltipHeight: number
) {
  const padding = 12;
  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = rect.top - tooltipHeight - padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case "bottom":
      top = rect.top + rect.height + padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - padding;
      break;
    case "right":
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left + rect.width + padding;
      break;
  }

  left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
  top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

  return { top, left };
}

export function OnboardingOverlay() {
  const {
    isTourActive,
    currentTour,
    currentStep,
    currentStepIndex,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding();

  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setSpotlightRect(null);
      setAiTip(null);
      return;
    }

    setAiTip(null);

    const findTarget = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        const pad = 6;
        setSpotlightRect({
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        });
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        setSpotlightRect(null);
      }
    };

    findTarget();
    const interval = setInterval(findTarget, 500);
    return () => clearInterval(interval);
  }, [isTourActive, currentStep]);

  const fetchAiTip = async () => {
    if (!currentStep?.aiContext || aiTip || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai/onboarding-tip", {
        context: currentStep.aiContext,
        pageName: currentTour?.pageName || "",
        stepTitle: currentStep.title,
      });
      const data = await res.json();
      setAiTip(data.tip || null);
    } catch {
      setAiTip("Explore this feature to unlock powerful data visualization capabilities.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!isTourActive || !currentStep || !currentTour) return null;

  const totalSteps = currentTour.steps.length;
  const tooltipWidth = 340;
  const tooltipHeight = 250;

  const pos = spotlightRect
    ? getTooltipPosition(spotlightRect, currentStep.placement, tooltipWidth, tooltipHeight)
    : { top: window.innerHeight / 2 - 125, left: window.innerWidth / 2 - 170 };

  return (
    <AnimatePresence>
      <div className="fixed inset-0" style={{ zIndex: 99998, pointerEvents: "none" }}>
        {spotlightRect && (
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "auto" }}
            onClick={skipTour}
          >
            <defs>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.55)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        )}

        {!spotlightRect && (
          <div
            className="absolute inset-0 bg-black/50"
            style={{ pointerEvents: "auto" }}
            onClick={skipTour}
          />
        )}

        {spotlightRect && (
          <motion.div
            className="absolute border-2 border-primary rounded-lg"
            style={{
              pointerEvents: "none",
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <motion.div
          ref={tooltipRef}
          className="absolute"
          style={{
            pointerEvents: "auto",
            top: pos.top,
            left: pos.left,
            width: tooltipWidth,
            zIndex: 99999,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          key={currentStep.id}
        >
          <Card className="p-4 shadow-lg border-primary/20">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm">{currentStep.title}</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={skipTour}
                className="h-6 w-6 shrink-0"
                data-testid="button-close-tour"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{currentStep.content}</p>

            {currentStep.aiContext && (
              <div className="mb-3">
                {aiTip ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex gap-2 p-2 rounded-md bg-primary/5 border border-primary/10"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{aiTip}</p>
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchAiTip}
                    disabled={aiLoading}
                    className="gap-1.5 text-xs h-7"
                    data-testid="button-ai-tip"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    {aiLoading ? "Thinking..." : "Get AI tip"}
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {currentStepIndex + 1} of {totalSteps}
              </span>
              <div className="flex gap-1.5">
                {currentStepIndex > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="h-7 text-xs gap-1"
                    data-testid="button-prev-step"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="h-7 text-xs gap-1"
                  data-testid="button-next-step"
                >
                  {currentStepIndex < totalSteps - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-3 w-3" />
                    </>
                  ) : (
                    "Finish"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-1 mt-2 justify-center">
              {currentTour.steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentStepIndex
                      ? "w-4 bg-primary"
                      : i < currentStepIndex
                        ? "w-2 bg-primary/40"
                        : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
