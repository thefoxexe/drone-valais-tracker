import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectTasks } from "./ProjectTasks";

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
  return (
    <div className="grid gap-6">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectTasks project={project} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};