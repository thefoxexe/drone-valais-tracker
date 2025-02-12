
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectList } from "@/components/project/ProjectList";
import { Navigation } from "@/components/Navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Projects = () => {
  const { data: activeProjects, isLoading: isLoadingActive } = useQuery({
    queryKey: ["projects", "active"],
    queryFn: async () => {
      console.log("Fetching active projects...");
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_tasks (
            *
          )
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching active projects:", error);
        throw error;
      }
      
      console.log("Active projects fetched:", data);
      return data;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: archivedProjects, isLoading: isLoadingArchived } = useQuery({
    queryKey: ["projects", "archived"],
    queryFn: async () => {
      console.log("Fetching archived projects...");
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_tasks (
            *
          )
        `)
        .eq('archived', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching archived projects:", error);
        throw error;
      }
      
      console.log("Archived projects fetched:", data);
      return data;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader title="Projets" description="Gérez vos projets en cours" />
        <Tabs defaultValue="active" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="archived">Archivés</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            {!isLoadingActive && activeProjects && (
              <ProjectList projects={activeProjects} showArchiveButton={true} />
            )}
          </TabsContent>
          <TabsContent value="archived" className="mt-6">
            {!isLoadingArchived && archivedProjects && (
              <ProjectList projects={archivedProjects} showArchiveButton={false} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Projects;
