
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectList } from "@/components/project/ProjectList";
import { Navigation } from "@/components/Navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const Projects = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("Fetching projects...");
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_tasks (
            *
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
      
      console.log("Projects fetched:", data);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader title="Projets" description="Gérez vos projets en cours" />
        {!isLoading && projects && <ProjectList projects={projects} />}
      </main>
    </div>
  );
};

export default Projects;
