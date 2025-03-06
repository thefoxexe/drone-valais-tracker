import { useRef, useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Toggle } from "@/components/ui/toggle";

// Utilisation de la clé API Mapbox
const MAPBOX_TOKEN = "pk.eyJ1IjoiYmFzdGllbnJ5c2VyIiwiYSI6ImNtN3JnbHQyZzBobW8ycnNlNXVuemtmYmEifQ.7qQos4iZs1ZRpe4hNBmYCw";

// Coordonnées de la Suisse pour limiter la recherche
const SWITZERLAND_BOUNDS = {
  sw: [5.9559, 45.8181], // Sud-Ouest
  ne: [10.4921, 47.8084]  // Nord-Est
};

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
  const [isSearching, setIsSearching] = useState(false);
  const [clickOnMapMode, setClickOnMapMode] = useState(false);
  
  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Nettoyer la carte précédente si elle existe
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 12,
        failIfMajorPerformanceCaveat: false
      });
      
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );
      
      // Attendre que la carte soit chargée avant d'ajouter le marqueur
      map.current.on('load', () => {
        // Ajouter un marqueur par défaut
        if (marker.current) {
          marker.current.remove();
        }
        
        marker.current = new mapboxgl.Marker({ draggable: true, color: "#3b82f6" })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);
        
        // Événement lorsqu'on finit de déplacer le marqueur
        marker.current.on('dragend', () => {
          const lngLat = marker.current?.getLngLat();
          if (lngLat) {
            onLocationChange(lngLat.lat, lngLat.lng);
            // Essayer de faire une géolocalisation inverse pour obtenir le nom du lieu
            reverseGeocode(lngLat.lat, lngLat.lng);
          }
        });
        
        setMapInitialized(true);
      });
      
      // Événement de clic sur la carte pour placer le marqueur
      map.current.on('click', (e) => {
        // Ne répondre au clic que si le mode "cliquer sur la carte" est activé
        if (!clickOnMapMode && mapInitialized) return;
        
        console.log("Clic sur la carte:", e.lngLat);
        
        if (marker.current) {
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        } else {
          // Créer un nouveau marqueur si nécessaire
          marker.current = new mapboxgl.Marker({ draggable: true, color: "#3b82f6" })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current!);
            
          // Ajouter l'événement dragend au nouveau marqueur
          marker.current.on('dragend', () => {
            const lngLat = marker.current?.getLngLat();
            if (lngLat) {
              onLocationChange(lngLat.lat, lngLat.lng);
              reverseGeocode(lngLat.lat, lngLat.lng);
            }
          });
        }
        
        // Mise à jour des coordonnées dans le formulaire
        onLocationChange(e.lngLat.lat, e.lngLat.lng);
        
        // Essayer de faire une géolocalisation inverse pour obtenir le nom du lieu
        reverseGeocode(e.lngLat.lat, e.lngLat.lng);
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la carte:", error);
      toast.error("Erreur lors du chargement de la carte. Veuillez réessayer.");
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Mise à jour du marqueur et de la carte quand les coordonnées changent
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      // Centre la carte sur les nouvelles coordonnées
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true
      });
      
      // Met à jour ou crée le marqueur
      if (marker.current) {
        marker.current.setLngLat([longitude, latitude]);
      } else {
        marker.current = new mapboxgl.Marker({ draggable: true, color: "#3b82f6" })
          .setLngLat([longitude, latitude])
          .addTo(map.current);
          
        // Ajouter l'événement dragend au nouveau marqueur
        marker.current.on('dragend', () => {
          const lngLat = marker.current?.getLngLat();
          if (lngLat) {
            onLocationChange(lngLat.lat, lngLat.lng);
            reverseGeocode(lngLat.lat, lngLat.lng);
          }
        });
      }
    }
  }, [latitude, longitude]);
  
  // Effet pour rechercher automatiquement lors de la frappe
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const timer = setTimeout(() => {
      searchLocations();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Mise à jour du curseur de la carte en mode "cliquer sur la carte"
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      if (clickOnMapMode) {
        map.current.getCanvas().style.cursor = 'crosshair';
      } else {
        map.current.getCanvas().style.cursor = '';
      }
    }
  }, [clickOnMapMode]);
  
  // Fonction pour rechercher des lieux en Suisse via l'API Mapbox
  const searchLocations = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Construire l'URL avec les paramètres pour limiter uniquement à la Suisse
      const queryParams = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        limit: '7', // Augmenter la limite pour plus de résultats
        // Limiter la recherche aux limites de la Suisse
        bbox: `${SWITZERLAND_BOUNDS.sw[0]},${SWITZERLAND_BOUNDS.sw[1]},${SWITZERLAND_BOUNDS.ne[0]},${SWITZERLAND_BOUNDS.ne[1]}`,
        // Centre de proximité au centre de la Suisse
        proximity: '8.2275,46.8182', // Longitude,Latitude du centre de la Suisse
        // Types de lieux supportés par Mapbox - Inclure tous les types pertinents
        types: 'country,region,place,district,locality,postcode,neighborhood,address,poi',
        // Ajouter un filtre de pays pour la Suisse
        country: 'ch'
      });
      
      console.log("Requête de recherche:", `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${queryParams}`);
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${queryParams}`
      );
      
      if (!response.ok) {
        console.error("Erreur de réponse:", response.status, response.statusText);
        const errorData = await response.json();
        console.error("Détail de l'erreur:", errorData);
        throw new Error(`Erreur de l'API (${response.status}): ${errorData.message || 'Erreur inconnue'}`);
      }
      
      const data = await response.json();
      console.log("Résultats de recherche:", data);
      
      // Filtrer pour ne garder que les résultats en Suisse
      if (data.features && data.features.length > 0) {
        const swissFeatures = data.features.filter((feature: any) => {
          // Vérifier si c'est en Suisse soit par le short_code soit par les coordonnées
          const isInSwitzerland = (
            // Par code pays
            feature.context?.some((c: any) => c.short_code === 'ch') ||
            // Par coordonnées (vérifier si les coordonnées sont dans les limites de la Suisse)
            (feature.center && 
             feature.center[0] >= SWITZERLAND_BOUNDS.sw[0] && feature.center[0] <= SWITZERLAND_BOUNDS.ne[0] &&
             feature.center[1] >= SWITZERLAND_BOUNDS.sw[1] && feature.center[1] <= SWITZERLAND_BOUNDS.ne[1])
          );
          return isInSwitzerland;
        });
        
        if (swissFeatures.length > 0) {
          setSearchResults(swissFeatures);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(false);
          toast.info("Aucun résultat trouvé en Suisse pour cette recherche");
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
        toast.info("Aucun résultat trouvé pour cette recherche");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error(`Erreur lors de la recherche: ${(error as Error).message}`);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Fonction pour la géolocalisation inverse
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
    console.log("Sélection du résultat:", result);
    
    if (!result.center) {
      console.error("Impossible de sélectionner le résultat: coordonnées manquantes", {
        center: result.center
      });
      return;
    }
    
    const [lng, lat] = result.center;
    console.log("Coordonnées sélectionnées:", { lat, lng });
    
    // Mise à jour des coordonnées dans le formulaire
    onLocationChange(lat, lng);
    
    // Suggérer le nom du lieu
    if (suggestSpotName) {
      const placeName = result.text || result.place_name.split(',')[0];
      suggestSpotName(placeName);
    }
    
    // Si la carte est initialisée, mettre à jour la position du marqueur
    if (map.current && map.current.loaded()) {
      // Centre la carte sur les nouvelles coordonnées
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true
      });
      
      // Met à jour ou crée le marqueur
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      } else {
        marker.current = new mapboxgl.Marker({ draggable: true, color: "#3b82f6" })
          .setLngLat([lng, lat])
          .addTo(map.current);
          
        // Ajouter l'événement dragend au nouveau marqueur
        marker.current.on('dragend', () => {
          const lngLat = marker.current?.getLngLat();
          if (lngLat) {
            onLocationChange(lngLat.lat, lngLat.lng);
            reverseGeocode(lngLat.lat, lngLat.lng);
          }
        });
      }
    }
    
    // Réinitialiser la recherche
    setShowSearchResults(false);
    setSearchQuery("");
  };
  
  // Activer/désactiver le mode "cliquer sur la carte"
  const toggleClickOnMapMode = () => {
    setClickOnMapMode(!clickOnMapMode);
    if (!clickOnMapMode) {
      toast.info("Mode 'Cliquer sur la carte' activé. Cliquez n'importe où sur la carte pour placer le marqueur.");
    }
  };
  
  // Amélioration de l'affichage du type de lieu
  const getPlaceTypeLabel = (result: any): string => {
    // Si l'attribut place_type existe
    if (result.place_type) {
      if (result.place_type.includes('poi')) {
        // Pour les POIs, essayer d'obtenir une catégorie plus précise
        const category = result.properties?.category || result.properties?.maki;
        if (category) {
          switch(category) {
            case 'mountain': return "🏔️ Montagne";
            case 'water': case 'lake': return "🌊 Lac/Rivière";
            case 'restaurant': case 'food': return "🍽️ Restaurant";
            case 'park': return "🌳 Parc";
            case 'museum': return "🏛️ Musée";
            case 'landmark': return "🏛️ Point de repère";
            case 'hotel': return "🏨 Hôtel";
            default: return `📍 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
          }
        }
        return "📍 Point d'intérêt";
      }
      
      if (result.place_type.includes('country')) return "🏳️ Pays";
      if (result.place_type.includes('region')) return "🏞️ Région";
      if (result.place_type.includes('district')) return "🏙️ District";
      if (result.place_type.includes('place')) return "🏙️ Lieu";
      if (result.place_type.includes('locality')) return "🏘️ Localité";
      if (result.place_type.includes('neighborhood')) return "🏘️ Quartier";
      if (result.place_type.includes('address')) return "🏠 Adresse";
    }
    
    return "📍 Lieu";
  };
  
  return (
    <div className="space-y-2">
      <Label>Emplacement du spot</Label>
      <div className="flex items-center space-x-2 mb-2 relative">
        <Input 
          placeholder="Rechercher un lieu en Suisse (montagne, lac, restaurant, rue...)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => searchLocations()}
          disabled={isSearching}
        >
          {isSearching ? "..." : <Search className="h-4 w-4" />}
        </Button>
        
        {showSearchResults && searchResults.length > 0 && (
          <Card className="absolute z-10 w-full top-full left-0 mt-1 p-2 bg-background shadow-lg rounded-md">
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => {
                // Déterminer le type de lieu
                const typeLabel = getPlaceTypeLabel(result);
                
                return (
                  <li 
                    key={index} 
                    className="p-2 hover:bg-muted rounded cursor-pointer border-l-4 border-blue-500 pl-3"
                    onClick={() => selectSearchResult(result)}
                  >
                    <div className="font-semibold">
                      {result.text || result.place_name.split(',')[0]}
                      <span className="ml-2 text-xs text-blue-500">🇨🇭</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{typeLabel}</span>
                      <span className="text-xs opacity-70">{result.place_name}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
      
      <div className="flex items-center mb-2">
        <Toggle 
          pressed={clickOnMapMode} 
          onPressedChange={toggleClickOnMapMode}
          className="flex items-center gap-2"
          aria-label="Cliquer sur la carte"
        >
          <MapPin className="h-4 w-4" />
          Cliquer sur la carte
        </Toggle>
        {clickOnMapMode && (
          <span className="ml-2 text-xs text-muted-foreground">
            Mode actif : cliquez n'importe où sur la carte pour placer le marqueur
          </span>
        )}
      </div>
      
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
