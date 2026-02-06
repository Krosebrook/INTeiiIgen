import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, Database, ArrowRight } from "lucide-react";
import { AISuggestions } from "@/components/ai-suggestions";
import type { DataSource } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewDashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { completeChecklistItem } = useOnboarding();
  const [selectedSources, setSelectedSources] = useState<number[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublic: false,
    },
  });

  const { data: dataSources, isLoading: sourcesLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues & { dataSourceIds: number[] }) => {
      const res = await apiRequest("POST", "/api/dashboards", data);
      return res.json() as Promise<{ id: number }>;
    },
    onSuccess: (data) => {
      completeChecklistItem("create-dashboard");
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Dashboard created",
        description: "Your new dashboard is ready.",
      });
      navigate(`/dashboard/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSource = (id: number) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (data: FormValues) => {
    createMutation.mutate({
      ...data,
      dataSourceIds: selectedSources,
    });
  };

  const readySources = dataSources?.filter((s) => s.status === "ready") || [];

  const selectedSourceNames = useMemo(() => {
    return readySources
      .filter(s => selectedSources.includes(s.id))
      .map(s => s.name);
  }, [readySources, selectedSources]);

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.value?.title) {
      form.setValue('title', suggestion.value.title);
    }
    if (suggestion.value?.description) {
      form.setValue('description', suggestion.value.description);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-new-dashboard-heading">Create Dashboard</h1>
        <p className="text-muted-foreground">
          Set up a new dashboard and select data sources to visualize.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dashboard Details</CardTitle>
              <CardDescription>
                Give your dashboard a name and description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSources.length > 0 && (
                <AISuggestions
                  type="dashboard"
                  context={{ dataSourceNames: selectedSourceNames }}
                  onSelectSuggestion={handleAISuggestion}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales Dashboard" {...field} data-testid="input-dashboard-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A dashboard to track quarterly sales performance..."
                        {...field}
                        data-testid="input-dashboard-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Dashboard</FormLabel>
                      <FormDescription>
                        Allow anyone with the link to view this dashboard.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-public"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card data-testid="section-layout-templates">
            <CardHeader>
              <CardTitle className="text-base">Data Sources</CardTitle>
              <CardDescription>
                Select data sources to include in this dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sourcesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : readySources.length > 0 ? (
                <div className="space-y-2">
                  {readySources.map((source) => (
                    <div
                      key={source.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSources.includes(source.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleSource(source.id)}
                      data-testid={`source-option-${source.id}`}
                    >
                      <div>
                        <p className="font-medium text-sm">{source.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {source.type} {source.fileType && `• ${source.fileType}`}
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 transition-colors ${
                          selectedSources.includes(source.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Database className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm mb-1">No data sources yet</p>
                  <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                    Add some data first, then come back to create a dashboard from it.
                  </p>
                  <Link href="/data">
                    <Button variant="outline" data-testid="button-add-data-first">
                      <Upload className="h-4 w-4 mr-2" />
                      Add Data
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="button-create-dashboard"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Dashboard
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
