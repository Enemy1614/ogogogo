import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Upload, Music, Video, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProject, useCreateProject, useUpdateProject, type Project } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import DemoUploader from "@/components/DemoUploader";
import AudioUploadDialog from "@/components/AudioUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import HookUploader from "@/components/HookUploader";

interface ProjectFormData {
  name: string;
  description: string;
  target_audience: string;
  tone_of_voice: string;
  price_category: string;
  keywords: string;
  usp: string;
  cta: string;
  website_url: string;
}

const toneOptions = [
  { value: "professional", label: "Профессиональный" },
  { value: "friendly", label: "Дружелюбный" },
  { value: "casual", label: "Непринужденный" },
  { value: "humorous", label: "Юмористический" },
  { value: "authoritative", label: "Авторитетный" },
];

const priceCategoryOptions = [
  { value: "budget", label: "Бюджетный" },
  { value: "mid-range", label: "Средний сегмент" },
  { value: "premium", label: "Премиум" },
  { value: "luxury", label: "Люкс" },
];



const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // API hooks
  const { data: project, isLoading: isLoadingProject } = useProject(id);
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(true);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    target_audience: "",
    tone_of_voice: "",
    price_category: "",
    keywords: "",
    usp: "",
    cta: "",
    website_url: "",
  });
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [hookFiles, setHookFiles] = useState<File[]>([]);
  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false);
  const [isUploadingHooks, setIsUploadingHooks] = useState(false);
  const [projectDemos, setProjectDemos] = useState<{ id: number; demo_link: string }[]>([]);
  const [isLoadingDemos, setIsLoadingDemos] = useState(false);
  const [isUploadingDemos, setIsUploadingDemos] = useState(false);
  const [userSounds, setUserSounds] = useState<{ id: number; name: string; sound_link: string }[]>([]);
  const [isLoadingSounds, setIsLoadingSounds] = useState(false);
  const [selectedSoundId, setSelectedSoundId] = useState<number | null>(null);
  const [uploadedHooks, setUploadedHooks] = useState<{ url: string; name: string; size: number; type: string }[]>([]);
  const [projectHooks, setProjectHooks] = useState<{ id: number; hook_link: string }[]>([]);

  // Load project data when editing existing project
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        target_audience: project.target_audience,
        tone_of_voice: project.tone_of_voice,
        price_category: project.price_category || "",
        keywords: project.keywords || "",
        usp: project.usp || "",
        cta: project.cta || "",
        website_url: project.website_url || "",
      });
      
      // If project is not a draft, start from step 2
      if (project.status !== 'draft') {
        setIsProjectDetailsOpen(false);
        setCurrentStep(2);
      }

      // Hooks now managed in project_hooks table. We'll fetch them below.
    }
  }, [project]);

  // Fetch project demos when project id is available
  useEffect(() => {
    const fetchDemos = async () => {
      if (!id) return;
      setIsLoadingDemos(true);
      const { data, error } = await (supabase as any)
        .from("demo")
        .select("id, demo_link")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      if (!error && data) setProjectDemos(data as any);
      setIsLoadingDemos(false);
    };
    fetchDemos();
  }, [id]);

  // Fetch project hooks when project id is available
  useEffect(() => {
    const fetchHooks = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("project_hooks")
        .select("id, hook_link")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      if (!error && data) setProjectHooks(data as any);
    };
    fetchHooks();
  }, [id]);

  // Fetch user sounds and preselect project's sound
  useEffect(() => {
    const fetchSounds = async () => {
      if (!user) return;
      setIsLoadingSounds(true);
      const { data, error } = await (supabase as any)
        .from("sound")
        .select("id, name, sound_link")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setUserSounds(data as any);
      setIsLoadingSounds(false);
    };
    fetchSounds();
  }, [user]);

  // (Selection removed by design for this step)

  const handleProjectDetailsSubmit = async () => {
    if (!formData.name || !formData.description || !formData.target_audience || !formData.tone_of_voice) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    try {
      if (id && project) {
        // Update existing project
        await updateProjectMutation.mutateAsync({
          id,
          ...formData,
        });
      } else {
        // Create new project
        const newProject = await createProjectMutation.mutateAsync(formData);
        // Redirect to edit the newly created project
        navigate(`/projects/${newProject.id}/edit`, { replace: true });
      }
      
      setIsProjectDetailsOpen(false);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDemoUpload = (file: File) => {
    setDemoFile(file);
    setCurrentStep(3);
    toast.success("Демо видео загружено");
  };

  const handleAudioUpload = (file: File) => {
    setAudioFile(file);
    setCurrentStep(4);
    toast.success("Фоновая музыка загружена");
  };



  const handleFinalize = async () => {
    if (!id || !project) {
      toast.error("Ошибка: проект не найден");
      return;
    }

    try {
      // Update project status to active to start generation
      await updateProjectMutation.mutateAsync({
        id,
        status: "active",
      });
      
      toast.success("Проект создан! Начинаем генерацию видео...");
      navigate("/projects");
    } catch (error) {
      console.error("Error finalizing project:", error);
      toast.error("Ошибка при завершении создания проекта");
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Детали проекта";
      case 2: return "Загрузка демо-видео";
      case 3: return "Фоновая музыка";
      case 4: return "Выбор хуков";
      default: return "Создание проекта";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Загрузите демо-видео</h2>
              <p className="text-neutral-600">
                Загрузите пример видео вашего продукта или услуги.
              </p>
            </div>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
              <Video className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
              <p className="text-neutral-600 mb-4">Перетащите видео сюда или нажмите для выбора (можно несколько)</p>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length || !user || !id) return;
                  try {
                    setIsUploadingDemos(true);
                    const records: { demo_link: string; user_id: string; project_id: string }[] = [];
                    await Promise.all(
                      files.map(async (file) => {
                        const ext = file.name.split('.').pop();
                        const fileName = `demo_${Math.random().toString(36).slice(2)}_${Date.now()}.${ext}`;
                        const filePath = `${user.id}/${fileName}`;
                        const { data: signed } = await supabase.storage
                          .from('user-templates')
                          .createSignedUploadUrl(filePath);
                        if (!signed) throw new Error('Failed to get upload URL');
                        await new Promise<void>((resolve, reject) => {
                          const xhr = new XMLHttpRequest();
                          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`Upload failed ${xhr.status}`));
                          xhr.onerror = () => reject(new Error('Network error'));
                          xhr.open('PUT', signed.signedUrl);
                          xhr.send(file);
                        });
                        const { data: { publicUrl } } = supabase.storage
                          .from('user-templates')
                          .getPublicUrl(filePath);
                        records.push({ demo_link: publicUrl, user_id: user.id, project_id: id });
                      })
                    );
                    if (records.length) {
                      await (supabase as any)
                        .from('demo')
                        .insert(records);
                      const { data } = await (supabase as any)
                        .from('demo')
                        .select('id, demo_link')
                        .eq('project_id', id)
                        .order('created_at', { ascending: false });
                      setProjectDemos((data as any) || []);
                      toast.success(`Загружено ${records.length} демо`);
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error('Не удалось загрузить демо');
                  } finally {
                    setIsUploadingDemos(false);
                  }
                }}
                className="hidden"
                id="demo-multi-upload"
              />
              <label htmlFor="demo-multi-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файлы
                  </span>
                </Button>
              </label>
              {isUploadingDemos && (
                <p className="text-xs text-neutral-500 mt-2">Загрузка...</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Загруженные демо</h3>
              {isLoadingDemos ? (
                <div className="text-neutral-500 text-sm">Загрузка...</div>
              ) : projectDemos.length === 0 ? (
                <div className="text-neutral-500 text-sm">Пока нет демо-видео</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {projectDemos.map((d) => (
                    <div key={d.id} className="relative group">
                      <video src={d.demo_link} controls className="w-full rounded-lg" />
                      <button
                        aria-label="Удалить демо"
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        onClick={async () => {
                          try {
                            // Remove DB row
                            await (supabase as any).from('demo').delete().eq('id', d.id);
                            // Remove from storage if possible
                            const idx = d.demo_link.indexOf('/user-templates/');
                            if (idx !== -1) {
                              const path = d.demo_link.substring(idx + '/user-templates/'.length);
                              await (supabase as any).storage.from('user-templates').remove([path]);
                            }
                            setProjectDemos((prev) => prev.filter((x) => x.id !== d.id));
                            toast.success('Демо удалено');
                          } catch (err) {
                            console.error(err);
                            toast.error('Не удалось удалить демо');
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Добавьте фоновую музыку</h2>
              <p className="text-neutral-600">
                Загрузите аудио файл, который будет использоваться как фоновая музыка для ваших видео.
              </p>
            </div>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
              <Music className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
              <p className="text-neutral-600 mb-4">Перетащите аудио сюда или нажмите для выбора (можно несколько)</p>
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length || !user) return;
                  try {
                    setIsLoadingSounds(true);
                    const uploaded: { id: number; name: string; sound_link: string }[] = [];
                    // Upload sequentially to keep it simple
                    for (const file of files) {
                      const ext = file.name.split('.').pop();
                      const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${ext}`;
                      const filePath = `${user.id}/${fileName}`;
                      const { data: signed } = await supabase.storage
                        .from('user-templates')
                        .createSignedUploadUrl(filePath);
                      if (!signed) throw new Error('Failed to get upload URL');
                      await new Promise<void>((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`Upload failed ${xhr.status}`));
                        xhr.onerror = () => reject(new Error('Network error'));
                        xhr.open('PUT', signed.signedUrl);
                        xhr.send(file);
                      });
                      const { data: { publicUrl } } = supabase.storage
                        .from('user-templates')
                        .getPublicUrl(filePath);
                      const { data, error } = await (supabase as any)
                        .from('sound')
                        .insert({ name: file.name, sound_link: publicUrl, user_id: user.id })
                        .select('id, name, sound_link')
                        .single();
                      if (error) throw error;
                      uploaded.push(data);
                    }
                    setUserSounds((prev) => [...uploaded, ...prev]);
                    toast.success(`Загружено аудио: ${uploaded.length}`);
                  } catch (err) {
                    console.error(err);
                    toast.error('Не удалось загрузить аудио');
                  } finally {
                    setIsLoadingSounds(false);
                  }
                }}
                className="hidden"
                id="audio-multi-upload"
              />
              <label htmlFor="audio-multi-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файлы
                  </span>
                </Button>
              </label>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Ваши аудио</h3>
              {isLoadingSounds ? (
                <div className="text-neutral-500 text-sm">Загрузка...</div>
              ) : userSounds.length === 0 ? (
                <div className="text-neutral-500 text-sm">Пока нет аудио</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {userSounds.map((s) => (
                    <div key={s.id} className="p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-medium">{s.name}</div>
                        <button
                          aria-label="Удалить аудио"
                          className="ml-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          onClick={async () => {
                            try {
                              await (supabase as any).from('sound').delete().eq('id', s.id);
                              const idx = s.sound_link.indexOf('/user-templates/');
                              if (idx !== -1) {
                                const path = s.sound_link.substring(idx + '/user-templates/'.length);
                                await (supabase as any).storage.from('user-templates').remove([path]);
                              }
                              setUserSounds((prev) => prev.filter((x) => x.id !== s.id));
                              toast.success('Аудио удалено');
                            } catch (err) {
                              console.error(err);
                              toast.error('Не удалось удалить аудио');
                            }
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <audio className="mt-2 w-full" src={s.sound_link} controls />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <AudioUploadDialog
              isOpen={isAudioDialogOpen}
              onClose={() => setIsAudioDialogOpen(false)}
              onSuccess={async (soundId) => {
                // Stay on step; refresh list and select uploaded
                setSelectedSoundId(soundId);
                if (user) {
                  const { data } = await (supabase as any)
                    .from('sound')
                    .select('id, name, sound_link')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                  setUserSounds((data as any) || []);
                }
              }}
            />
          </div>
        );

      case 4:
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Загрузите видео-хуки</h2>
              <p className="text-neutral-600">
                Загрузите видео-хуки, которые будут использоваться для привлечения внимания в ваших видео.
              </p>
            </div>
            
            {/* Загрузка хуков через отдельный компонент, как у демо */}
            {id && (
              <HookUploader projectId={id} onUploaded={async () => {
                const { data } = await supabase
                  .from('project_hooks')
                  .select('id, hook_link')
                  .eq('project_id', id)
                  .order('created_at', { ascending: false });
                setProjectHooks((data as any) || []);
              }} />
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Загруженные хуки</h3>
              {projectHooks.length === 0 ? (
                <div className="text-neutral-500 text-sm">Пока нет хуков</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {projectHooks.map((h) => (
                    <div key={h.id} className="relative group">
                      <video
                        src={h.hook_link}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full rounded-lg aspect-[9/16] bg-neutral-100"
                      />
                      <button
                        aria-label="Удалить хук"
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        onClick={async () => {
                          try {
                            await supabase.from('project_hooks').delete().eq('id', h.id);
                            const idx = h.hook_link.indexOf('/user-templates/');
                            if (idx !== -1) {
                              const path = h.hook_link.substring(idx + '/user-templates/'.length);
                              await supabase.storage.from('user-templates').remove([path]);
                            }
                            setProjectHooks((prev) => prev.filter((x) => x.id !== h.id));
                            toast.success('Хук удалён');
                          } catch (err) {
                            console.error(err);
                            toast.error('Не удалось удалить хук');
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading spinner while loading project data
  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
          <span className="text-neutral-600">Загрузка проекта...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Project Details Modal - Step 1 */}
      <Dialog open={isProjectDetailsOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить проект</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Название проекта *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название проекта"
              />
            </div>

            <div>
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Будет использовано для генерации хуков и идей для видео. Чем больше деталей, тем лучше."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="target_audience">Целевая аудитория *</Label>
              <Textarea
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                placeholder="Опишите портрет идеального клиента. ИИ будет формировать целевые действия, опираясь на это описание."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tone_of_voice">Тон общения *</Label>
              <Select value={formData.tone_of_voice} onValueChange={(value) => setFormData({ ...formData, tone_of_voice: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тон общения" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price_category">Ценовая категория</Label>
              <Select value={formData.price_category} onValueChange={(value) => setFormData({ ...formData, price_category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите ценовую категорию" />
                </SelectTrigger>
                <SelectContent>
                  {priceCategoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="keywords">Ключевые слова (необязательно)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Введите ключевые слова через запятую"
              />
            </div>

            <div>
              <Label htmlFor="usp">Уникальное предложение (необязательно)</Label>
              <Textarea
                id="usp"
                value={formData.usp}
                onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
                placeholder="Что делает ваш продукт уникальным?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="cta">Призыв к действию (необязательно)</Label>
              <Input
                id="cta"
                value={formData.cta}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                placeholder="Например: Закажите сейчас, Подпишитесь"
              />
            </div>

            <div>
              <Label htmlFor="website_url">Сайт или соцсеть (необязательно)</Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/projects")}>
                Отмена
              </Button>
              <Button 
                onClick={handleProjectDetailsSubmit}
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              >
                {(createProjectMutation.isPending || updateProjectMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Продолжить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Steps 2-4 */}
      {!isProjectDetailsOpen && (
        <div className="container mx-auto py-8 px-4">
          {/* Navigation breadcrumb */}
          <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 mb-8">
            {[
              { display: 2, label: 'Продукт' as const },
              { display: 3, label: 'Демо' as const, targetStep: 2 },
              { display: 4, label: 'Музыка' as const, targetStep: 3 },
              { display: 5, label: 'Хуки' as const, targetStep: 4 },
            ].map((item) => {
              const isActive = item.targetStep ? currentStep === item.targetStep : false;
              const handleClick = () => {
                if (item.label === 'Продукт') {
                  setIsProjectDetailsOpen(true);
                  return;
                }
                if (item.targetStep) setCurrentStep(item.targetStep);
              };
              return (
                <div key={item.display} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'}`}
                    onClick={handleClick}
                    aria-label={`Перейти к шагу ${item.label}`}
                  >
                    {item.display}
                  </button>
                  <button
                    type="button"
                    className={`${isActive ? 'font-medium text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                    onClick={handleClick}
                    aria-label={`Перейти к шагу ${item.label}`}
                  >
                    {item.label}
                  </button>
              </div>
              );
            })}
          </div>

          {/* Step content */}
          <div className="min-h-[60vh] flex items-center justify-center">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-neutral-200 max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => {
                if (currentStep > 2) {
                  setCurrentStep(currentStep - 1);
                } else {
                  navigate("/projects");
                }
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            
            <div className="text-sm text-neutral-500">
              {currentStep + 1}/5
            </div>
            
            {currentStep === 4 ? (
              <Button 
                onClick={async () => {
                  if (!id) return;
                  try {
                    // Persist hooks and selected sound before starting
                    const updates: any = {};
                    if (uploadedHooks.length > 0) updates.hooks = uploadedHooks as any;
                    if (selectedSoundId) updates.sound_id = selectedSoundId as any;
                    if (Object.keys(updates).length > 0) {
                      await updateProjectMutation.mutateAsync({ id, ...updates } as any);
                    }
                    await handleFinalize();
                  } catch (e) {
                    console.error(e);
                    toast.error('Не удалось сохранить данные проекта');
                  }
                }}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800"
                disabled={updateProjectMutation.isPending || isUploadingHooks}
              >
                {updateProjectMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Сохранить и начать создавать
              </Button>
            ) : (
              <Button 
                onClick={async () => {
                  // Persist selection/progress between steps
                  if (!id) {
                    setCurrentStep(currentStep + 1);
                    return;
                  }
                  try {
                    if (currentStep === 3 && selectedSoundId) {
                      await updateProjectMutation.mutateAsync({ id, sound_id: selectedSoundId } as any);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800"
              >
                Продолжить
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEdit;
