
import { useRef, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Utilisation de la clé API Mapbox
const MAPBOX_TOKEN = "pk.eyJ1IjoiYmFzdGllbnJ5c2VyIiwiYSI6ImNtN3JnbHQyZzBobW8ycnNlNXVuemtmYmEifQ.7qQos4iZs1ZRpe4hNBmYCw";

interface LocationSelectorProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  suggestSpotName?: (placeName: string | null) => void;
}

export const LocationSelector = ({ 
  latitude, 
  longitude, 
  onLocationChange,
  suggestSpotName
}: LocationSelectorProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || mapInitialized) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 12,
    });
    
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );
    
    // Ajouter un marqueur par défaut
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map.current);
    
    // Événement lorsqu'on finit de déplacer le marqueur
    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        onLocationChange(lngLat.lat, lngLat.lng);
        // Essayer de faire une géolocalisation inverse pour obtenir le nom du lieu
        reverseGeocode(lngLat.lat, lngLat.lng);
      }
    });
    
    // Événement de clic sur la carte pour placer le marqueur
    map.current.on('click', (e) => {
      marker.current?.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      onLocationChange(e.lngLat.lat, e.lngLat.lng);
      // Essayer de faire une géolocalisation inverse pour obtenir le nom du lieu
      reverseGeocode(e.lngLat.lat, e.lngLat.lng);
    });
    
    setMapInitialized(true);
    
    return () => {
      map.current?.remove();
    };
  }, [longitude, latitude, onLocationChange]);
  
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
    if (!searchQuery || searchQuery.length < 3) {
      toast.error("Veuillez entrer au moins 3 caractères pour la recherche");
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
        setShowSearchResults(true);
      } else {
        toast.info("Aucun résultat trouvé pour cette recherche");
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche de lieu");
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };
  
  // Fonction pour la géolocalisation inverse (obtenir le nom du lieu à partir des coordonnées)
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!suggestSpotName) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la géolocalisation inverse");
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Essayer de trouver un nom pertinent
        const place = data.features.find((f: any) => 
          f.place_type.includes('poi') || 
          f.place_type.includes('place') || 
          f.place_type.includes('neighborhood')
        ) || data.features[0];
        
        const placeName = place.text || place.place_name.split(',')[0];
        suggestSpotName(placeName);
      }
    } catch (error) {
      console.error("Erreur lors de la géolocalisation inverse:", error);
    }
  };
  
  // Sélectionner un résultat de recherche
  const selectSearchResult = (result: any) => {
    if (result.center) {
      const [lng, lat] = result.center;
      onLocationChange(lat, lng);
      
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
      
      // Suggérer le nom du lieu
      if (suggestSpotName) {
        const placeName = result.text || result.place_name.split(',')[0];
        suggestSpotName(placeName);
      }
    }
    
    setShowSearchResults(false);
    setSearchQuery("");
  };
  
  return (
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
      
      {/* Les champs latitude et longitude sont masqués mais restent fonctionnels */}
      <div className="hidden">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input 
            id="latitude" 
            type="number" 
            step="0.000001"
            value={latitude}
            onChange={(e) => onLocationChange(parseFloat(e.target.value), longitude)}
            placeholder="46.2044"
          />
        </div>
        
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input 
            id="longitude" 
            type="number" 
            step="0.000001"
            value={longitude}
            onChange={(e) => onLocationChange(latitude, parseFloat(e.target.value))}
            placeholder="7.3601"
          />
        </div>
      </div>
    </div>
  );
};
