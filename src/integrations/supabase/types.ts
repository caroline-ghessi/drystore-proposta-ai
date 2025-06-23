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
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          approval_type: string
          approved_at: string | null
          approved_by: string | null
          comments: string | null
          created_at: string | null
          current_limit: number | null
          id: string
          proposal_id: string | null
          reason: string | null
          requested_by: string | null
          requested_value: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approval_type: string
          approved_at?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string | null
          current_limit?: number | null
          id?: string
          proposal_id?: string | null
          reason?: string | null
          requested_by?: string | null
          requested_value?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_type?: string
          approved_at?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string | null
          current_limit?: number | null
          id?: string
          proposal_id?: string | null
          reason?: string | null
          requested_by?: string | null
          requested_value?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "approval_requests_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string
          first_attempt: string | null
          id: string
          identifier: string
          last_attempt: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string
          first_attempt?: string | null
          id?: string
          identifier: string
          last_attempt?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string
          first_attempt?: string | null
          id?: string
          identifier?: string
          last_attempt?: string | null
        }
        Relationships: []
      }
      client_access_tokens: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          token: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          token: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string
          empresa: string | null
          endereco: string | null
          freshsales_id: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email: string
          empresa?: string | null
          endereco?: string | null
          freshsales_id?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          endereco?: string | null
          freshsales_id?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      discount_rules: {
        Row: {
          created_at: string | null
          id: string
          max_discount_percentage: number
          requires_approval_above: number
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_discount_percentage?: number
          requires_approval_above?: number
          updated_at?: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          max_discount_percentage?: number
          requires_approval_above?: number
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      payment_conditions: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          discount_percentage: number | null
          id: string
          installments: number
          interest_percentage: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          discount_percentage?: number | null
          id?: string
          installments?: number
          interest_percentage?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          discount_percentage?: number | null
          id?: string
          installments?: number
          interest_percentage?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_conditions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      products: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          descricao: string | null
          estoque_disponivel: number | null
          id: string
          marca: string | null
          nome: string
          preco: number
          sku: string | null
          unidade: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          estoque_disponivel?: number | null
          id?: string
          marca?: string | null
          nome: string
          preco?: number
          sku?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          estoque_disponivel?: number | null
          id?: string
          marca?: string | null
          nome?: string
          preco?: number
          sku?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposal_features: {
        Row: {
          contract_generation: boolean
          created_at: string
          delivery_control: boolean
          id: string
          proposal_id: string
          updated_at: string
        }
        Insert: {
          contract_generation?: boolean
          created_at?: string
          delivery_control?: boolean
          id?: string
          proposal_id: string
          updated_at?: string
        }
        Update: {
          contract_generation?: boolean
          created_at?: string
          delivery_control?: boolean
          id?: string
          proposal_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_features_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: true
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_items: {
        Row: {
          created_at: string
          descricao_item: string | null
          id: string
          preco_total: number
          preco_unit: number
          produto_nome: string
          proposal_id: string
          quantidade: number
        }
        Insert: {
          created_at?: string
          descricao_item?: string | null
          id?: string
          preco_total?: number
          preco_unit?: number
          produto_nome: string
          proposal_id: string
          quantidade?: number
        }
        Update: {
          created_at?: string
          descricao_item?: string | null
          id?: string
          preco_total?: number
          preco_unit?: number
          produto_nome?: string
          proposal_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_payment_conditions: {
        Row: {
          created_at: string | null
          id: string
          payment_condition_id: string | null
          proposal_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_condition_id?: string | null
          proposal_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_condition_id?: string | null
          proposal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_payment_conditions_payment_condition_id_fkey"
            columns: ["payment_condition_id"]
            isOneToOne: false
            referencedRelation: "payment_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_payment_conditions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_recommended_products: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string
          recommended_product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id: string
          recommended_product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string
          recommended_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_recommended_products_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_recommended_products_recommended_product_id_fkey"
            columns: ["recommended_product_id"]
            isOneToOne: false
            referencedRelation: "recommended_products"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_solutions: {
        Row: {
          created_at: string | null
          id: string
          observacoes: string | null
          proposal_id: string
          solution_id: string
          valor_solucao: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          observacoes?: string | null
          proposal_id: string
          solution_id: string
          valor_solucao?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          observacoes?: string | null
          proposal_id?: string
          solution_id?: string
          valor_solucao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_solutions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_solutions_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          client_id: string
          created_at: string
          desconto_percentual: number | null
          discount_percentage: number | null
          id: string
          include_technical_details: boolean | null
          include_video: boolean | null
          link_acesso: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          updated_at: string
          user_id: string | null
          validade: string
          valor_total: number
          video_url: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          desconto_percentual?: number | null
          discount_percentage?: number | null
          id?: string
          include_technical_details?: boolean | null
          include_video?: boolean | null
          link_acesso?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
          user_id?: string | null
          validade?: string
          valor_total?: number
          video_url?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          desconto_percentual?: number | null
          discount_percentage?: number | null
          id?: string
          include_technical_details?: boolean | null
          include_video?: boolean | null
          link_acesso?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
          user_id?: string | null
          validade?: string
          valor_total?: number
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_brutas: {
        Row: {
          arquivo_nome: string
          arquivo_tamanho: number
          cliente_identificado: string | null
          created_at: string
          dados_adobe_json: Json | null
          dados_estruturados: Json | null
          erro_processamento: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
          valor_total_extraido: number | null
        }
        Insert: {
          arquivo_nome: string
          arquivo_tamanho: number
          cliente_identificado?: string | null
          created_at?: string
          dados_adobe_json?: Json | null
          dados_estruturados?: Json | null
          erro_processamento?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          valor_total_extraido?: number | null
        }
        Update: {
          arquivo_nome?: string
          arquivo_tamanho?: number
          cliente_identificado?: string | null
          created_at?: string
          dados_adobe_json?: Json | null
          dados_estruturados?: Json | null
          erro_processamento?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          valor_total_extraido?: number | null
        }
        Relationships: []
      }
      recommended_products: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          nome: string
          preco: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_targets: {
        Row: {
          created_at: string
          id: string
          month: number
          target_amount: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          target_amount?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          target_amount?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          client_id: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      solution_images: {
        Row: {
          created_at: string | null
          id: string
          image_description: string | null
          image_title: string | null
          image_url: string
          solution_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_description?: string | null
          image_title?: string | null
          image_url: string
          solution_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_description?: string | null
          image_title?: string | null
          image_url?: string
          solution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_images_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_resources: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_enhanced_rate_limit: {
        Args: {
          endpoint_name: string
          user_identifier: string
          max_requests?: number
          window_minutes?: number
          block_duration_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          endpoint_name: string
          user_identifier: string
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      generate_client_access_token: {
        Args: { client_email: string; expires_in_hours?: number }
        Returns: string
      }
      get_client_proposals_by_token: {
        Args: { access_token: string }
        Returns: {
          proposal_id: string
          client_id: string
          valor_total: number
          status: Database["public"]["Enums"]["proposal_status"]
          validade: string
          created_at: string
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_client_access_attempt: {
        Args: { client_email: string; success: boolean; client_id?: string }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          event_type: string
          user_id?: string
          client_id?: string
          details?: Json
          severity?: string
        }
        Returns: undefined
      }
      test_user_role_enum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_client_access_token: {
        Args: { token: string }
        Returns: Json
      }
      validate_email_format: {
        Args: { email_input: string }
        Returns: boolean
      }
    }
    Enums: {
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired"
      user_role: "admin" | "vendedor_interno" | "representante" | "cliente"
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
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "rejected",
        "expired",
      ],
      user_role: ["admin", "vendedor_interno", "representante", "cliente"],
    },
  },
} as const
