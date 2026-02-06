import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, FolderOpen, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DataSourceCard } from "@/components/data-source-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DataSource } from "@shared/schema";

export default function DataSourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dataSources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/data-sources/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "Data source deleted",
        description: "The data source has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/data-sources/${id}/analyze`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis started",
        description: "AI is analyzing your data. Results will appear shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredSources = dataSources?.filter((source) =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-sources-heading">Data Sources</h1>
          <p className="text-muted-foreground">
            Manage your uploaded files and connected data sources.
          </p>
        </div>
        <Link href="/upload">
          <Button data-testid="button-add-source">
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </Link>
      </div>

      {dataSources && dataSources.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-sources"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSources && filteredSources.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => (
            <DataSourceCard
              key={source.id}
              dataSource={source}
              onDelete={() => deleteMutation.mutate(source.id)}
              onAnalyze={() => analyzeMutation.mutate(source.id)}
              onView={() => {}}
            />
          ))}
        </div>
      ) : dataSources && dataSources.length > 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No data sources match your search.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No data sources yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Upload files or connect to cloud storage to add data sources.
            </p>
            <div className="flex gap-2">
              <Link href="/upload">
                <Button data-testid="button-upload-first">
                  Upload Files
                </Button>
              </Link>
              <Link href="/cloud">
                <Button variant="outline" data-testid="button-connect-cloud">
                  Connect Cloud
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
