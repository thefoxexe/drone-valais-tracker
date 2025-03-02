
export type SpotType = 'urbain' | 'montagne' | 'lac' | 'riviere' | 'foret' | 'indoor' | 'autre';

export type WeatherCondition = 
  | 'ensoleille' 
  | 'nuageux' 
  | 'couvert' 
  | 'pluie_legere' 
  | 'variable' 
  | 'neige' 
  | 'vent_faible' 
  | 'vent_fort' 
  | 'brouillard';

export interface Spot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: SpotType;
  requires_authorization: boolean;
  authorization_link?: string;
  ideal_weather?: WeatherCondition[];
  description?: string;
  shooting_history?: any; // Changé de any[] à any pour accepter le type Json de Supabase
  rating_average: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  spot_reviews?: SpotReview[];
  spot_media?: SpotMedia[];
}

export interface SpotReview {
  id: string;
  spot_id?: string;
  user_id?: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SpotMedia {
  id: string;
  spot_id?: string;
  file_path: string;
  file_type: string;
  description?: string;
  is_cover: boolean;
  created_at?: string;
  user_id?: string;
}

export interface SpotDocument {
  id: string;
  spot_id: string;
  file_path: string;
  document_type: string;
  expiration_date?: string;
  created_at?: string;
  user_id?: string;
}
