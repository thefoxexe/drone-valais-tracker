import { useState } from "react";
import { useForm } from "react-hook-form";
import { Spot, SpotType, WeatherCondition } from "@/types/spots";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSpotForm = (spot: Spot | null, onClose: () => void) => {
  const isEditing = !!spot;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedWeatherConditions, setSelectedWeatherConditions] = useState<WeatherCondition[]>(
    spot?.ideal_weather as WeatherCondition[] || []
  );
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm<Spot>({
    defaultValues: {
      name: spot?.name || "",
      latitude: spot?.latitude || 46.2044,
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
    console.log("Mise à jour des coordonnées:", { lat, lng });
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
  
  const handleDeleteSpot = async () => {
    if (!spot || !spot.id) return;
    
    setIsDeleting(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError || !authData.session) {
        toast.error("Vous devez être connecté pour supprimer un spot");
        throw new Error("Vous devez être connecté pour supprimer un spot");
      }
      
      const { error } = await supabase
        .from("filming_spots")
        .delete()
        .eq("id", spot.id);
      
      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }
      
      toast.success("Spot supprimé avec succès");
      onClose();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error((error as any)?.message || "Erreur lors de la suppression du spot");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const onSubmit = async (formData: Spot) => {
    console.log("Données du formulaire avant soumission:", formData);
    setIsSubmitting(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError || !authData.session) {
        toast.error("Vous devez être connecté pour ajouter un spot");
        throw new Error("Vous devez être connecté pour ajouter un spot");
      }
      
      const spotData = {
        ...formData,
        ideal_weather: selectedWeatherConditions,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        type: formData.type,
        user_id: authData.session.user.id
      };

      console.log("Données préparées pour Supabase:", spotData);
      
      let result;
      
      if (isEditing && spot) {
        console.log("Mise à jour du spot existant:", spot.id, "avec le type:", spotData.type);
        result = await supabase
          .from("filming_spots")
          .update(spotData)
          .eq("id", spot.id)
          .select();
      } else {
        result = await supabase
          .from("filming_spots")
          .insert([spotData])
          .select();
      }
      
      if (result.error) {
        console.error("Erreur Supabase:", result.error);
        throw result.error;
      }
      
      toast.success(isEditing ? "Spot mis à jour avec succès" : "Spot créé avec succès");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error((error as any)?.message || "Erreur lors de l'enregistrement du spot");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditing,
    isSubmitting,
    isDeleting,
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
    handleDeleteSpot,
    suggestSpotName,
    onSubmit
  };
};
