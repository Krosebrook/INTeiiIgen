import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AISuggestions } from "@/components/ai-suggestions";
import { useOnboarding } from "@/hooks/use-onboarding";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const UPLOAD_TIMEOUT_MS = 30000; // 30 second timeout

// LocalStorage keys for draft recovery
const DRAFT_KEY = 'dashgen_upload_draft';
const FAILED_QUEUE_KEY = 'dashgen_failed_uploads';

interface UploadDraft {
  files: Array<{ name: string; size: number; type: string; lastModified: number }>;
  timestamp: number;
}

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { completeChecklistItem } = useOnboarding();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftFiles, setDraftFiles] = useState<UploadDraft['files'] | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Check for draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { files, timestamp } = JSON.parse(draft) as UploadDraft;
        // Check if draft is less than 5 minutes old
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

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftFiles(null);
  }, []);

  // Save draft when files are selected
  const saveDraft = useCallback((files: File[]) => {
    const draft: UploadDraft = {
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
      })),
      timestamp: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, []);

  // Queue failed upload for retry
  const queueFailedUpload = useCallback((fileNames: string[]) => {
    try {
      const existing = localStorage.getItem(FAILED_QUEUE_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      queue.push({
        fileNames,
        timestamp: Date.now(),
        retryCount: 0,
      });
      localStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Upload with progress tracking using XMLHttpRequest
  const uploadWithProgress = useCallback((files: File[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('[Upload] Starting upload of', files.length, 'files');
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr; // Store ref for potential abort
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log('[Upload] Progress:', progress + '%');
          setUploadProgress(progress);
        }
      });

      xhr.upload.addEventListener('loadstart', () => {
        console.log('[Upload] Upload started');
        setUploadProgress(0);
      });

      xhr.addEventListener('load', () => {
        console.log('[Upload] Upload complete, status:', xhr.status);
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve({ count: files.length });
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const error = JSON.parse(xhr.responseText);
            errorMessage = error.error || error.message || errorMessage;
          } catch {
            errorMessage = xhr.responseText || errorMessage;
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        console.error('[Upload] Network error');
        xhrRef.current = null;
        reject(new Error('Network error - please check your connection'));
      });

      xhr.addEventListener('abort', () => {
        console.log('[Upload] Upload aborted');
        xhrRef.current = null;
        reject(new Error('Upload cancelled'));
      });

      xhr.addEventListener('timeout', () => {
        console.error('[Upload] Upload timeout after', UPLOAD_TIMEOUT_MS / 1000, 'seconds');
        xhrRef.current = null;
        reject(new Error(`Upload timeout after ${UPLOAD_TIMEOUT_MS / 1000} seconds - please try again`));
      });

      xhr.open('POST', '/api/upload');
      xhr.withCredentials = true;
      xhr.timeout = UPLOAD_TIMEOUT_MS; // Native XHR timeout handles the 30s limit
      xhr.send(formData);
    });
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      // XHR handles timeout via native xhr.timeout property
      const result = await uploadWithProgress(files);
      return result;
    },
    onSuccess: (data) => {
      console.log('[Upload] Success:', data);
      setUploadStatus('success');
      setUploadProgress(100);
      clearDraft();
      completeChecklistItem("upload-data");
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "Upload successful",
        description: `${data.count || 1} file(s) uploaded and processed.`,
      });
      // Small delay to show 100% before navigating
      setTimeout(() => {
        navigate("/sources");
      }, 500);
    },
    onError: (error: Error) => {
      console.error('[Upload] Error:', error);
      setUploadStatus('error');
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

  const handleFilesSelected = useCallback((files: File[]) => {
    console.log('[Upload] Files selected:', files.map(f => f.name));
    saveDraft(files);
    uploadMutation.mutate(files);
  }, [uploadMutation, saveDraft]);

  const handleUrlSubmit = useCallback((url: string) => {
    urlImportMutation.mutate(url);
  }, [urlImportMutation]);

  // Cleanup on unmount - abort any pending upload
  useEffect(() => {
    return () => {
      if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-upload-heading">Upload Data</h1>
        <p className="text-muted-foreground">
          Upload files or import from URLs to create data sources for your dashboards.
        </p>
      </div>

      {hasDraft && draftFiles && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm" data-testid="text-draft-recovery">
                  Resume previous upload?
                </p>
                <p className="text-xs text-muted-foreground">
                  Found {draftFiles.length} file(s): {draftFiles.map(f => f.name).join(', ')}
                </p>
              </div>
              <button
                onClick={clearDraft}
                className="text-xs text-muted-foreground hover:text-foreground underline"
                data-testid="button-dismiss-draft"
              >
                Dismiss
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <AISuggestions
        type="upload"
        onSelectSuggestion={(s) => {
          if (s.value?.action === 'dashboard') {
            toast({
              title: "Create Dashboard",
              description: "Upload your data first, then create a dashboard from it.",
            });
          } else if (s.value?.action === 'analyze') {
            toast({
              title: "AI Analysis",
              description: "Upload your data and we'll automatically analyze it with AI.",
            });
          } else if (s.value?.action === 'visualize') {
            toast({
              title: "Quick Visualization",
              description: "Upload data to create instant charts and visualizations.",
            });
          }
        }}
      />

      <div data-testid="zone-file-upload">
        <FileUploadZone
          onFilesSelected={handleFilesSelected}
          onFilesChanged={saveDraft}
          onUrlSubmit={handleUrlSubmit}
          isUploading={uploadMutation.isPending || uploadStatus === 'uploading'}
          uploadProgress={uploadProgress}
          uploadStatus={uploadStatus}
          acceptedTypes={[".csv", ".json", ".xlsx", ".xls", ".pdf", ".png", ".jpg", ".jpeg", ".md", ".txt"]}
          maxFiles={10}
        />
      </div>

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
