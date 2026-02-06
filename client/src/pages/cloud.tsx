import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CloudConnector } from "@/components/cloud-connector";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/use-onboarding";
import { apiRequest } from "@/lib/queryClient";

export default function CloudPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { completeChecklistItem } = useOnboarding();

  useEffect(() => {
    completeChecklistItem("connect-cloud");
  }, [completeChecklistItem]);

  const importMutation = useMutation({
    mutationFn: async ({ provider, fileId, fileName }: { provider: string; fileId: string; fileName: string }) => {
      const res = await apiRequest("POST", "/api/data-sources/cloud", { provider, fileId, fileName });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "File imported",
        description: `${variables.fileName} has been imported and is being processed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (provider: string, fileId: string, fileName: string) => {
    importMutation.mutate({ provider, fileId, fileName });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-cloud-heading">Cloud Storage</h1>
        <p className="text-muted-foreground">
          Connect to your cloud storage and import files directly into DashGen.
        </p>
      </div>

      <CloudConnector onFileSelect={handleFileSelect} />
    </div>
  );
}
