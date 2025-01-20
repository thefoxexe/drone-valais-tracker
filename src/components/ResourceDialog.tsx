import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ResourceUpload } from "./ResourceUpload";
import { ResourceList } from "./ResourceList";
import { useQueryClient } from "@tanstack/react-query";

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResourceDialog = ({ open, onOpenChange }: ResourceDialogProps) => {
  const queryClient = useQueryClient();

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["resources"] });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ressources</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <ResourceUpload onUploadComplete={handleUploadComplete} />
          <ResourceList />
        </div>
      </SheetContent>
    </Sheet>
  );
};