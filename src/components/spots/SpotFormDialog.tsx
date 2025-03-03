
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

interface SpotFormDialogProps {
  spot?: Spot | null;
  onClose: () => void;
}

export const SpotFormDialog = ({ spot, onClose }: SpotFormDialogProps) => {
  const {
    isEditing,
    isSubmitting,
    selectedWeatherConditions,
    register,
    handleSubmit,
    errors,
    watch,
    requiresAuth,
    latitude,
    longitude,
    handleWeatherConditionChange,
    handleLocationChange,
    handleAuthRequiredChange,
    handleAuthLinkChange,
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
                onValueChange={(value) => register("type").onChange({ target: { value: value as SpotType } })}
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
          
          <DialogFooter>
            <Button onClick={() => onClose()} type="button" variant="outline">Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? "Enregistrement..." 
                : isEditing 
                  ? "Mettre à jour" 
                  : "Ajouter"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
