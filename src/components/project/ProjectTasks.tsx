
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
    const { error: taskError } = await supabase
      .from("project_tasks")
      .update({ completed })
      .eq("id", taskId);

    if (taskError) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si toutes les tâches seront complétées après cette mise à jour
    const allTasksWillBeCompleted = project.project_tasks.every(task => 
      task.id === taskId ? completed : task.completed
    );

    if (allTasksWillBeCompleted) {
      // Archiver le projet
      const { error: projectError } = await supabase
        .from('projects')
        .update({ archived: true })
        .eq('id', project.id);

      if (projectError) {
        toast({
          title: "Erreur",
          description: "Impossible d'archiver le projet",
          variant: "destructive",
        });
        return;
      }
    }

    // Rafraîchir les données
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    
    toast({
      title: "Succès",
      description: `Tâche ${completed ? "complétée" : "réinitialisée"}`,
    });
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
