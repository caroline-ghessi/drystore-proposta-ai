export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      client_testimonials: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          client_name: string
          company: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          order_index: number | null
          product_group: string
          project_type: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          client_name: string
          company?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          order_index?: number | null
          product_group: string
          project_type?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          client_name?: string
          company?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          order_index?: number | null
          product_group?: string
          project_type?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          area_disponivel_m2: number | null
          cidade: string | null
          cnpj: string | null
          concessionaria: string | null
          consumo_historico: Json | null
          created_at: string
          email: string | null
          empresa: string | null
          endereco: string | null
          estado: string | null
          freshsales_id: string | null
          id: string
          nome: string
          origem_dados: string | null
          tarifa_kwh: number | null
          telefone: string | null
          tipo_telhado: string | null
          updated_at: string
        }
        Insert: {
          area_disponivel_m2?: number | null
          cidade?: string | null
          cnpj?: string | null
          concessionaria?: string | null
          consumo_historico?: Json | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          freshsales_id?: string | null
          id?: string
          nome: string
          origem_dados?: string | null
          tarifa_kwh?: number | null
          telefone?: string | null
          tipo_telhado?: string | null
          updated_at?: string
        }
        Update: {
          area_disponivel_m2?: number | null
          cidade?: string | null
          cnpj?: string | null
          concessionaria?: string | null
          consumo_historico?: Json | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          freshsales_id?: string | null
          id?: string
          nome?: string
          origem_dados?: string | null
          tarifa_kwh?: number | null
          telefone?: string | null
          tipo_telhado?: string | null
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
      download_files: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_size: string | null
          file_type: string
          file_url: string
          id: string
          order_index: number | null
          product_group: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: string | null
          file_type: string
          file_url: string
          id?: string
          order_index?: number | null
          product_group: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: string | null
          file_type?: string
          file_url?: string
          id?: string
          order_index?: number | null
          product_group?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      energia_bills_uploads: {
        Row: {
          client_id: string | null
          concessionaria_extraida: string | null
          consumo_extraido: Json | null
          created_at: string | null
          extracted_data: Json | null
          extraction_status: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          tarifa_extraida: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          concessionaria_extraida?: string | null
          consumo_extraido?: Json | null
          created_at?: string | null
          extracted_data?: Json | null
          extraction_status?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          tarifa_extraida?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          concessionaria_extraida?: string | null
          consumo_extraido?: Json | null
          created_at?: string | null
          extracted_data?: Json | null
          extraction_status?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          tarifa_extraida?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "energia_bills_uploads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      energia_solar_configuracoes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          custo_eletrico_wp: number | null
          custo_estrutura_wp: number | null
          custo_instalacao_wp: number | null
          custo_inversor_wp: number | null
          custo_mao_obra_wp: number | null
          fator_perdas_sistema: number | null
          fator_seguranca: number | null
          id: string
          margem_adicional_equipamentos: number | null
          margem_comercial: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          custo_eletrico_wp?: number | null
          custo_estrutura_wp?: number | null
          custo_instalacao_wp?: number | null
          custo_inversor_wp?: number | null
          custo_mao_obra_wp?: number | null
          fator_perdas_sistema?: number | null
          fator_seguranca?: number | null
          id?: string
          margem_adicional_equipamentos?: number | null
          margem_comercial?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          custo_eletrico_wp?: number | null
          custo_estrutura_wp?: number | null
          custo_instalacao_wp?: number | null
          custo_inversor_wp?: number | null
          custo_mao_obra_wp?: number | null
          fator_perdas_sistema?: number | null
          fator_seguranca?: number | null
          id?: string
          margem_adicional_equipamentos?: number | null
          margem_comercial?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gamification_achievements: {
        Row: {
          active: boolean
          badge_color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_required: number | null
          proposals_required: number | null
          sales_value_required: number | null
          special_condition: string | null
        }
        Insert: {
          active?: boolean
          badge_color?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          points_required?: number | null
          proposals_required?: number | null
          sales_value_required?: number | null
          special_condition?: string | null
        }
        Update: {
          active?: boolean
          badge_color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number | null
          proposals_required?: number | null
          sales_value_required?: number | null
          special_condition?: string | null
        }
        Relationships: []
      }
      gamification_challenges: {
        Row: {
          active: boolean
          challenge_type: string
          created_at: string
          description: string
          end_date: string
          id: string
          name: string
          reward_description: string | null
          reward_points: number
          start_date: string
          target_metric: string
          target_value: number
        }
        Insert: {
          active?: boolean
          challenge_type: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          name: string
          reward_description?: string | null
          reward_points?: number
          start_date: string
          target_metric: string
          target_value: number
        }
        Update: {
          active?: boolean
          challenge_type?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          name?: string
          reward_description?: string | null
          reward_points?: number
          start_date?: string
          target_metric?: string
          target_value?: number
        }
        Relationships: []
      }
      gamification_points: {
        Row: {
          created_at: string
          current_level: string
          id: string
          proposals_accepted: number
          proposals_created: number
          proposals_sent: number
          total_points: number
          total_sales_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: string
          id?: string
          proposals_accepted?: number
          proposals_created?: number
          proposals_sent?: number
          total_points?: number
          total_sales_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: string
          id?: string
          proposals_accepted?: number
          proposals_created?: number
          proposals_sent?: number
          total_points?: number
          total_sales_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inversores_solares: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          destaque: boolean | null
          eficiencia: number
          fabricante: string
          faixa_potencia_max_kwp: number | null
          faixa_potencia_min_kwp: number | null
          id: string
          modelo: string
          potencia_kw: number
          preco_unitario: number
          tipos_instalacao: Json | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          destaque?: boolean | null
          eficiencia?: number
          fabricante: string
          faixa_potencia_max_kwp?: number | null
          faixa_potencia_min_kwp?: number | null
          id?: string
          modelo: string
          potencia_kw: number
          preco_unitario?: number
          tipos_instalacao?: Json | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          destaque?: boolean | null
          eficiencia?: number
          fabricante?: string
          faixa_potencia_max_kwp?: number | null
          faixa_potencia_min_kwp?: number | null
          id?: string
          modelo?: string
          potencia_kw?: number
          preco_unitario?: number
          tipos_instalacao?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      irradiacao_estados: {
        Row: {
          created_at: string | null
          estado: string
          fator_correcao_regional: number | null
          id: string
          irradiacao_media_kwh_m2_dia: number
        }
        Insert: {
          created_at?: string | null
          estado: string
          fator_correcao_regional?: number | null
          id?: string
          irradiacao_media_kwh_m2_dia: number
        }
        Update: {
          created_at?: string | null
          estado?: string
          fator_correcao_regional?: number | null
          id?: string
          irradiacao_media_kwh_m2_dia?: number
        }
        Relationships: []
      }
      paineis_solares: {
        Row: {
          altura_m: number
          ativo: boolean | null
          created_at: string | null
          destaque: boolean | null
          eficiencia: number
          fabricante: string
          id: string
          largura_m: number
          modelo: string
          peso_kg: number | null
          potencia_wp: number
          preco_unitario: number
          tipos_telhado_compativeis: Json | null
          updated_at: string | null
        }
        Insert: {
          altura_m: number
          ativo?: boolean | null
          created_at?: string | null
          destaque?: boolean | null
          eficiencia: number
          fabricante: string
          id?: string
          largura_m: number
          modelo: string
          peso_kg?: number | null
          potencia_wp: number
          preco_unitario: number
          tipos_telhado_compativeis?: Json | null
          updated_at?: string | null
        }
        Update: {
          altura_m?: number
          ativo?: boolean | null
          created_at?: string | null
          destaque?: boolean | null
          eficiencia?: number
          fabricante?: string
          id?: string
          largura_m?: number
          modelo?: string
          peso_kg?: number | null
          potencia_wp?: number
          preco_unitario?: number
          tipos_telhado_compativeis?: Json | null
          updated_at?: string | null
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
      pdf_processing_logs: {
        Row: {
          created_at: string
          details: Json | null
          duration_ms: number | null
          error_message: string | null
          file_name: string
          id: string
          processing_id: string
          stage: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          file_name: string
          id?: string
          processing_id: string
          stage: string
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          file_name?: string
          id?: string
          processing_id?: string
          stage?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pdf_processing_metrics: {
        Row: {
          avg_duration_ms: number | null
          created_at: string
          date: string
          error_count: number
          id: string
          most_common_error: string | null
          stage: string
          success_count: number
          total_attempts: number
          updated_at: string
        }
        Insert: {
          avg_duration_ms?: number | null
          created_at?: string
          date: string
          error_count?: number
          id?: string
          most_common_error?: string | null
          stage: string
          success_count?: number
          total_attempts?: number
          updated_at?: string
        }
        Update: {
          avg_duration_ms?: number | null
          created_at?: string
          date?: string
          error_count?: number
          id?: string
          most_common_error?: string | null
          stage?: string
          success_count?: number
          total_attempts?: number
          updated_at?: string
        }
        Relationships: []
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
      project_gallery: {
        Row: {
          active: boolean | null
          client_name: string | null
          completion_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string
          location: string | null
          order_index: number | null
          product_group: string
          project_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url: string
          location?: string | null
          order_index?: number | null
          product_group: string
          project_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string
          location?: string | null
          order_index?: number | null
          product_group?: string
          project_type?: string | null
          title?: string
          updated_at?: string
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
          area_ocupada_m2: number | null
          client_id: string
          created_at: string
          desconto_percentual: number | null
          discount_percentage: number | null
          economia_anual_estimada: number | null
          geracao_estimada_anual_kwh: number | null
          id: string
          include_technical_details: boolean | null
          include_video: boolean | null
          link_acesso: string | null
          observacoes: string | null
          painel_selecionado_id: string | null
          payback_simples_anos: number | null
          potencia_sistema_kwp: number | null
          product_group: string | null
          proposal_number: string | null
          quantidade_paineis: number | null
          show_detailed_values: boolean | null
          status: Database["public"]["Enums"]["proposal_status"]
          tipo_sistema: string | null
          updated_at: string
          user_id: string | null
          validade: string
          valor_total: number
          video_url: string | null
        }
        Insert: {
          area_ocupada_m2?: number | null
          client_id: string
          created_at?: string
          desconto_percentual?: number | null
          discount_percentage?: number | null
          economia_anual_estimada?: number | null
          geracao_estimada_anual_kwh?: number | null
          id?: string
          include_technical_details?: boolean | null
          include_video?: boolean | null
          link_acesso?: string | null
          observacoes?: string | null
          painel_selecionado_id?: string | null
          payback_simples_anos?: number | null
          potencia_sistema_kwp?: number | null
          product_group?: string | null
          proposal_number?: string | null
          quantidade_paineis?: number | null
          show_detailed_values?: boolean | null
          status?: Database["public"]["Enums"]["proposal_status"]
          tipo_sistema?: string | null
          updated_at?: string
          user_id?: string | null
          validade?: string
          valor_total?: number
          video_url?: string | null
        }
        Update: {
          area_ocupada_m2?: number | null
          client_id?: string
          created_at?: string
          desconto_percentual?: number | null
          discount_percentage?: number | null
          economia_anual_estimada?: number | null
          geracao_estimada_anual_kwh?: number | null
          id?: string
          include_technical_details?: boolean | null
          include_video?: boolean | null
          link_acesso?: string | null
          observacoes?: string | null
          painel_selecionado_id?: string | null
          payback_simples_anos?: number | null
          potencia_sistema_kwp?: number | null
          product_group?: string | null
          proposal_number?: string | null
          quantidade_paineis?: number | null
          show_detailed_values?: boolean | null
          status?: Database["public"]["Enums"]["proposal_status"]
          tipo_sistema?: string | null
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
          {
            foreignKeyName: "proposals_painel_selecionado_id_fkey"
            columns: ["painel_selecionado_id"]
            isOneToOne: false
            referencedRelation: "paineis_solares"
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
      technical_images: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string
          order_index: number | null
          product_group: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          product_group: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          product_group?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "gamification_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "gamification_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      whapi_instances: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          instance_id: string
          is_active: boolean
          last_heartbeat: string | null
          phone_number: string | null
          token: string
          updated_at: string
          vendor_id: string
          vendor_name: string
          webhook_secret: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          instance_id: string
          is_active?: boolean
          last_heartbeat?: string | null
          phone_number?: string | null
          token: string
          updated_at?: string
          vendor_id: string
          vendor_name: string
          webhook_secret?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          instance_id?: string
          is_active?: boolean
          last_heartbeat?: string | null
          phone_number?: string | null
          token?: string
          updated_at?: string
          vendor_id?: string
          vendor_name?: string
          webhook_secret?: string
          webhook_url?: string
        }
        Relationships: []
      }
      whapi_webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          processed_successfully: boolean
          raw_payload: Json
          webhook_event_type: string
          whapi_instance_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_successfully?: boolean
          raw_payload: Json
          webhook_event_type: string
          whapi_instance_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_successfully?: boolean
          raw_payload?: Json
          webhook_event_type?: string
          whapi_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whapi_webhook_logs_whapi_instance_id_fkey"
            columns: ["whapi_instance_id"]
            isOneToOne: false
            referencedRelation: "whapi_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          client_id: string
          client_phone: string
          created_by: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string
          proposal_id: string | null
          sent_at: string
          status: string
          vendor_phone: string
          whapi_instance_id: string
          whapi_message_id: string | null
        }
        Insert: {
          client_id: string
          client_phone: string
          created_by?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content: string
          proposal_id?: string | null
          sent_at?: string
          status?: string
          vendor_phone: string
          whapi_instance_id: string
          whapi_message_id?: string | null
        }
        Update: {
          client_id?: string
          client_phone?: string
          created_by?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string
          proposal_id?: string | null
          sent_at?: string
          status?: string
          vendor_phone?: string
          whapi_instance_id?: string
          whapi_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_whapi_instance_id_fkey"
            columns: ["whapi_instance_id"]
            isOneToOne: false
            referencedRelation: "whapi_instances"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_financeiro_solar: {
        Args: {
          p_custo_equipamentos: number
          p_potencia_kwp: number
          p_geracao_anual_kwh: number
          p_consumo_anual_kwh: number
          p_tarifa_kwh: number
        }
        Returns: Json
      }
      calculate_gamification_points: {
        Args: { target_user_id: string }
        Returns: undefined
      }
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
      dimensionar_sistema_solar: {
        Args: { p_consumo_medio_kwh: number; p_estado: string }
        Returns: Json
      }
      generate_client_access_token: {
        Args: { client_email: string; expires_in_hours?: number }
        Returns: string
      }
      generate_whapi_webhook_url: {
        Args: { instance_id: string }
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
      get_seller_ranking: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          total_points: number
          current_level: string
          proposals_created: number
          proposals_sent: number
          proposals_accepted: number
          total_sales_value: number
          rank_position: number
        }[]
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
      selecionar_paineis_solares: {
        Args: { p_potencia_kwp: number; p_tipo_telhado?: string }
        Returns: Json
      }
      send_welcome_email: {
        Args: { user_email: string; user_name: string; user_role: string }
        Returns: boolean
      }
      test_user_role_enum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_client_access_token: {
        Args: { token: string }
        Returns: Json
      }
      validate_client_email_for_proposal: {
        Args: { client_id: string }
        Returns: boolean
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
