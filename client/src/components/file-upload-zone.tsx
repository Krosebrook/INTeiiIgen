import { useCallback, useState } from "react";
import { Upload, File, X, FileSpreadsheet, FileText, Image, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onUrlSubmit?: (url: string) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  acceptedTypes?: string[];
  maxFiles?: number;
}

interface SelectedFile {
  file: File;
  id: string;
  preview?: string;
}

const getFileIcon = (type: string) => {
  if (type.includes("spreadsheet") || type.includes("csv") || type.includes("excel")) {
    return FileSpreadsheet;
  }
  if (type.includes("image")) {
    return Image;
  }
  if (type.includes("text") || type.includes("pdf") || type.includes("document")) {
    return FileText;
  }
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileUploadZone({
  onFilesSelected,
  onUrlSubmit,
  isUploading = false,
  uploadProgress = 0,
  acceptedTypes = [".csv", ".json", ".xlsx", ".xls", ".pdf", ".png", ".jpg", ".jpeg", ".md", ".txt"],
  maxFiles = 10,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [urlInput, setUrlInput] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    const newFiles: SelectedFile[] = files.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, maxFiles);
      const newFiles: SelectedFile[] = files.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
      }));

      setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
    }
  }, [maxFiles]);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles.map((f) => f.file));
    }
  }, [selectedFiles, onFilesSelected]);

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim() && onUrlSubmit) {
      onUrlSubmit(urlInput.trim());
      setUrlInput("");
    }
  }, [urlInput, onUrlSubmit]);

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="dropzone-file-upload"
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Drop files here</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Drag and drop your files, or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {acceptedTypes.slice(0, 6).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
            {acceptedTypes.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{acceptedTypes.length - 6} more
              </Badge>
            )}
          </div>
          <label>
            <input
              type="file"
              className="sr-only"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              data-testid="input-file-select"
            />
            <Button variant="outline" asChild>
              <span className="cursor-pointer" data-testid="button-browse-files">Browse Files</span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {onUrlSubmit && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Enter URL to import data (CSV, JSON, API endpoint)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="pl-10"
                  data-testid="input-url-import"
                />
              </div>
              <Button type="submit" disabled={!urlInput.trim()} data-testid="button-import-url">
                Import
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                data-testid="button-upload-files"
              >
                {isUploading ? "Uploading..." : "Upload All"}
              </Button>
            </div>

            {isUploading && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="space-y-2">
              {selectedFiles.map((item) => {
                const FileIcon = getFileIcon(item.file.type);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    data-testid={`file-item-${item.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(item.id)}
                      disabled={isUploading}
                      data-testid={`button-remove-file-${item.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
