export type UnidadMedida = "kg" | "litros" | "unidades" | "cajas";
export type Rol = "administrador" | "barista";

export interface Perfil {
  id: string;
  nombre: string;
  rol: Rol;
}

export interface Insumo {
  id: string;
  nombre: string;
  categoria_id: string | null;
  unidad_medida: UnidadMedida;
  stock_actual: number;
  stock_minimo: number;
  proveedor_principal_id: string | null;
  foto_url: string | null;
  creado_en: string;
  actualizado_en: string;
}
