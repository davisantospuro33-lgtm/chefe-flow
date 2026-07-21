export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chefe_agenda: {
        Row: {
          created_at: string
          id: string
          name: string
          notified_leave: boolean
          perfil: string | null
          phone: string | null
          position: number
          qtd: number | null
          referencia: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notified_leave?: boolean
          perfil?: string | null
          phone?: string | null
          position?: number
          qtd?: number | null
          referencia?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notified_leave?: boolean
          perfil?: string | null
          phone?: string | null
          position?: number
          qtd?: number | null
          referencia?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      chefe_pendentes: {
        Row: {
          created_at: string
          id: string
          name: string
          perfil: string
          phone: string
          qtd: number
          referencia: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          perfil: string
          phone: string
          qtd?: number
          referencia: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          perfil?: string
          phone?: string
          qtd?: number
          referencia?: string
        }
        Relationships: []
      }
      chefe_portfolio: {
        Row: {
          created_at: string
          id: string
          media_type: string
          position: number
          storage_path: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type?: string
          position?: number
          storage_path: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          position?: number
          storage_path?: string
          url?: string
        }
        Relationships: []
      }
      chefe_profile: {
        Row: {
          ai_greeting: string
          avatar_url: string | null
          bio: string
          cuts_count: string
          endereco: string
          id: number
          latitude: number | null
          longitude: number | null
          phone_official: string | null
          rating: string
          service_duration_min: number
          service_price: string
          updated_at: string
          username: string
        }
        Insert: {
          ai_greeting?: string
          avatar_url?: string | null
          bio?: string
          cuts_count?: string
          endereco?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          phone_official?: string | null
          rating?: string
          service_duration_min?: number
          service_price?: string
          updated_at?: string
          username?: string
        }
        Update: {
          ai_greeting?: string
          avatar_url?: string | null
          bio?: string
          cuts_count?: string
          endereco?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          phone_official?: string | null
          rating?: string
          service_duration_min?: number
          service_price?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      chefe_push_subscriptions: {
        Row: {
          auth: string
          client_name: string | null
          created_at: string
          endpoint: string
          id: string
          p256dh: string
        }
        Insert: {
          auth: string
          client_name?: string | null
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
        }
        Update: {
          auth?: string
          client_name?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
        }
        Relationships: []
      }
      chefe_queue: {
        Row: {
          added_at: string
          id: string
          name: string
          perfil: string | null
          phone: string | null
          position: number
          qtd: number | null
          referencia: string | null
        }
        Insert: {
          added_at?: string
          id?: string
          name: string
          perfil?: string | null
          phone?: string | null
          position?: number
          qtd?: number | null
          referencia?: string | null
        }
        Update: {
          added_at?: string
          id?: string
          name?: string
          perfil?: string | null
          phone?: string | null
          position?: number
          qtd?: number | null
          referencia?: string | null
        }
        Relationships: []
      }
      chefe_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          name: string
          position: number
          rating: number
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          name: string
          position?: number
          rating?: number
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          rating?: number
        }
        Relationships: []
      }
      chefe_state: {
        Row: {
          current_client_id: string | null
          daily_instruction: string | null
          daily_instruction_polite: string | null
          extra_minutes: number
          id: number
          instrucoes_do_chefe: string
          presencial_count: number
          stage: number
          status: string
          updated_at: string
        }
        Insert: {
          current_client_id?: string | null
          daily_instruction?: string | null
          daily_instruction_polite?: string | null
          extra_minutes?: number
          id?: number
          instrucoes_do_chefe?: string
          presencial_count?: number
          stage?: number
          status?: string
          updated_at?: string
        }
        Update: {
          current_client_id?: string | null
          daily_instruction?: string | null
          daily_instruction_polite?: string | null
          extra_minutes?: number
          id?: number
          instrucoes_do_chefe?: string
          presencial_count?: number
          stage?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      chefe_admin_exec_sql: { Args: { query: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
