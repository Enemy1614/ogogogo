import NavbarWrapper from "@/components/NavbarWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Settings, Trash, Loader2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useProjects, useDeleteProject, type Project } from "@/hooks/useProjects";
import { toast } from "sonner";

// Ряд списка кампаний в стиле эталона
interface ProjectRowProps {
  project: Project;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const ProjectRow = ({ project, onDelete, isDeleting }: ProjectRowProps) => {
  const navigate = useNavigate();

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}/edit`)}
      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-6 px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Открыть проект ${project.name ?? "проект"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/projects/${project.id}/edit`);
        }
      }}
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-200 flex items-center justify-center">
        <img
          src="/placeholder.svg"
          alt="Миниатюра проекта"
          className="w-7 h-7 object-cover rounded"
        />
      </div>

      {/* Name and status */}
      <div className="flex items-center gap-4 min-w-0">
        <span className="font-medium text-neutral-800 truncate">
          {project.name || "My campaign"}
        </span>
        <Badge variant="outline">Черновик</Badge>
      </div>

      {/* Date */}
      <span className="text-sm text-neutral-500 justify-self-end whitespace-nowrap">
        {formatDateTime(project.created_at)}
      </span>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={(e) => e.stopPropagation()}
            aria-label="Открыть действия"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/edit`)}>
            <Settings className="w-4 h-4 mr-2" />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(project.id)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash className="w-4 h-4 mr-2" />
            )}
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
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

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100/50 overflow-hidden">
      <NavbarWrapper>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Проекты</p>
                <h1 className="text-4xl font-bold text-black">Ваши проекты</h1>
              </div>
              <Button
                onClick={handleCreateProject}
                className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg px-5 py-2.5"
              >
                Новый проект
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

            {/* Projects List */}
            {!isLoading && !error && projects.length > 0 && (
              <div className="flex flex-col space-y-2">
                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onDelete={handleDeleteProject}
                    isDeleting={
                      deleteProjectMutation.isPending &&
                      (deleteProjectMutation.variables as unknown as string) === project.id
                    }
                  />
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
