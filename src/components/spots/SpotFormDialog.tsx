
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Spot, SpotType, WeatherCondition } from "@/types/spots";
import { SPOT_TYPE_LABELS, WEATHER_CONDITION_LABELS } from "./spot-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SpotFormDialogProps {
  spot?: Spot | null;
  onClose: () => void;
}

export const SpotFormDialog = ({ spot, onClose }: SpotFormDialogProps) => {
  const isEditing = !!spot;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeatherConditions, setSelectedWeatherConditions] = useState<WeatherCondition[]>(
    spot?.ideal_weather as WeatherCondition[] || []
  );
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Spot>({
    defaultValues: {
      name: spot?.name || "",
      latitude: spot?.latitude || 46.2044, // Valais par défaut
      longitude: spot?.longitude || 7.3601,
      type: spot?.type || "urbain",
      requires_authorization: spot?.requires_authorization || false,
      authorization_link: spot?.authorization_link || "",
      description: spot?.description || "",
    }
  });
  
  const requiresAuth = watch("requires_authorization");
  
  const onSubmit = async (data: Spot) => {
    setIsSubmitting(true);
    
    try {
      const spotData = {
        ...data,
        ideal_weather: selectedWeatherConditions,
      };
      
      let result;
      
      if (isEditing && spot) {
        // Mise à jour d'un spot existant
        result = await supabase
          .from("filming_spots")
          .update(spotData)
          .eq("id", spot.id);
      } else {
        // Création d'un nouveau spot
        result = await supabase
          .from("filming_spots")
          .insert([spotData]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success(isEditing ? "Spot mis à jour avec succès" : "Spot créé avec succès");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement du spot");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleWeatherConditionChange = (condition: WeatherCondition) => {
    setSelectedWeatherConditions(prev => {
      if (prev.includes(condition)) {
        return prev.filter(c => c !== condition);
      } else {
        return [...prev, condition];
      }
    });
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                error={errors.name ? "Ce champ est requis" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">Ce champ est requis</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                defaultValue={spot?.type || "urbain"} 
                onValueChange={(value) => setValue("type", value as SpotType)}
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
            
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input 
                id="latitude" 
                type="number" 
                step="0.000001"
                {...register("latitude", { required: true, valueAsNumber: true })} 
                placeholder="46.2044"
              />
              {errors.latitude && <p className="text-sm text-destructive">Ce champ est requis</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input 
                id="longitude" 
                type="number" 
                step="0.000001"
                {...register("longitude", { required: true, valueAsNumber: true })} 
                placeholder="7.3601"
              />
              {errors.longitude && <p className="text-sm text-destructive">Ce champ est requis</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requires_authorization" 
                checked={requiresAuth}
                onCheckedChange={(checked) => setValue("requires_authorization", checked === true)}
              />
              <Label htmlFor="requires_authorization">Nécessite une autorisation</Label>
            </div>
            
            {requiresAuth && (
              <div className="mt-2">
                <Label htmlFor="authorization_link">Lien vers les informations d'autorisation</Label>
                <Input 
                  id="authorization_link" 
                  {...register("authorization_link")} 
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Conditions météo idéales</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(WEATHER_CONDITION_LABELS).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`weather-${value}`} 
                    checked={selectedWeatherConditions.includes(value as WeatherCondition)}
                    onCheckedChange={() => handleWeatherConditionChange(value as WeatherCondition)}
                  />
                  <Label htmlFor={`weather-${value}`}>{label}</Label>
                </div>
              ))}
            </div>
          </div>
          
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
