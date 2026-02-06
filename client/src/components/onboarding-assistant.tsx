import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  Map,
  RotateCcw,
  Send,
  Loader2,
  BookOpen,
  MessageSquare,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useLocation } from "wouter";
import { getPageTour } from "@/lib/onboarding-data";
import { apiRequest } from "@/lib/queryClient";

type Tab = "checklist" | "tour" | "chat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function OnboardingAssistant() {
  const {
    state,
    isAssistantOpen,
    toggleAssistant,
    closeAssistant,
    checklist,
    checklistProgress,
    startTour,
    dismissOnboarding,
    resetOnboarding,
    isTourActive,
  } = useOnboarding();

  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("checklist");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPageTour = getPageTour(location);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  if (state.dismissed || isTourActive) return null;

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await apiRequest("POST", "/api/ai/onboarding-chat", {
        message: userMsg,
        currentPage: location,
        pageName: currentPageTour?.pageName || "Unknown",
      });
      const data = await res.json();
      setChatMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply || "I can help you navigate DashGen. Try asking about specific features!" },
      ]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: "assistant", content: "I'm here to help! You can ask me about any feature in DashGen, or use the checklist to get started step by step." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const tabIcons: Record<Tab, typeof ListChecks> = {
    checklist: ListChecks,
    tour: Map,
    chat: MessageSquare,
  };

  return (
    <>
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-[9997]"
            style={{ width: 360 }}
            data-testid="panel-onboarding-assistant"
          >
            <Card className="flex flex-col shadow-xl border-primary/10 overflow-hidden" style={{ maxHeight: "70vh" }}>
              <div className="flex items-center justify-between gap-2 p-3 border-b bg-primary/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Onboarding Guide</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={resetOnboarding}
                    className="h-6 w-6"
                    title="Reset onboarding"
                    data-testid="button-reset-onboarding"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={closeAssistant}
                    className="h-6 w-6"
                    data-testid="button-close-assistant"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex border-b">
                {(["checklist", "tour", "chat"] as Tab[]).map(tab => {
                  const Icon = tabIcons[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                        activeTab === tab
                          ? "text-primary border-b-2 border-primary"
                          : "text-muted-foreground"
                      }`}
                      data-testid={`tab-onboarding-${tab}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab === "checklist" ? "Setup" : tab === "tour" ? "Tour" : "Ask AI"}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-auto" style={{ minHeight: 200, maxHeight: "50vh" }}>
                {activeTab === "checklist" && (
                  <div className="p-3 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Setup Progress</span>
                        <span className="text-xs font-semibold text-primary">{checklistProgress}%</span>
                      </div>
                      <Progress value={checklistProgress} className="h-1.5" />
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      {checklist.map(item => (
                        <button
                          key={item.id}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-md text-left transition-colors hover-elevate ${
                            item.completed ? "opacity-60" : ""
                          }`}
                          onClick={() => setLocation(item.route)}
                          data-testid={`checklist-item-${item.id}`}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${item.completed ? "line-through" : ""}`}>
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                        </button>
                      ))}
                    </div>
                    {checklistProgress === 100 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-muted-foreground mb-2">All set! You're ready to go.</p>
                        <Button size="sm" variant="outline" onClick={dismissOnboarding} className="text-xs h-7" data-testid="button-dismiss-onboarding">
                          Dismiss Guide
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "tour" && (
                  <div className="p-3 space-y-3">
                    {currentPageTour ? (
                      <>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">{currentPageTour.pageName}</h4>
                          <p className="text-xs text-muted-foreground">{currentPageTour.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            closeAssistant();
                            setTimeout(() => startTour(), 150);
                          }}
                          className="w-full gap-1.5 text-xs h-8"
                          data-testid="button-start-page-tour"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Start Page Tour ({currentPageTour.steps.length} steps)
                        </Button>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Steps:</p>
                          {currentPageTour.steps.map((step, i) => {
                            const tourCompleted = state.completedTours.includes(currentPageTour.pageId);
                            return (
                              <div key={step.id} className="flex items-center gap-2 py-1">
                                {tourCompleted ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                ) : (
                                  <div className="h-3.5 w-3.5 rounded-full border text-[10px] font-medium flex items-center justify-center shrink-0 text-muted-foreground">
                                    {i + 1}
                                  </div>
                                )}
                                <span className="text-xs">{step.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <Map className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                        <p className="text-sm text-muted-foreground">No tour available for this page</p>
                        <p className="text-xs text-muted-foreground mt-1">Navigate to a main section to start a guided tour</p>
                      </div>
                    )}

                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">All Page Tours</p>
                      {[
                        { label: "Dashboard", route: "/" },
                        { label: "Upload", route: "/upload" },
                        { label: "Cloud Storage", route: "/cloud" },
                        { label: "Data Sources", route: "/sources" },
                        { label: "New Dashboard", route: "/new" },
                        { label: "AI Insights", route: "/insights" },
                        { label: "Organizations", route: "/organizations" },
                        { label: "Studio", route: "/studio" },
                      ].map(pg => {
                        const tour = getPageTour(pg.route);
                        const completed = tour && state.completedTours.includes(tour.pageId);
                        return (
                          <button
                            key={pg.route}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs hover-elevate"
                            onClick={() => setLocation(pg.route)}
                            data-testid={`tour-link-${pg.label.toLowerCase().replace(/ /g, "-")}`}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            <span className="flex-1">{pg.label}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tour?.steps.length || 0} steps
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "chat" && (
                  <div className="flex flex-col" style={{ minHeight: 200 }}>
                    <div className="flex-1 overflow-auto p-3 space-y-2" style={{ maxHeight: "35vh" }}>
                      {chatMessages.length === 0 && (
                        <div className="text-center py-4">
                          <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-muted-foreground">Ask me anything about DashGen</p>
                          <div className="mt-3 space-y-1.5">
                            {[
                              "How do I create my first dashboard?",
                              "What file types can I upload?",
                              "How do I share a dashboard?",
                            ].map(q => (
                              <button
                                key={q}
                                className="w-full text-left text-xs p-2 rounded-md hover-elevate text-muted-foreground"
                                onClick={() => {
                                  setChatInput(q);
                                  setTimeout(() => inputRef.current?.focus(), 50);
                                }}
                                data-testid={`chat-suggestion-${q.slice(0, 20).replace(/\s/g, "-")}`}
                              >
                                "{q}"
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-2 text-xs ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-2 text-xs flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Thinking...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="border-t p-2">
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          sendChatMessage();
                        }}
                        className="flex gap-1.5"
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          placeholder="Ask about DashGen..."
                          className="flex-1 text-xs bg-transparent border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                          data-testid="input-onboarding-chat"
                        />
                        <Button
                          size="icon"
                          type="submit"
                          disabled={!chatInput.trim() || chatLoading}
                          className="h-7 w-7 shrink-0"
                          data-testid="button-send-chat"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-4 right-4 z-[9996]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
      >
        <Button
          size="icon"
          onClick={toggleAssistant}
          className="h-12 w-12 rounded-full shadow-lg"
          data-testid="button-onboarding-fab"
        >
          {isAssistantOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <HelpCircle className="h-5 w-5" />
          )}
        </Button>
        {!isAssistantOpen && checklistProgress < 100 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
            <span className="text-[9px] text-destructive-foreground font-bold">
              {checklist.filter(c => !c.completed).length}
            </span>
          </div>
        )}
      </motion.div>
    </>
  );
}
