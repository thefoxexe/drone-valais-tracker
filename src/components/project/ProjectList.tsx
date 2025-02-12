
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProjectTasks } from "./ProjectTasks";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Project {
  id: string;
  name: string;
  status: string;
  project_tasks: Array<{
    id: string;
    description: string;
    completed: boolean;
    order_index: number;
  }>;
}

interface ProjectListProps {
  projects: Project[];
}

export const ProjectList = ({ projects }: ProjectListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (projectId: string) => {
    try {
      // First, delete all tasks associated with the project
      const { error: tasksError } = await supabase
        .from("project_tasks")
        .delete()
        .eq("project_id", projectId);

      if (tasksError) {
        console.error("Error deleting tasks:", tasksError);
        throw tasksError;
      }

      // Then delete the project
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (projectError) {
        console.error("Error deleting project:", projectError);
        throw projectError;
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Succès",
        description: "Projet supprimé",
      });
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive",
      });
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    return (
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
    );
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      {projects.length === 0 && (
        <p className="text-center text-muted-foreground">Aucun projet</p>
      )}
    </div>
  );
};
