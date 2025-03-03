
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WeatherCondition } from "@/types/spots";
import { WEATHER_CONDITION_LABELS } from "./spot-utils";

interface WeatherConditionSelectorProps {
  selectedConditions: WeatherCondition[];
  onChange: (condition: WeatherCondition) => void;
}

export const WeatherConditionSelector = ({ 
  selectedConditions, 
  onChange 
}: WeatherConditionSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Conditions météo idéales</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(WEATHER_CONDITION_LABELS).map(([value, label]) => (
          <div key={value} className="flex items-center space-x-2">
            <Checkbox 
              id={`weather-${value}`} 
              checked={selectedConditions.includes(value as WeatherCondition)}
              onCheckedChange={() => onChange(value as WeatherCondition)}
            />
            <Label htmlFor={`weather-${value}`}>{label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
