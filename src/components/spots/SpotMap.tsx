
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Spot } from "@/types/spots";
import { MAP_MARKER_ICONS } from "./spot-utils";

// Utilisation de la clé API Mapbox fournie
const MAPBOX_TOKEN = "pk.eyJ1IjoiYmFzdGllbnJ5c2VyIiwiYSI6ImNtN3JnbHQyZzBobW8ycnNlNXVuemtmYmEifQ.7qQos4iZs1ZRpe4hNBmYCw";

interface SpotMapProps {
  spots: Spot[];
  isLoading: boolean;
  onSpotClick: (spot: Spot) => void;
  selectedSpotId?: string;
}

export const SpotMap = ({ spots, isLoading, onSpotClick, selectedSpotId }: SpotMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState<string>(MAPBOX_TOKEN);

  // État pour stocker la clé API Mapbox temporairement
  const [tempToken, setTempToken] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current || isLoading || !mapboxToken || showTokenInput) return;

    if (!map.current) {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [7.3601, 46.2044], // Coordonnées du Valais par défaut
        zoom: 8,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      map.current.addControl(new mapboxgl.FullscreenControl());
    }

    // Nettoyer les marqueurs existants
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Ajouter les nouveaux marqueurs pour chaque spot
    spots.forEach((spot) => {
      // Créer un élément personnalisé pour le marqueur
      const el = document.createElement("div");
      el.className = "spot-marker";
      
      // Utiliser un point rouge pour le marqueur
      el.innerHTML = `<div class="${selectedSpotId === spot.id ? 'animate-pulse' : ''} 
        w-3 h-3 rounded-full bg-red-600 border border-white shadow-lg 
        cursor-pointer hover:w-4 hover:h-4 transition-all"></div>`;
      
      el.addEventListener("click", () => {
        onSpotClick(spot);
      });

      // Créer et ajouter le marqueur à la carte
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([spot.longitude, spot.latitude])
        .addTo(map.current!);
      
      markersRef.current[spot.id] = marker;
    });

    // Centrer la carte sur le spot sélectionné
    if (selectedSpotId && markersRef.current[selectedSpotId]) {
      const spot = spots.find(s => s.id === selectedSpotId);
      if (spot) {
        map.current.flyTo({
          center: [spot.longitude, spot.latitude],
          zoom: 12,
          essential: true
        });
      }
    }

    return () => {
      // Cleanup function
    };
  }, [spots, isLoading, selectedSpotId, mapboxToken, showTokenInput, onSpotClick]);

  const handleSubmitToken = () => {
    setMapboxToken(tempToken);
    setShowTokenInput(false);
    // Sauvegarder le token dans localStorage pour persistance
    localStorage.setItem("mapbox_token", tempToken);
  };

  // Charger le token depuis localStorage si disponible
  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken) {
      setMapboxToken(savedToken);
      setShowTokenInput(false);
    }
  }, []);

  return (
    <Card className="relative w-full h-[600px] overflow-hidden">
      {showTokenInput ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 bg-card">
          <h3 className="text-lg font-medium mb-4">Clé API Mapbox requise</h3>
          <p className="mb-4 text-sm text-muted-foreground text-center max-w-md">
            Pour afficher la carte, vous devez fournir une clé API Mapbox. 
            Vous pouvez en obtenir une gratuitement sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>.
          </p>
          <div className="flex w-full max-w-md mb-4">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Entrez votre clé API Mapbox"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
            />
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md"
              onClick={handleSubmitToken}
            >
              Valider
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p>Chargement de la carte...</p>
        </div>
      ) : null}
      <div ref={mapContainer} className="absolute inset-0" />
    </Card>
  );
};
