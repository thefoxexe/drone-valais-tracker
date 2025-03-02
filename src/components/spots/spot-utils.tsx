
import { Building, Mountain, Tree, Droplet, Home, Camera } from "lucide-react";

export const SPOT_TYPE_LABELS: Record<string, string> = {
  urbain: "Urbain",
  montagne: "Montagne",
  lac: "Lac",
  riviere: "Rivière",
  foret: "Forêt",
  indoor: "Intérieur",
  autre: "Autre"
};

export const WEATHER_CONDITION_LABELS: Record<string, string> = {
  ensoleille: "Ensoleillé",
  nuageux: "Nuageux",
  couvert: "Couvert",
  pluie_legere: "Pluie légère",
  variable: "Variable",
  neige: "Neige",
  vent_faible: "Vent faible",
  vent_fort: "Vent fort",
  brouillard: "Brouillard"
};

export const MAP_MARKER_ICONS: Record<string, JSX.Element> = {
  urbain: <Building className="h-6 w-6" />,
  montagne: <Mountain className="h-6 w-6" />,
  lac: <Droplet className="h-6 w-6" />,
  riviere: <Droplet className="h-6 w-6" />,
  foret: <Tree className="h-6 w-6" />,
  indoor: <Home className="h-6 w-6" />,
  autre: <Camera className="h-6 w-6" />
};

export const getSpotTypeIcon = (type: string): JSX.Element => {
  return MAP_MARKER_ICONS[type] || MAP_MARKER_ICONS.autre;
};

export const formatLocationCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};
