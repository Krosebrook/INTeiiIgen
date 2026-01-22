import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, X, Send, Sparkles, Loader2, User, Minimize2 } from "lucide-react";
import { scaleIn, fadeInUp, staggerContainerFast, smoothTransition } from "@/lib/animations";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SmartAssistantProps {
  dashboardId?: number;
  dataSources?: any[];
  widgets?: any[];
}

export function SmartAssistant({ dashboardId, dataSources = [], widgets = [] }: SmartAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your dashboard assistant. Ask me anything about your data, charts, or insights.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = {
        dashboardId,
        dataSourceCount: dataSources.length,
        widgetCount: widgets.length,
        dataSources: dataSources.slice(0, 5).map((ds) => ({
          name: ds.name,
          type: ds.type,
          status: ds.status,
          rowCount: (ds.metadata as any)?.rows,
          columns: (ds.metadata as any)?.headers?.slice(0, 10),
        })),
        widgets: widgets.slice(0, 10).map((w) => ({
          title: w.title,
          type: w.type,
        })),
      };

      const response = await apiRequest("POST", "/api/assistant/chat", {
        message: userMessage.content,
        context,
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || "I apologize, but I encountered an issue processing your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={smoothTransition}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => setIsOpen(true)}
              data-testid="button-open-assistant"
            >
              <Bot className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={smoothTransition}
            className="fixed bottom-6 right-6 z-50"
            style={{ originX: 1, originY: 1 }}
          >
            <Card
              className={`shadow-xl border transition-all ${isMinimized ? "w-80" : "w-96"}`}
              data-testid="smart-assistant-panel"
            >
              <CardHeader className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-semibold">Smart Assistant</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsMinimized(!isMinimized)}
                      data-testid="button-minimize-assistant"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsOpen(false)}
                      data-testid="button-close-assistant"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={smoothTransition}
                  >
                    <CardContent className="p-0">
                      <ScrollArea className="h-80 p-4" ref={scrollRef}>
                        <motion.div
                          variants={staggerContainerFast}
                          initial="hidden"
                          animate="visible"
                          className="space-y-4"
                        >
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              variants={fadeInUp}
                              className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {message.role === "assistant" && (
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                  message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {message.content}
                              </div>
                              {message.role === "user" && (
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {isLoading && (
                            <motion.div
                              variants={fadeInUp}
                              className="flex gap-2 justify-start"
                            >
                              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-primary" />
                              </div>
                              <div className="bg-muted rounded-lg px-3 py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      </ScrollArea>

                      <div className="p-3 border-t">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ask about your data..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="flex-1"
                            data-testid="input-assistant-message"
                          />
                          <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            data-testid="button-send-message"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
