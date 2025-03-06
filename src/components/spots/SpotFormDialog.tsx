import { useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Spot, SpotType } from "@/types/spots";
import { SPOT_TYPE_LABELS } from "./spot-utils";
import { LocationSelector } from "./LocationSelector";
import { WeatherConditionSelector } from "./WeatherConditionSelector";
import { AuthorizationSection } from "./AuthorizationSection";
import { useSpotForm } from "./useSpotForm";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SpotFormDialogProps {
  spot?: Spot | null;
  onClose: () => void;
}

export const SpotFormDialog = ({ spot, onClose }: SpotFormDialogProps) => {
  const {
    isEditing,
    isSubmitting,
    isDeleting,
    selectedWeatherConditions,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    requiresAuth,
    latitude,
    longitude,
    handleWeatherConditionChange,
    handleLocationChange,
    handleAuthRequiredChange,
    handleAuthLinkChange,
    handleDeleteSpot,
    suggestSpotName,
    onSubmit
  } = useSpotForm(spot || null, onClose);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le spot" : "Ajouter un nouveau spot"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifiez les informations du spot de tournage ci-dessous." 
              : "Remplissez les informations pour ajouter un nouveau spot de tournage."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du spot</Label>
              <Input 
                id="name" 
                {...register("name", { required: true })} 
                placeholder="Nom du lieu"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">Ce champ est requis</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                defaultValue={spot?.type || "urbain"} 
                onValueChange={(value: SpotType) => {
                  console.log("Nouveau type sélectionné:", value);
                  setValue("type", value);
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPOT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <LocationSelector 
            latitude={latitude} 
            longitude={longitude} 
            onLocationChange={handleLocationChange}
            suggestSpotName={suggestSpotName}
          />
          
          <AuthorizationSection 
            requiresAuth={requiresAuth}
            authLink={watch("authorization_link") || ""}
            onRequiresAuthChange={handleAuthRequiredChange}
            onAuthLinkChange={handleAuthLinkChange}
          />
          
          <WeatherConditionSelector 
            selectedConditions={selectedWeatherConditions}
            onChange={handleWeatherConditionChange}
          />
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="Description du lieu et informations complémentaires"
              rows={4}
            />
          </div>
          
          <DialogFooter className="flex justify-between w-full">
            <div>
              {isEditing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action ne peut pas être annulée. Cela supprimera définitivement ce spot de tournage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteSpot}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Suppression..." : "Supprimer"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onClose()} type="button" variant="outline">Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? "Enregistrement..." 
                  : isEditing 
                    ? "Mettre à jour" 
                    : "Ajouter"
                }
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
