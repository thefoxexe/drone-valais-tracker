
import { useState, useRef, useEffect } from "react";
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
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

// Utilisation de la clé API Mapbox
const MAPBOX_TOKEN = "pk.eyJ1IjoiYmFzdGllbnJ5c2VyIiwiYSI6ImNtN3JnbHQyZzBobW8ycnNlNXVuemtmYmEifQ.7qQos4iZs1ZRpe4hNBmYCw";

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
  
  // États pour la carte
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm<Spot>({
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
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  
  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || mapInitialized) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [getValues("longitude"), getValues("latitude")],
      zoom: 12,
    });
    
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );
    
    // Ajouter un marqueur par défaut
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([getValues("longitude"), getValues("latitude")])
      .addTo(map.current);
    
    // Événement lorsqu'on finit de déplacer le marqueur
    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        setValue("longitude", lngLat.lng);
        setValue("latitude", lngLat.lat);
      }
    });
    
    // Événement de clic sur la carte pour placer le marqueur
    map.current.on('click', (e) => {
      marker.current?.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      setValue("longitude", e.lngLat.lng);
      setValue("latitude", e.lngLat.lat);
    });
    
    setMapInitialized(true);
    
    return () => {
      map.current?.remove();
    };
  }, [setValue, getValues]);
  
  // Mise à jour du marqueur quand les coordonnées changent
  useEffect(() => {
    if (marker.current && map.current && mapInitialized) {
      marker.current.setLngLat([longitude, latitude]);
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true
      });
    }
  }, [latitude, longitude, mapInitialized]);
  
  // Fonction pour rechercher des lieux via l'API Mapbox
  const searchLocations = async () => {
    if (!searchQuery || searchQuery.length < 3) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );
      
      const data = await response.json();
      setSearchResults(data.features || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche de lieu");
    }
  };
  
  // Sélectionner un résultat de recherche
  const selectSearchResult = (result: any) => {
    if (result.center) {
      const [lng, lat] = result.center;
      setValue("longitude", lng);
      setValue("latitude", lat);
      
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true
        });
      }
      
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      }
      
      // Si le résultat a un nom de lieu, on peut le suggérer comme nom du spot
      if (!getValues("name") && result.place_name) {
        setValue("name", result.place_name.split(',')[0]);
      }
    }
    
    setShowSearchResults(false);
    setSearchQuery("");
  };
  
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
          </div>
          
          <div className="space-y-2">
            <Label>Emplacement du spot</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input 
                placeholder="Rechercher un lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocations())}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={searchLocations}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <Card className="absolute z-10 w-full max-w-md p-2 bg-background shadow-lg rounded-md">
                <ul className="space-y-1">
                  {searchResults.map((result, index) => (
                    <li 
                      key={index} 
                      className="p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => selectSearchResult(result)}
                    >
                      {result.place_name}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            <div className="relative h-64 border rounded-md overflow-hidden">
              <div ref={mapContainer} className="absolute inset-0" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  type="number" 
                  step="0.000001"
                  {...register("latitude", { required: true, valueAsNumber: true })} 
                  placeholder="46.2044"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  type="number" 
                  step="0.000001"
                  {...register("longitude", { required: true, valueAsNumber: true })} 
                  placeholder="7.3601"
                  className="mt-1"
                />
              </div>
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
