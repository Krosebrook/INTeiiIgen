import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, FolderOpen, File, ChevronRight, Loader2, Check, HardDrive, FileText, Database, AlertCircle, LinkIcon, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SiGoogledrive, SiNotion } from "react-icons/si";

interface CloudFile {
  id: string;
  name: string;
  isFolder?: boolean;
  isDatabase?: boolean;
  mimeType?: string;
  size?: number;
  modifiedTime?: string;
  type?: string;
  url?: string;
}

interface CloudConnectorProps {
  onFileSelect: (provider: string, fileId: string, fileName: string) => void;
}

interface CloudStatus {
  "google-drive": boolean;
  onedrive: boolean;
  notion: boolean;
}

const providers = [
  {
    id: "google-drive",
    statusKey: "google-drive" as keyof CloudStatus,
    name: "Google Drive",
    icon: SiGoogledrive,
    fallbackIcon: HardDrive,
    color: "text-blue-500",
    description: "Import spreadsheets, documents, and files from your Google Drive",
  },
  {
    id: "onedrive",
    statusKey: "onedrive" as keyof CloudStatus,
    name: "OneDrive",
    icon: Cloud,
    fallbackIcon: Cloud,
    color: "text-sky-500",
    description: "Access Excel, CSV, and documents from Microsoft OneDrive",
  },
  {
    id: "notion",
    statusKey: "notion" as keyof CloudStatus,
    name: "Notion",
    icon: SiNotion,
    fallbackIcon: FileText,
    color: "text-foreground",
    description: "Import databases and pages from your Notion workspace",
  },
];

export function CloudConnector({ onFileSelect }: CloudConnectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { data: cloudStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<CloudStatus>({
    queryKey: ["/api/cloud/status"],
  });

  const handleProviderSelect = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    const isConnected = cloudStatus?.[provider.statusKey];
    if (!isConnected) return;

    setSelectedProvider(providerId);
    setIsLoading(true);
    setFiles([]);
    setCurrentPath([]);
    setFetchError(null);
    setSelectedFiles(new Set());

    try {
      const response = await fetch(`/api/cloud/${providerId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else if (response.status === 401) {
        setFetchError("This cloud service needs to be reconnected. Please reconnect it from the integrations panel.");
      } else {
        setFetchError("Could not load files. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      setFetchError("Could not reach the cloud service. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = async (folderId: string, folderName: string) => {
    if (!selectedProvider) return;

    setIsLoading(true);
    setFetchError(null);
    setCurrentPath((prev) => [...prev, folderName]);

    try {
      const response = await fetch(`/api/cloud/${selectedProvider}/files?folderId=${folderId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        setFetchError("Could not open this folder. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch folder contents:", error);
      setFetchError("Could not reach the cloud service. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileToggle = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const handleImportSelected = () => {
    if (!selectedProvider) return;

    selectedFiles.forEach((fileId) => {
      const file = files.find((f) => f.id === fileId);
      if (file) {
        onFileSelect(selectedProvider, file.id, file.name);
      }
    });

    setSelectedFiles(new Set());
  };

  const goBack = () => {
    if (currentPath.length === 0) {
      setSelectedProvider(null);
      setFiles([]);
      setFetchError(null);
      setSelectedFiles(new Set());
    } else {
      setCurrentPath((prev) => prev.slice(0, -1));
    }
  };

  const isFolder = (file: CloudFile) => {
    return file.isFolder || file.mimeType === "application/vnd.google-apps.folder" || file.type === "folder";
  };

  const getFileIcon = (file: CloudFile) => {
    if (isFolder(file)) return <FolderOpen className="h-5 w-5 text-muted-foreground" />;
    if (file.isDatabase) return <Database className="h-5 w-5 text-muted-foreground" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const getFileLabel = (file: CloudFile) => {
    if (file.isDatabase) return "database";
    if (file.mimeType?.includes("spreadsheet") || file.name?.endsWith(".xlsx") || file.name?.endsWith(".csv")) return "spreadsheet";
    if (file.mimeType?.includes("document") || file.name?.endsWith(".docx")) return "document";
    if (file.mimeType?.includes("json") || file.name?.endsWith(".json")) return "JSON";
    if (file.type === "page") return "page";
    return file.mimeType?.split("/").pop() || "file";
  };

  const connectedCount = cloudStatus
    ? Object.values(cloudStatus).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-4">
      {!selectedProvider ? (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">
                Connect to your cloud storage to import files and data directly into DashGen.
              </p>
            </div>
            {connectedCount > 0 && (
              <Badge variant="secondary" data-testid="badge-cloud-connected-count">
                {connectedCount} connected
              </Badge>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {providers.map((provider) => {
              const connected = cloudStatus?.[provider.statusKey] ?? false;
              const ProviderIcon = provider.icon;

              return (
                <Card
                  key={provider.id}
                  className={`transition-all ${
                    connected
                      ? "cursor-pointer hover:shadow-md hover-elevate"
                      : "opacity-70"
                  }`}
                  onClick={() => connected && handleProviderSelect(provider.id)}
                  data-testid={`card-provider-${provider.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${provider.color}`}>
                          <ProviderIcon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                      </div>
                      {statusLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : connected ? (
                        <Badge variant="secondary" className="text-xs" data-testid={`badge-${provider.id}-connected`}>
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground" data-testid={`badge-${provider.id}-disconnected`}>
                          Not connected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{provider.description}</CardDescription>
                    {connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProviderSelect(provider.id);
                        }}
                        data-testid={`button-browse-${provider.id}`}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-md bg-muted/50">
                        <LinkIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          Connect {provider.name} from the Integrations panel in the left sidebar to start importing your files.
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!statusLoading && connectedCount === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Cloud className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No cloud services connected</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  To import files from Google Drive, OneDrive, or Notion, connect them through the Integrations panel in the tools sidebar.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetchStatus()} data-testid="button-refresh-status">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={goBack} data-testid="button-cloud-back">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  {providers.find((p) => p.id === selectedProvider)?.name}
                  {currentPath.map((folder, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      {folder}
                    </span>
                  ))}
                </div>
              </div>
              {selectedFiles.size > 0 && (
                <Button onClick={handleImportSelected} data-testid="button-import-selected">
                  Import {selectedFiles.size} file{selectedFiles.size > 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground max-w-sm">{fetchError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleProviderSelect(selectedProvider)}
                  data-testid="button-retry-fetch"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No files found in this location</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Make sure your files are shared with the connected account
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {files.map((file) => {
                    const folder = isFolder(file);
                    return (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedFiles.has(file.id)
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          if (folder) {
                            handleFolderClick(file.id, file.name);
                          } else {
                            handleFileToggle(file.id);
                          }
                        }}
                        data-testid={`cloud-file-${file.id}`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-2">
                            {file.modifiedTime && (
                              <p className="text-xs text-muted-foreground">
                                Modified {new Date(file.modifiedTime).toLocaleDateString()}
                              </p>
                            )}
                            {file.size && (
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        {folder ? (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : selectedFiles.has(file.id) ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {getFileLabel(file)}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
