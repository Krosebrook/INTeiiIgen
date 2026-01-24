import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "Upload successful",
        description: `${data.count || 1} file(s) uploaded and processed.`,
      });
      navigate("/sources");
    },
    onError: (error: Error) => {
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
        description: "Data from the URL is being processed.",
      });
      navigate("/sources");
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFilesSelected = (files: File[]) => {
    uploadMutation.mutate(files);
  };

  const handleUrlSubmit = (url: string) => {
    urlImportMutation.mutate(url);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground">
          Upload files or import from URLs to create data sources for your dashboards.
        </p>
      </div>

      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        onUrlSubmit={handleUrlSubmit}
        isUploading={uploadMutation.isPending}
        acceptedTypes={[".csv", ".json", ".xlsx", ".xls", ".pdf", ".png", ".jpg", ".jpeg", ".md", ".txt"]}
        maxFiles={10}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supported Formats</CardTitle>
          <CardDescription>
            We support a wide range of data formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">Spreadsheets</p>
              <ul className="text-muted-foreground space-y-1">
                <li>CSV</li>
                <li>Excel (xlsx, xls)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Structured Data</p>
              <ul className="text-muted-foreground space-y-1">
                <li>JSON</li>
                <li>API responses</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Documents</p>
              <ul className="text-muted-foreground space-y-1">
                <li>PDF</li>
                <li>Markdown</li>
                <li>Text files</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Images</p>
              <ul className="text-muted-foreground space-y-1">
                <li>PNG</li>
                <li>JPEG</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
