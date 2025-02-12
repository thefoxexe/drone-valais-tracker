
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProjectTasks } from "./ProjectTasks";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order_index: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  archived: boolean;
  project_tasks: Task[];
  invoice_id: string;
}

interface ProjectListProps {
  projects: Project[];
  showArchiveButton: boolean;
}

export const ProjectList = ({ projects, showArchiveButton }: ProjectListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (projectId: string) => {
    try {
      console.log("Suppression du projet:", projectId);
      
      // D'abord, supprimer toutes les tâches associées au projet
      const { error: tasksError } = await supabase
        .from("project_tasks")
        .delete()
        .eq("project_id", projectId);

      if (tasksError) {
        console.error("Erreur lors de la suppression des tâches:", tasksError);
        throw tasksError;
      }

      // Ensuite, supprimer le projet
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (projectError) {
        console.error("Erreur lors de la suppression du projet:", projectError);
        throw projectError;
      }

      // Rafraîchir les données
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects", "active"] }),
        queryClient.invalidateQueries({ queryKey: ["projects", "archived"] })
      ]);
      
      toast({
        title: "Succès",
        description: "Projet supprimé",
      });
    } catch (error) {
      console.error("Erreur détaillée lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectTasks project={project} />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(project.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </CardFooter>
        </Card>
      ))}
      {projects.length === 0 && (
        <p className="text-center text-muted-foreground">Aucun projet</p>
      )}
    </div>
  );
};
