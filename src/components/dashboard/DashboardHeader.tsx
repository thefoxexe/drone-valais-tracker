interface DashboardHeaderProps {
  title: string;
  description: string;
}

export const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
};