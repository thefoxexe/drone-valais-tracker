
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProjectTasks } from "./ProjectTasks";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  status: string;
  archived: boolean;
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
  const [currentTab, setCurrentTab] = useState<string>("active");

  // Filtrage des projets
  const activeProjects = projects?.filter(p => !p.archived) || [];
  const archivedProjects = projects?.filter(p => p.archived) || [];

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

  const handleArchive = async (projectId: string, archived: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived })
        .eq('id', projectId);

      if (error) throw error;

      // Basculer immédiatement vers l'onglet archives après l'archivage
      if (archived) {
        setCurrentTab("archived");
      }

      // Force refresh the data
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      toast({
        title: "Succès",
        description: archived ? "Projet archivé" : "Projet désarchivé",
      });
    } catch (error) {
      console.error("Archive operation failed:", error);
      toast({
        title: "Erreur",
        description: `Impossible de ${archived ? 'archiver' : 'désarchiver'} le projet`,
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
          {!project.archived ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArchive(project.id, true)}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archiver
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArchive(project.id, false)}
            >
              <Archive className="h-4 w-4 mr-2" />
              Désarchiver
            </Button>
          )}
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
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList>
        <TabsTrigger value="active">Projets actifs ({activeProjects.length})</TabsTrigger>
        <TabsTrigger value="archived">Archives ({archivedProjects.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="space-y-6">
        {activeProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {activeProjects.length === 0 && (
          <p className="text-center text-muted-foreground">Aucun projet actif</p>
        )}
      </TabsContent>
      <TabsContent value="archived" className="space-y-6">
        {archivedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {archivedProjects.length === 0 && (
          <p className="text-center text-muted-foreground">Aucun projet archivé</p>
        )}
      </TabsContent>
    </Tabs>
  );
};
