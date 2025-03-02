
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Spot, SpotType, WeatherCondition } from "@/types/spots";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SPOT_TYPE_LABELS, WEATHER_CONDITION_LABELS } from "./spot-utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SpotFormDialogProps {
  spot?: Spot | null;
  onClose: () => void;
}

type FormValues = {
  name: string;
  latitude: number;
  longitude: number;
  type: SpotType;
  requires_authorization: boolean;
  authorization_link?: string;
  description?: string;
};

export const SpotFormDialog = ({ spot, onClose }: SpotFormDialogProps) => {
  const { toast } = useToast();
  const [weatherConditions, setWeatherConditions] = useState<WeatherCondition[]>(
    spot?.ideal_weather || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: spot?.name || "",
      latitude: spot?.latitude || 46.2044,
      longitude: spot?.longitude || 7.3601,
      type: spot?.type || "autre",
      requires_authorization: spot?.requires_authorization || false,
      authorization_link: spot?.authorization_link || "",
      description: spot?.description || "",
    },
  });

  const requiresAuth = form.watch("requires_authorization");

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const spotData = {
        ...data,
        ideal_weather: weatherConditions,
      };
      
      let result;
      
      if (spot) {
        // Update existing spot
        result = await supabase
          .from("filming_spots")
          .update(spotData)
          .eq("id", spot.id);
      } else {
        // Create new spot
        result = await supabase
          .from("filming_spots")
          .insert(spotData);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: spot ? "Spot mis à jour" : "Spot créé",
        description: spot
          ? "Le spot a été mis à jour avec succès."
          : "Le nouveau spot a été créé avec succès.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving spot:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du spot.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWeatherCondition = (condition: WeatherCondition) => {
    if (!weatherConditions.includes(condition)) {
      setWeatherConditions([...weatherConditions, condition]);
    }
  };

  const handleRemoveWeatherCondition = (condition: WeatherCondition) => {
    setWeatherConditions(weatherConditions.filter(c => c !== condition));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{spot ? "Modifier le spot" : "Ajouter un nouveau spot"}</DialogTitle>
          <DialogDescription>
            {spot
              ? "Modifiez les informations du spot de tournage."
              : "Remplissez le formulaire pour ajouter un nouveau spot de tournage."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Le nom est obligatoire" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du spot</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Château de Valère" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                rules={{ required: "La latitude est obligatoire" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="Ex: 46.2044"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                rules={{ required: "La longitude est obligatoire" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="Ex: 7.3601"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Le type est obligatoire" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de spot</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SPOT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="space-y-2">
              <FormLabel>Conditions météo idéales</FormLabel>
              <Select onValueChange={(value) => handleAddWeatherCondition(value as WeatherCondition)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(WEATHER_CONDITION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {weatherConditions.map(condition => (
                  <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                    {WEATHER_CONDITION_LABELS[condition]}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveWeatherCondition(condition)} 
                    />
                  </Badge>
                ))}
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="requires_authorization"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Nécessite une autorisation</FormLabel>
                    <FormDescription>
                      Ce spot nécessite-t-il une autorisation spéciale pour filmer ?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {requiresAuth && (
              <FormField
                control={form.control}
                name="authorization_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lien vers la procédure d'autorisation</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemple.ch/autorisation" {...field} />
                    </FormControl>
                    <FormDescription>
                      Lien vers la plateforme ou le formulaire pour demander l'autorisation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez ce spot de tournage..."
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Détails importants sur le spot, conditions particulières, accès, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : spot
                  ? "Mettre à jour"
                  : "Créer le spot"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
