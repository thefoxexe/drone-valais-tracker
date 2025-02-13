
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InstagramStatsForm } from "./InstagramStatsForm";

interface InstagramHeaderProps {
  onStatsUpdate: () => void;
}

export const InstagramHeader = ({ onStatsUpdate }: InstagramHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-10 bg-card/30 p-6 rounded-xl backdrop-blur-md">
      <div className="flex items-center space-x-6">
        <img 
          src="/lovable-uploads/a6e0c54f-1eeb-4e27-b67d-1da98918ba36.png"
          alt="Instagram Logo"
          className="w-24 h-24 object-contain"
        />
        <div>
          <h2 className="text-3xl font-bold mb-2">Drone Valais Production</h2>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Ajouter des statistiques Instagram</SheetTitle>
            </SheetHeader>
            <InstagramStatsForm onSuccess={onStatsUpdate} />
          </SheetContent>
        </Sheet>
        <img 
          src="/lovable-uploads/7090a80c-d493-413b-a458-7b7e5296e1ac.png"
          alt="Instagram Logo"
          className="h-20 w-auto"
        />
      </div>
    </div>
  );
};
