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
        }
        Insert: {
          created_at?: string | null
          end_date: string
          equipment_id: string
          id?: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          equipment_id?: string
          id?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
