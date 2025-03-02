
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SpotMap } from "@/components/spots/SpotMap";
import { SpotList } from "@/components/spots/SpotList";
import { SpotFilters } from "@/components/spots/SpotFilters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { SpotFormDialog } from "@/components/spots/SpotFormDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Spot, SpotType } from "@/types/spots";

const FilmingSpots = () => {
  const [showSpotForm, setShowSpotForm] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [filters, setFilters] = useState({
    type: "" as SpotType | "",
    requiresAuth: false,
    weatherConditions: [] as string[],
  });

  const { data: spots, isLoading, refetch } = useQuery({
    queryKey: ["filming-spots"],
    queryFn: async () => {
      let query = supabase.from("filming_spots").select(`
        *,
        spot_reviews(id, rating),
        spot_media(id, file_path, file_type, is_cover)
      `);

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.requiresAuth) {
        query = query.eq("requires_authorization", true);
      }

      if (filters.weatherConditions.length > 0) {
        query = query.contains("ideal_weather", filters.weatherConditions);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching spots:", error);
        throw error;
      }
      
      return data as unknown as Spot[];
    },
  });

  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  const handleSpotClick = (spot: Spot) => {
    setSelectedSpot(spot);
  };

  const handleAddSpot = () => {
    setSelectedSpot(null);
    setShowSpotForm(true);
  };

  const handleEditSpot = (spot: Spot) => {
    setSelectedSpot(spot);
    setShowSpotForm(true);
  };

  const handleSpotFormClose = () => {
    setShowSpotForm(false);
    setSelectedSpot(null);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Spots de Tournage</h1>
          <Button onClick={handleAddSpot} className="flex items-center gap-2">
            <PlusCircle size={18} />
            Ajouter un spot
          </Button>
        </div>

        <SpotFilters filters={filters} setFilters={setFilters} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2">
            <SpotMap 
              spots={spots || []} 
              isLoading={isLoading} 
              onSpotClick={handleSpotClick}
              selectedSpotId={selectedSpot?.id}
            />
          </div>
          <div>
            <SpotList 
              spots={spots || []} 
              isLoading={isLoading} 
              onSpotClick={handleSpotClick}
              onEditSpot={handleEditSpot}
              selectedSpotId={selectedSpot?.id}
            />
          </div>
        </div>
      </div>

      {showSpotForm && (
        <SpotFormDialog
          spot={selectedSpot}
          onClose={handleSpotFormClose}
        />
      )}
    </div>
  );
};

export default FilmingSpots;
