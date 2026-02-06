import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FileUploadZone } from "@/components/file-upload-zone";
import { CloudConnector } from "@/components/cloud-connector";
import { DataSourceCard } from "@/components/data-source-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
  Upload,
  Cloud,
  FolderOpen,
  Search,
  Loader2,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { DataSource } from "@shared/schema";

type UploadStatus = "idle" | "uploading" | "success" | "error";

const UPLOAD_TIMEOUT_MS = 30000;
const DRAFT_KEY = "dashgen_upload_draft";

interface UploadDraft {
  files: Array<{ name: string; size: number; type: string; lastModified: number }>;
  timestamp: number;
}

export default function DataPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { completeChecklistItem } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftFiles, setDraftFiles] = useState<UploadDraft["files"] | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const getTabFromLocation = (loc: string) =>
    loc === "/upload" ? "upload" : loc === "/cloud" ? "cloud" : "sources";
  const [activeTab, setActiveTab] = useState(getTabFromLocation(location));

  useEffect(() => {
    setActiveTab(getTabFromLocation(location));
  }, [location]);

  const { data: dataSources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { files, timestamp } = JSON.parse(draft) as UploadDraft;
        if (Date.now() - timestamp < 300000 && files.length > 0) {
          setHasDraft(true);
          setDraftFiles(files);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftFiles(null);
  }, []);

  const saveDraft = useCallback((files: File[]) => {
    const draft: UploadDraft = {
      files: files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
      })),
      timestamp: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, []);

  const uploadWithProgress = useCallback(
    (files: File[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve({ count: files.length });
            }
          } else {
            let errorMessage = "Upload failed";
            try {
              const error = JSON.parse(xhr.responseText);
              errorMessage = error.error || error.message || errorMessage;
            } catch {
              errorMessage = xhr.responseText || errorMessage;
            }
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener("error", () => {
          xhrRef.current = null;
          reject(new Error("Network error - please check your connection"));
        });

        xhr.addEventListener("timeout", () => {
          xhrRef.current = null;
          reject(new Error(`Upload timeout - please try again`));
        });

        xhr.open("POST", "/api/upload");
        xhr.withCredentials = true;
        xhr.timeout = UPLOAD_TIMEOUT_MS;
        xhr.send(formData);
      });
    },
    []
  );

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setUploadStatus("uploading");
      setUploadProgress(0);
      return await uploadWithProgress(files);
    },
    onSuccess: (data) => {
      setUploadStatus("success");
      setUploadProgress(100);
      clearDraft();
      completeChecklistItem("upload-data");
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "Upload successful",
        description: `${data.count || 1} file(s) uploaded and processed.`,
      });
      setTimeout(() => {
        setActiveTab("sources");
        setUploadStatus("idle");
      }, 600);
    },
    onError: (error: Error) => {
      setUploadStatus("error");
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const urlImportMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/data-sources/url", { url });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "URL imported",
        description: "Data from the URL has been processed.",
      });
      setActiveTab("sources");
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
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
        description: "AI is analyzing your data. Check Insights for results.",
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

  const importMutation = useMutation({
    mutationFn: async ({
      provider,
      fileId,
      fileName,
    }: {
      provider: string;
      fileId: string;
      fileName: string;
    }) => {
      const res = await apiRequest("POST", "/api/data-sources/cloud", {
        provider,
        fileId,
        fileName,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      completeChecklistItem("connect-cloud");
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "File imported",
        description: `${variables.fileName} has been imported.`,
      });
      setActiveTab("sources");
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      saveDraft(files);
      uploadMutation.mutate(files);
    },
    [uploadMutation, saveDraft]
  );

  const handleUrlSubmit = useCallback(
    (url: string) => {
      urlImportMutation.mutate(url);
    },
    [urlImportMutation]
  );

  const handleCloudFileSelect = (provider: string, fileId: string, fileName: string) => {
    importMutation.mutate({ provider, fileId, fileName });
  };

  useEffect(() => {
    return () => {
      if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
      }
    };
  }, []);

  const filteredSources = dataSources?.filter((source) =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const readyCount = dataSources?.filter((s) => s.status === "ready").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            data-testid="text-data-heading"
          >
            Data
          </h1>
          <p className="text-muted-foreground">
            Manage your data sources, upload files, or connect to cloud storage.
          </p>
        </div>
        {readyCount > 0 && (
          <Button onClick={() => navigate("/new")} data-testid="button-create-dashboard-from-data">
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-data">
          <TabsTrigger value="sources" className="gap-2" data-testid="tab-sources">
            <FolderOpen className="h-4 w-4" />
            My Sources
            {dataSources && dataSources.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({dataSources.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2" data-testid="tab-upload">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="cloud" className="gap-2" data-testid="tab-cloud">
            <Cloud className="h-4 w-4" />
            Cloud
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4 mt-4">
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
            <>
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
              {readyCount > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="flex items-center justify-between py-4 gap-4">
                    <p className="text-sm">
                      You have <strong>{readyCount}</strong> data source{readyCount !== 1 ? "s" : ""} ready.
                      Create a dashboard to start visualizing your data.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/new")}
                      className="shrink-0"
                      data-testid="button-next-create-dashboard"
                    >
                      Create Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : dataSources && dataSources.length > 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No data sources match your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No data sources yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Start by uploading a file or connecting a cloud service to bring your data in.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setActiveTab("upload")}
                    data-testid="button-go-upload"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("cloud")}
                    data-testid="button-go-cloud"
                  >
                    <Cloud className="h-4 w-4 mr-2" />
                    Connect Cloud
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4 mt-4">
          {hasDraft && draftFiles && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="font-medium text-sm"
                      data-testid="text-draft-recovery"
                    >
                      Resume previous upload?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Found {draftFiles.length} file(s):{" "}
                      {draftFiles.map((f) => f.name).join(", ")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDraft}
                    data-testid="button-dismiss-draft"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div data-testid="zone-file-upload">
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              onFilesChanged={saveDraft}
              onUrlSubmit={handleUrlSubmit}
              isUploading={uploadMutation.isPending || uploadStatus === "uploading"}
              uploadProgress={uploadProgress}
              uploadStatus={uploadStatus}
              acceptedTypes={[
                ".csv",
                ".json",
                ".xlsx",
                ".xls",
                ".pdf",
                ".png",
                ".jpg",
                ".jpeg",
                ".md",
                ".txt",
              ]}
              maxFiles={10}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Supported formats</p>
            <p>
              CSV, Excel, JSON, PDF, Markdown, Text, Images (PNG, JPEG), and 30+
              other text-based formats.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="cloud" className="mt-4">
          <CloudConnector onFileSelect={handleCloudFileSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
