import NavbarWrapper from "@/components/NavbarWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Settings, Trash, Eye, Pause, Play, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useProjects, useDeleteProject, type Project } from "@/hooks/useProjects";
import { toast } from "sonner";



const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>;
    case 'generating':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">В процессе генерации</Badge>;
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Черновик</Badge>;
    case 'paused':
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Приостановлен</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Завершен</Badge>;
    default:
      return <Badge>Неизвестно</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <Play className="w-4 h-4 text-green-600" />;
    case 'generating':
      return <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
    case 'draft':
      return <Settings className="w-4 h-4 text-gray-600" />;
    case 'paused':
      return <Pause className="w-4 h-4 text-orange-600" />;
    case 'completed':
      return <Play className="w-4 h-4 text-green-600" />;
    default:
      return null;
  }
};

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: projects = [], isLoading, error } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleViewProject = (projectId: string) => {
    // Navigate to project details/dashboard
    console.log('View project:', projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavbarWrapper>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Мои проекты</h1>
                <p className="text-neutral-600 mt-1">
                  Управляйте своими UGC кампаниями и отслеживайте прогресс
                </p>
              </div>
              <Button 
                onClick={handleCreateProject}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить проект
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                <span className="ml-2 text-neutral-600">Загрузка проектов...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900">Ошибка загрузки</h3>
                    <p className="text-neutral-600 mt-1">
                      Не удалось загрузить проекты. Попробуйте обновить страницу.
                    </p>
                  </div>
                  <Button onClick={() => window.location.reload()}>
                    Обновить
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && projects.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900">Нет проектов</h3>
                    <p className="text-neutral-600 mt-1">
                      Создайте свой первый проект для автоматизации UGC контента
                    </p>
                  </div>
                  <Button onClick={handleCreateProject}>
                    Создать первый проект
                  </Button>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {!isLoading && !error && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Настройки
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-600"
                              disabled={deleteProjectMutation.isPending}
                            >
                              {deleteProjectMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Trash className="w-4 h-4 mr-2" />
                              )}
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(project.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <CardDescription className="text-sm mb-3 line-clamp-2">
                        {project.description}
                      </CardDescription>
                      
                      <div className="space-y-2 text-xs text-neutral-600">
                        <div className="flex justify-between">
                          <span>Создан:</span>
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleViewProject(project.id)}
                      >
                        Открыть проект
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </NavbarWrapper>
    </div>
  );
};

export default Projects;
