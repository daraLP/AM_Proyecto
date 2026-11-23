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
      categorias: {
        Row: {
          id: string
          nombre: string
        }
        Insert: {
          id?: string
          nombre: string
        }
        Update: {
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      insumos: {
        Row: {
          activo: boolean
          actualizado_en: string | null
          categoria_id: string | null
          creado_en: string | null
          estado_stock: string | null
          foto_url: string | null
          id: string
          nombre: string
          proveedor_principal_id: string | null
          stock_actual: number
          stock_minimo: number
          unidad_medida: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string | null
          categoria_id?: string | null
          creado_en?: string | null
          estado_stock?: string | null
          foto_url?: string | null
          id?: string
          nombre: string
          proveedor_principal_id?: string | null
          stock_actual?: number
          stock_minimo?: number
          unidad_medida: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string | null
          categoria_id?: string | null
          creado_en?: string | null
          estado_stock?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          proveedor_principal_id?: string | null
          stock_actual?: number
          stock_minimo?: number
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "insumos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumos_proveedor_principal_id_fkey"
            columns: ["proveedor_principal_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_compras: {
        Row: {
          cantidad_comprada: number | null
          cantidad_sugerida: number
          comprado_en: string | null
          comprado_por: string | null
          creado_en: string | null
          creado_por: string | null
          estado: string
          id: string
          insumo_id: string
          origen: string
          proveedor_id: string | null
        }
        Insert: {
          cantidad_comprada?: number | null
          cantidad_sugerida?: number
          comprado_en?: string | null
          comprado_por?: string | null
          creado_en?: string | null
          creado_por?: string | null
          estado?: string
          id?: string
          insumo_id: string
          origen?: string
          proveedor_id?: string | null
        }
        Update: {
          cantidad_comprada?: number | null
          cantidad_sugerida?: number
          comprado_en?: string | null
          comprado_por?: string | null
          creado_en?: string | null
          creado_por?: string | null
          estado?: string
          id?: string
          insumo_id?: string
          origen?: string
          proveedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_comprado_por_fkey"
            columns: ["comprado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_inventario: {
        Row: {
          cantidad: number
          client_op_id: string | null
          creado_en: string | null
          id: string
          insumo_id: string
          motivo: string
          nota: string | null
          saldo_resultante: number
          tipo: string
          usuario_id: string
        }
        Insert: {
          cantidad: number
          client_op_id?: string | null
          creado_en?: string | null
          id?: string
          insumo_id: string
          motivo: string
          nota?: string | null
          saldo_resultante: number
          tipo: string
          usuario_id: string
        }
        Update: {
          cantidad?: number
          client_op_id?: string | null
          creado_en?: string | null
          id?: string
          insumo_id?: string
          motivo?: string
          nota?: string | null
          saldo_resultante?: number
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          creado_en: string | null
          id: string
          nombre: string
          rol: string
        }
        Insert: {
          creado_en?: string | null
          id: string
          nombre: string
          rol?: string
        }
        Update: {
          creado_en?: string | null
          id?: string
          nombre?: string
          rol?: string
        }
        Relationships: []
      }
      proveedor_insumos: {
        Row: {
          insumo_id: string
          proveedor_id: string
        }
        Insert: {
          insumo_id: string
          proveedor_id: string
        }
        Update: {
          insumo_id?: string
          proveedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proveedor_insumos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proveedor_insumos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          creado_en: string | null
          direccion: string | null
          id: string
          latitud: number | null
          longitud: number | null
          nombre: string
          telefono: string | null
        }
        Insert: {
          creado_en?: string | null
          direccion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre: string
          telefono?: string | null
        }
        Update: {
          creado_en?: string | null
          direccion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          actualizado_en: string
          id: string
          plataforma: string
          token: string
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string
          id?: string
          plataforma: string
          token: string
          usuario_id: string
        }
        Update: {
          actualizado_en?: string
          id?: string
          plataforma?: string
          token?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      comprar_item: {
        Args: {
          p_cantidad?: number
          p_client_op_id?: string
          p_item_id: string
        }
        Returns: {
          cantidad_comprada: number | null
          cantidad_sugerida: number
          comprado_en: string | null
          comprado_por: string | null
          creado_en: string | null
          creado_por: string | null
          estado: string
          id: string
          insumo_id: string
          origen: string
          proveedor_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "lista_compras"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      consumo_por_insumo: {
        Args: { p_desde: string; p_hasta: string }
        Returns: {
          consumido: number
          insumo_id: string
          merma: number
          nombre: string
          unidad_medida: string
        }[]
      }
      consumo_semanal: {
        Args: { p_dias?: number; p_tz?: string }
        Returns: {
          dia: string
          salidas: number
        }[]
      }
      es_admin: { Args: never; Returns: boolean }
      proveedores_cercanos: {
        Args: {
          p_insumo_id?: string
          p_lat: number
          p_lng: number
          p_radio_km?: number
        }
        Returns: {
          direccion: string
          distancia_m: number
          id: string
          latitud: number
          longitud: number
          nombre: string
          telefono: string
        }[]
      }
      registrar_movimiento: {
        Args: {
          p_client_op_id?: string
          p_delta: number
          p_insumo_id: string
          p_motivo: string
          p_nota?: string
        }
        Returns: {
          cantidad: number
          client_op_id: string | null
          creado_en: string | null
          id: string
          insumo_id: string
          motivo: string
          nota: string | null
          saldo_resultante: number
          tipo: string
          usuario_id: string
        }
        SetofOptions: {
          from: "*"
          to: "movimientos_inventario"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      resumen_dashboard: {
        Args: never
        Returns: {
          agotado: number
          bajo: number
          total: number
        }[]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
