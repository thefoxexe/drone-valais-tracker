import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProjectTasks } from "./ProjectTasks";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, ArchiveRestore } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

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
  archived_at: string | null;
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

  const handleArchiveToggle = async (projectId: string, currentlyArchived: boolean) => {
    try {
      console.log("Tentative d'archivage/désarchivage du projet:", projectId, "État actuel:", currentlyArchived);
      
      const { error } = await supabase
        .from("projects")
        .update({
          archived: !currentlyArchived,
          archived_at: !currentlyArchived ? new Date().toISOString() : null
        })
        .eq("id", projectId);

      if (error) {
        console.error("Erreur lors de la modification de l'archivage:", error);
        throw error;
      }

      // Rafraîchir les données
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      toast({
        title: "Succès",
        description: currentlyArchived ? "Projet désarchivé" : "Projet archivé",
      });
    } catch (error) {
      console.error("Erreur détaillée lors de l'archivage/désarchivage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'archivage du projet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{project.name}</span>
              {project.archived && project.archived_at && (
                <span className="text-sm text-muted-foreground">
                  Archivé le {format(new Date(project.archived_at), 'dd/MM/yyyy')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!project.archived && <ProjectTasks project={project} />}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArchiveToggle(project.id, project.archived)}
            >
              {project.archived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Désarchiver
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archiver
                </>
              )}
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
