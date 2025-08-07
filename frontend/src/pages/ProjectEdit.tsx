import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Upload, Music, Video, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ProjectFormData {
  name: string;
  description: string;
  target_audience: string;
  tone: string;
  price_category: string;
  keywords: string;
  unique_proposition: string;
  call_to_action: string;
  website: string;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(true);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    target_audience: "",
    tone: "",
    price_category: "",
    keywords: "",
    unique_proposition: "",
    call_to_action: "",
    website: "",
  });
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [hookFiles, setHookFiles] = useState<File[]>([]);

  useEffect(() => {
    // If we have a project ID, we would load the project data here
    if (id) {
      console.log("Loading project:", id);
      // This would be replaced with actual API call
    }
  }, [id]);

  const handleProjectDetailsSubmit = () => {
    if (!formData.name || !formData.description || !formData.target_audience || !formData.tone) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    setIsProjectDetailsOpen(false);
    setCurrentStep(2);
    toast.success("Детали проекта сохранены");
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



  const handleFinalize = () => {
    // Here we would save all data and start the generation process
    toast.success("Проект создан! Начинаем генерацию видео...");
    navigate("/projects");
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
              <p className="text-neutral-600 mb-4">Перетащите видео сюда или нажмите для выбора</p>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDemoUpload(file);
                }}
                className="hidden"
                id="demo-upload"
              />
              <label htmlFor="demo-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файл
                  </span>
                </Button>
              </label>
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
              <p className="text-neutral-600 mb-4">Перетащите аудио файл сюда или нажмите для выбора</p>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioUpload(file);
                }}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файл
                  </span>
                </Button>
              </label>
            </div>
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
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
              <Video className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
              <p className="text-neutral-600 mb-4">Перетащите видео-хуки сюда или нажмите для выбора</p>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setHookFiles(files);
                    toast.success(`Загружено ${files.length} видео-хуков`);
                  }
                }}
                className="hidden"
                id="hooks-upload"
              />
              <label htmlFor="hooks-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файлы
                  </span>
                </Button>
              </label>
              <p className="text-xs text-neutral-500 mt-3">
                Можно выбрать несколько файлов
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
              <Label htmlFor="tone">Тон общения *</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
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
              <Label htmlFor="unique_proposition">Уникальное предложение (необязательно)</Label>
              <Textarea
                id="unique_proposition"
                value={formData.unique_proposition}
                onChange={(e) => setFormData({ ...formData, unique_proposition: e.target.value })}
                placeholder="Что делает ваш продукт уникальным?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="call_to_action">Призыв к действию (необязательно)</Label>
              <Input
                id="call_to_action"
                value={formData.call_to_action}
                onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
                placeholder="Например: Закажите сейчас, Подпишитесь"
              />
            </div>

            <div>
              <Label htmlFor="website">Сайт или соцсеть (необязательно)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/projects")}>
                Отмена
              </Button>
              <Button onClick={handleProjectDetailsSubmit}>
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
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-xs">
                1
              </div>
              <span className="text-neutral-900">Новая кампания</span>
            </div>
            <div className="w-2 h-px bg-neutral-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-xs">
                2
              </div>
              <span className="text-neutral-900">Продукт</span>
            </div>
            <div className="w-2 h-px bg-neutral-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 ${currentStep === 2 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'} rounded-full flex items-center justify-center text-xs`}>
                3
              </div>
              <span className={currentStep === 2 ? 'font-medium text-neutral-900' : currentStep > 2 ? 'text-neutral-900' : 'text-neutral-500'}>Демо</span>
            </div>
            <div className="w-2 h-px bg-neutral-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 ${currentStep === 3 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'} rounded-full flex items-center justify-center text-xs`}>
                4
              </div>
              <span className={currentStep === 3 ? 'font-medium text-neutral-900' : currentStep > 3 ? 'text-neutral-900' : 'text-neutral-500'}>Музыка</span>
            </div>
            <div className="w-2 h-px bg-neutral-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 ${currentStep === 4 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'} rounded-full flex items-center justify-center text-xs`}>
                5
              </div>
              <span className={currentStep === 4 ? 'font-medium text-neutral-900' : currentStep > 4 ? 'text-neutral-900' : 'text-neutral-500'}>Хуки</span>
            </div>
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
                onClick={handleFinalize}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800"
              >
                Сохранить и начать создавать
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
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
