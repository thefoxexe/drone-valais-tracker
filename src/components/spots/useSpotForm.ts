
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Spot, SpotType, WeatherCondition } from "@/types/spots";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSpotForm = (spot: Spot | null, onClose: () => void) => {
  const isEditing = !!spot;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeatherConditions, setSelectedWeatherConditions] = useState<WeatherCondition[]>(
    spot?.ideal_weather as WeatherCondition[] || []
  );
  
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
  
  const handleWeatherConditionChange = (condition: WeatherCondition) => {
    setSelectedWeatherConditions(prev => {
      if (prev.includes(condition)) {
        return prev.filter(c => c !== condition);
      } else {
        return [...prev, condition];
      }
    });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const handleAuthRequiredChange = (value: boolean) => {
    setValue("requires_authorization", value);
  };

  const handleAuthLinkChange = (value: string) => {
    setValue("authorization_link", value);
  };

  const suggestSpotName = (placeName: string | null) => {
    if (placeName && !getValues("name")) {
      setValue("name", placeName);
    }
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

  return {
    isEditing,
    isSubmitting,
    selectedWeatherConditions,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    getValues,
    requiresAuth,
    latitude,
    longitude,
    handleWeatherConditionChange,
    handleLocationChange,
    handleAuthRequiredChange,
    handleAuthLinkChange,
    suggestSpotName,
    onSubmit
  };
};
