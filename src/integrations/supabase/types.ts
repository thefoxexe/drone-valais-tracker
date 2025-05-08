export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      default_project_tasks: {
        Row: {
          created_at: string | null
          description: string
          id: string
          order_index: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          order_index: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          order_index?: number
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["equipment_status"]
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type?: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_bookings: {
        Row: {
          created_at: string | null
          end_date: string
          equipment_id: string
          id: string
          start_date: string
          updated_at: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          equipment_id: string
          id?: string
          start_date: string
          updated_at?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          equipment_id?: string
          id?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_bookings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      filming_spots: {
        Row: {
          authorization_link: string | null
          created_at: string | null
          description: string | null
          id: string
          ideal_weather:
            | Database["public"]["Enums"]["weather_condition"][]
            | null
          latitude: number
          longitude: number
          name: string
          rating_average: number | null
          requires_authorization: boolean | null
          shooting_history: Json | null
          type: Database["public"]["Enums"]["spot_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          authorization_link?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ideal_weather?:
            | Database["public"]["Enums"]["weather_condition"][]
            | null
          latitude: number
          longitude: number
          name: string
          rating_average?: number | null
          requires_authorization?: boolean | null
          shooting_history?: Json | null
          type: Database["public"]["Enums"]["spot_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          authorization_link?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ideal_weather?:
            | Database["public"]["Enums"]["weather_condition"][]
            | null
          latitude?: number
          longitude?: number
          name?: string
          rating_average?: number | null
          requires_authorization?: boolean | null
          shooting_history?: Json | null
          type?: Database["public"]["Enums"]["spot_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      instagram_stats_history: {
        Row: {
          date: string | null
          follower_count: number
          following_count: number
          id: string
          media_count: number
          total_likes: number
        }
        Insert: {
          date?: string | null
          follower_count: number
          following_count: number
          id?: string
          media_count: number
          total_likes?: number
        }
        Update: {
          date?: string | null
          follower_count?: number
          following_count?: number
          id?: string
          media_count?: number
          total_likes?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_name: string
          created_at: string | null
          description: string | null
          id: string
          invoice_date: string | null
          invoice_number: string
          pdf_path: string | null
          rate_details: Json | null
          status: string
          updated_at: string | null
          user_id: string | null
          vat_rate: number | null
        }
        Insert: {
          amount: number
          client_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          pdf_path?: string | null
          rate_details?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          vat_rate?: number | null
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          pdf_path?: string | null
          rate_details?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          vat_rate?: number | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string
          id: string
          order_index: number
          project_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          order_index: number
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          order_index?: number
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived: boolean
          archived_at: string | null
          created_at: string | null
          id: string
          invoice_id: string
          name: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived?: boolean
          archived_at?: string | null
          created_at?: string | null
          id?: string
          invoice_id: string
          name: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived?: boolean
          archived_at?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string
          name?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: true
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          file_path: string
          id: string
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          file_path: string
          id?: string
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          file_path?: string
          id?: string
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      spot_documents: {
        Row: {
          created_at: string | null
          document_type: string
          expiration_date: string | null
          file_path: string
          id: string
          spot_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          expiration_date?: string | null
          file_path: string
          id?: string
          spot_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          expiration_date?: string | null
          file_path?: string
          id?: string
          spot_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spot_documents_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "filming_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_media: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          file_type: string
          id: string
          is_cover: boolean | null
          spot_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          file_type: string
          id?: string
          is_cover?: boolean | null
          spot_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_type?: string
          id?: string
          is_cover?: boolean | null
          spot_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spot_media_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "filming_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          spot_id: string
          updated_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          spot_id: string
          updated_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          spot_id?: string
          updated_at?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_reviews_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "filming_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_stats_history: {
        Row: {
          date: string | null
          id: string
          subscriber_count: number
          video_count: number
          view_count: number
        }
        Insert: {
          date?: string | null
          id?: string
          subscriber_count: number
          video_count: number
          view_count: number
        }
        Update: {
          date?: string | null
          id?: string
          subscriber_count?: number
          video_count?: number
          view_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_equipment_availability: {
        Args: {
          p_equipment_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: boolean
      }
    }
    Enums: {
      equipment_status: "available" | "maintenance" | "out_of_order"
      equipment_type: "drone" | "camera" | "stabilizer" | "other"
      spot_type:
        | "urbain"
        | "montagne"
        | "lac"
        | "riviere"
        | "foret"
        | "indoor"
        | "autre"
      weather_condition:
        | "ensoleille"
        | "nuageux"
        | "couvert"
        | "pluie_legere"
        | "variable"
        | "neige"
        | "vent_faible"
        | "vent_fort"
        | "brouillard"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      equipment_status: ["available", "maintenance", "out_of_order"],
      equipment_type: ["drone", "camera", "stabilizer", "other"],
      spot_type: [
        "urbain",
        "montagne",
        "lac",
        "riviere",
        "foret",
        "indoor",
        "autre",
      ],
      weather_condition: [
        "ensoleille",
        "nuageux",
        "couvert",
        "pluie_legere",
        "variable",
        "neige",
        "vent_faible",
        "vent_fort",
        "brouillard",
      ],
    },
  },
} as const
