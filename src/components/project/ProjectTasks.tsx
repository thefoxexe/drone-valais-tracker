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
    const { error } = await supabase
      .from("project_tasks")
      .update({ completed })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["projects"] });
    toast({
      title: "Succès",
      description: `Tâche ${completed ? "complétée" : "réinitialisée"}`,
    });
  };

  return (
    <div className="space-y-4">
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
              className={`text-sm ${
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