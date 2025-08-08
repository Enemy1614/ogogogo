import { useState } from "react";
import { Upload, X, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type HookUploaderProps = {
  projectId: string;
  onUploaded: () => void;
};

const HookUploader = ({ projectId, onUploaded }: HookUploaderProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith("video/"));
    if (selected.length === 0) return;
    setFiles(selected);
  };
  
  const handleUpload = async () => {
    if (!user || files.length === 0) return;
    try {
      setIsUploading(true);
      setProgress(0);
      let uploadedCount = 0;

      for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `hook_${Math.random().toString(36).slice(2)}_${Date.now()}.${ext}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: signed } = await supabase.storage
          .from("user-templates")
          .createSignedUploadUrl(filePath);
        if (!signed) throw new Error("Failed to get upload URL");

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const percent = Math.round((ev.loaded / ev.total) * 100);
              setProgress(Math.round((uploadedCount * 100 + percent) / files.length));
            }
          };
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed ${xhr.status}`)));
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.open("PUT", signed.signedUrl);
          xhr.send(file);
        });

        const { data: publicData } = supabase.storage
          .from("user-templates")
          .getPublicUrl(filePath);

        const publicUrl = (publicData as any)?.publicUrl as string;

        const { error } = await supabase.from("project_hooks").insert({
          hook_link: publicUrl,
          user_id: user.id,
          project_id: projectId,
        });
        if (error) throw error;

        uploadedCount += 1;
        setProgress(Math.round((uploadedCount * 100) / files.length));
      }

      toast.success(`Загружено хуков: ${uploadedCount}`);
      setFiles([]);
      onUploaded();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Не удалось загрузить хуки");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
        <p className="text-neutral-600 mb-4">Перетащите видео-хуки сюда или нажмите для выбора (можно несколько)</p>
        <input id="hooks-input" type="file" accept="video/*" multiple onChange={handleSelectFiles} className="hidden" />
        <label htmlFor="hooks-input">
          <Button variant="outline" asChild>
            <span className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Выбрать файлы
            </span>
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded">
                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                  <FileVideo size={18} />
                </div>
                <div className="text-sm truncate">{f.name}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleUpload} disabled={isUploading} className="gap-2">
              {isUploading ? "Загрузка..." : "Загрузить"}
            </Button>
            {isUploading && <Progress value={progress} className="h-2 w-40" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default HookUploader;


