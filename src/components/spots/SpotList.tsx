
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spot } from "@/types/spots";
import { getSpotTypeIcon, SPOT_TYPE_LABELS } from "./spot-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface SpotListProps {
  spots: Spot[];
  isLoading: boolean;
  onSpotClick: (spot: Spot) => void;
  onEditSpot: (spot: Spot) => void;
  selectedSpotId?: string;
}

export const SpotList = ({ 
  spots, 
  isLoading, 
  onSpotClick, 
  onEditSpot, 
  selectedSpotId 
}: SpotListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des spots</CardTitle>
          <CardDescription>Chargement en cours...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Liste des spots</CardTitle>
        <CardDescription>{spots.length} spots disponibles</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3 p-4 pt-0">
            {spots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <p>Aucun spot de tournage disponible</p>
                <p className="text-sm">Ajoutez votre premier spot en cliquant sur "Ajouter un spot"</p>
              </div>
            ) : (
              spots.map((spot) => (
                <Card 
                  key={spot.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedSpotId === spot.id ? 'border-primary ring-1 ring-primary' : ''
                  }`}
                  onClick={() => onSpotClick(spot)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 flex items-center justify-center text-primary">
                          {getSpotTypeIcon(spot.type)}
                        </div>
                        <div>
                          <h3 className="font-medium leading-none mb-1">{spot.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {SPOT_TYPE_LABELS[spot.type] || spot.type}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSpot(spot);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      {spot.requires_authorization && (
                        <Badge variant="outline" className="text-xs">Autorisation</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
