import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { getPageTour, ONBOARDING_CHECKLIST, type PageTour, type OnboardingStep, type ChecklistItem } from "@/lib/onboarding-data";

const STORAGE_KEY = "dashgen_onboarding";

interface OnboardingState {
  completedTours: string[];
  completedChecklist: string[];
  dismissed: boolean;
  welcomed: boolean;
}

interface OnboardingContextValue {
  state: OnboardingState;
  currentTour: PageTour | null;
  currentStepIndex: number;
  currentStep: OnboardingStep | null;
  isTourActive: boolean;
  isAssistantOpen: boolean;
  checklist: (ChecklistItem & { completed: boolean })[];
  checklistProgress: number;
  startTour: (pageId?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  completeChecklistItem: (itemId: string) => void;
  toggleAssistant: () => void;
  closeAssistant: () => void;
  openAssistant: () => void;
  dismissOnboarding: () => void;
  resetOnboarding: () => void;
  markWelcomed: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function loadState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completedTours: [], completedChecklist: [], dismissed: false, welcomed: false };
}

function saveState(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [state, setState] = useState<OnboardingState>(loadState);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTour, setCurrentTour] = useState<PageTour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    setIsTourActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
  }, [location]);

  const currentStep = currentTour?.steps[currentStepIndex] || null;

  const checklist = ONBOARDING_CHECKLIST.map(item => ({
    ...item,
    completed: state.completedChecklist.includes(item.id),
  }));

  const completedCount = checklist.filter(c => c.completed).length;
  const checklistProgress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const startTour = useCallback((pageId?: string) => {
    const tour = pageId
      ? Object.values(getPageTour(pageId) ? { [pageId]: getPageTour(pageId)! } : {})
          .find(t => t.pageId === pageId) || getPageTour(location)
      : getPageTour(location);
    if (tour) {
      setCurrentTour(tour);
      setCurrentStepIndex(0);
      setIsTourActive(true);
    }
  }, [location]);

  const nextStep = useCallback(() => {
    if (!currentTour) return;
    if (currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    } else {
      endTour();
    }
  }, [currentTour, currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex(i => i - 1);
  }, [currentStepIndex]);

  const endTour = useCallback(() => {
    if (currentTour) {
      setState(s => ({
        ...s,
        completedTours: s.completedTours.includes(currentTour.pageId)
          ? s.completedTours
          : [...s.completedTours, currentTour.pageId],
      }));
    }
    setIsTourActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
  }, [currentTour]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
  }, []);

  const completeChecklistItem = useCallback((itemId: string) => {
    setState(s => ({
      ...s,
      completedChecklist: s.completedChecklist.includes(itemId)
        ? s.completedChecklist
        : [...s.completedChecklist, itemId],
    }));
  }, []);

  const toggleAssistant = useCallback(() => setIsAssistantOpen(v => !v), []);
  const closeAssistant = useCallback(() => setIsAssistantOpen(false), []);
  const openAssistant = useCallback(() => setIsAssistantOpen(true), []);

  const dismissOnboarding = useCallback(() => {
    setState(s => ({ ...s, dismissed: true }));
    setIsAssistantOpen(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({ completedTours: [], completedChecklist: [], dismissed: false, welcomed: false });
    setIsAssistantOpen(true);
  }, []);

  const markWelcomed = useCallback(() => {
    setState(s => ({ ...s, welcomed: true }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        state,
        currentTour,
        currentStepIndex,
        currentStep,
        isTourActive,
        isAssistantOpen,
        checklist,
        checklistProgress,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        endTour,
        completeChecklistItem,
        toggleAssistant,
        closeAssistant,
        openAssistant,
        dismissOnboarding,
        resetOnboarding,
        markWelcomed,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
