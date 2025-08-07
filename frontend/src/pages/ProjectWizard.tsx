import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Play, Video, Music, MessageSquare, Calendar } from "lucide-react";

const ProjectWizard = () => {
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    // Here we would create a new project draft in the database
    // For now, simulate creating a project and redirect to edit page
    const newProjectId = "c6174654-36fc-45cd-a73a-5c1946129712"; // This would come from the backend
    navigate(`/projects/${newProjectId}/edit`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Navigation breadcrumb */}
        <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
              1
            </div>
            <span className="font-medium text-neutral-900">Новая кампания</span>
          </div>
          <div className="w-2 h-px bg-neutral-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-xs">
              2
            </div>
            <span>Продукт</span>
          </div>
          <div className="w-2 h-px bg-neutral-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-xs">
              3
            </div>
            <span>Демо</span>
          </div>
          <div className="w-2 h-px bg-neutral-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-xs">
              4
            </div>
            <span>Музыка</span>
          </div>
          <div className="w-2 h-px bg-neutral-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-xs">
              5
            </div>
            <span>Хуки</span>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-neutral-900">
            Автоматизируйте ваш UGC
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Публикуйте ежедневно, свежие видео которые говорят голосом вашего бренда.
          </p>

          {/* Features list */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 text-neutral-600 mt-1">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="text-neutral-700 font-medium">Генерируйте UGC видео</span>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 text-neutral-600 mt-1">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <span className="text-neutral-700 font-medium">Авто-публикуйте ежедневно в множественные аккаунты</span>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 text-neutral-600 mt-1">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-neutral-700 font-medium">Свежее расписание каждую неделю</span>
              </div>
            </div>
          </div>

          {/* Demo video placeholder */}
          <div className="mt-12">
            <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                {/* This would be replaced with an actual demo video */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-2xl text-white">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Mock video thumbnails grid */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="relative">
                        <div className="aspect-[9/16] bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium">Сгенерировано</span>
                        </div>
                        {i < 5 && (
                          <div className="absolute bottom-1 right-1 w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="font-semibold text-lg">Ваша кампания</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-neutral-200">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          
          <div className="text-sm text-neutral-500">
            1/5
          </div>
          
          <Button 
            onClick={handleGetStarted}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800"
          >
            Начать
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectWizard;
