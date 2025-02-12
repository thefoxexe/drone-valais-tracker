
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order_index: number;
}

interface Project {
  id: string;
  project_tasks: Task[];
}

interface ProjectTasksProps {
  project: Project;
}

export const ProjectTasks = ({ project }: ProjectTasksProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      console.log("Mise à jour de la tâche:", taskId, "completed:", completed);
      
      // Mise à jour de la tâche
      const { error: taskError } = await supabase
        .from("project_tasks")
        .update({ completed })
        .eq("id", taskId);

      if (taskError) {
        console.error("Erreur lors de la mise à jour de la tâche:", taskError);
        throw taskError;
      }

      // Vérifier si toutes les tâches sont complétées après cette mise à jour
      const updatedTasks = [...project.project_tasks];
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex].completed = completed;
      }

      const allTasksCompleted = updatedTasks.every(task => task.completed);
      
      // Si toutes les tâches sont complétées, archiver automatiquement le projet
      if (allTasksCompleted) {
        console.log("Toutes les tâches sont complétées, archivage automatique du projet:", project.id);
        
        const { error: archiveError } = await supabase
          .from("projects")
          .update({ archived: true })
          .eq("id", project.id);

        if (archiveError) {
          console.error("Erreur lors de l'archivage automatique:", archiveError);
          throw archiveError;
        }

        toast({
          title: "Projet archivé",
          description: "Toutes les tâches sont terminées, le projet a été archivé",
        });
      }

      // Rafraîchir les deux listes pour s'assurer que l'état est à jour
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects", "active"] }),
        queryClient.invalidateQueries({ queryKey: ["projects", "archived"] })
      ]);
      
      toast({
        title: "Succès",
        description: `Tâche ${completed ? "complétée" : "réinitialisée"}`,
      });
    } catch (error) {
      console.error("Erreur détaillée lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2 md:space-y-4">
      {project.project_tasks
        .sort((a, b) => a.order_index - b.order_index)
        .map((task) => (
          <div key={task.id} className="flex items-center space-x-2">
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={(checked) => {
                handleTaskToggle(task.id, checked as boolean);
              }}
            />
            <label
              htmlFor={task.id}
              className={`text-xs md:text-sm ${
                task.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.description}
            </label>
          </div>
        ))}
    </div>
  );
};
