import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  performance_score: number | null;
  uploaded_at: string;
}

interface FileUploadProps {
  userId: string;
  files: UploadedFile[];
  onRefresh: () => void;
}

export default function FileUpload({ userId, files, onRefresh }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase.storage.from("project-files").upload(filePath, file);
    if (storageError) {
      toast({ title: "Upload failed", description: storageError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    // Generate mock performance score
    const mockScore = Math.round((Math.random() * 30 + 70) * 100) / 100;

    const { error: dbError } = await supabase.from("uploaded_files").insert({
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      performance_score: mockScore,
    });

    if (dbError) {
      toast({ title: "Error saving record", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "File uploaded!", description: `Performance score: ${mockScore}%` });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    onRefresh();
  }, [userId, toast, onRefresh]);

  const handleDelete = async (id: string, filePath: string) => {
    await supabase.storage.from("project-files").remove([filePath]);
    await supabase.from("uploaded_files").delete().eq("id", id);
    toast({ title: "File deleted" });
    onRefresh();
  };

  return (
    <Card className="fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Project Files</CardTitle>
        <div>
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg" />
          <Button size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Upload className="mb-2 h-10 w-10" />
            <p className="text-sm">No files uploaded yet. Upload project documents to get a performance score.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{f.file_name}</p>
                    <p className="text-xs text-muted-foreground">{(f.file_size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {f.performance_score != null && (
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                      {f.performance_score}%
                    </span>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id, f.file_name)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
