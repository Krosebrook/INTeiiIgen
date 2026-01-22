import { useState } from "react";
import { Cloud, FolderOpen, File, ChevronRight, Loader2, Check, HardDrive, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CloudFile {
  id: string;
  name: string;
  type: "file" | "folder";
  mimeType?: string;
  size?: number;
  modifiedTime?: string;
}

interface CloudConnectorProps {
  onFileSelect: (provider: string, fileId: string, fileName: string) => void;
}

const providers = [
  {
    id: "google_drive",
    name: "Google Drive",
    icon: HardDrive,
    color: "text-blue-500",
    description: "Connect to your Google Drive files",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    icon: Cloud,
    color: "text-sky-500",
    description: "Access Microsoft OneDrive documents",
  },
  {
    id: "notion",
    name: "Notion",
    icon: FileText,
    color: "text-foreground",
    description: "Import from Notion databases",
  },
];

export function CloudConnector({ onFileSelect }: CloudConnectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const handleProviderSelect = async (providerId: string) => {
    setSelectedProvider(providerId);
    setIsLoading(true);
    setFiles([]);
    setCurrentPath([]);

    try {
      const response = await fetch(`/api/cloud/${providerId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = async (folderId: string, folderName: string) => {
    if (!selectedProvider) return;
    
    setIsLoading(true);
    setCurrentPath((prev) => [...prev, folderName]);

    try {
      const response = await fetch(`/api/cloud/${selectedProvider}/files?folderId=${folderId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to fetch folder contents:", error);
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
    } else {
      setCurrentPath((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="space-y-4">
      {!selectedProvider ? (
        <div className="grid gap-4 md:grid-cols-3">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              className="cursor-pointer transition-all hover:shadow-md hover-elevate"
              onClick={() => handleProviderSelect(provider.id)}
              data-testid={`card-provider-${provider.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${provider.color}`}>
                    <provider.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{provider.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={goBack} data-testid="button-back">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No files found</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFiles.has(file.id)
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        if (file.type === "folder") {
                          handleFolderClick(file.id, file.name);
                        } else {
                          handleFileToggle(file.id);
                        }
                      }}
                      data-testid={`file-${file.id}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        {file.type === "folder" ? (
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <File className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        {file.modifiedTime && (
                          <p className="text-xs text-muted-foreground">
                            Modified {new Date(file.modifiedTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {file.type === "folder" ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : selectedFiles.has(file.id) ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {file.mimeType?.split("/").pop() || "file"}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
