
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SPOT_TYPE_LABELS, WEATHER_CONDITION_LABELS } from "./spot-utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FiltersState {
  type: string;
  requiresAuth: boolean;
  weatherConditions: string[];
}

interface SpotFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

export const SpotFilters = ({ filters, setFilters }: SpotFiltersProps) => {
  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value }));
  };

  const handleRequiresAuthChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, requiresAuth: checked }));
  };

  const handleWeatherConditionAdd = (condition: string) => {
    if (!filters.weatherConditions.includes(condition)) {
      setFilters(prev => ({
        ...prev,
        weatherConditions: [...prev.weatherConditions, condition]
      }));
    }
  };

  const handleWeatherConditionRemove = (condition: string) => {
    setFilters(prev => ({
      ...prev,
      weatherConditions: prev.weatherConditions.filter(c => c !== condition)
    }));
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="spot-type">Type de lieu</Label>
            <Select value={filters.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="spot-type">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {Object.entries(SPOT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weather-condition">Conditions météo idéales</Label>
            <Select onValueChange={handleWeatherConditionAdd}>
              <SelectTrigger id="weather-condition">
                <SelectValue placeholder="Choisir une condition" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WEATHER_CONDITION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.weatherConditions.map(condition => (
                <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                  {WEATHER_CONDITION_LABELS[condition]}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleWeatherConditionRemove(condition)} 
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 h-10 mt-8">
            <Switch 
              id="requires-auth" 
              checked={filters.requiresAuth}
              onCheckedChange={handleRequiresAuthChange}
            />
            <Label htmlFor="requires-auth">Nécessite une autorisation</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
