// export type UnidadMedida = "kg" | "litros" | "unidades" | "cajas";
// export type Rol = "administrador" | "barista";

// export interface Perfil {
//   id: string;
//   nombre: string;
//   rol: Rol;
// }

// export interface Insumo {
//   id: string;
//   nombre: string;
//   categoria_id: string | null;
//   unidad_medida: UnidadMedida;
//   stock_actual: number;
//   stock_minimo: number;
//   proveedor_principal_id: string | null;
//   foto_url: string | null;
//   creado_en: string;
//   actualizado_en: string;
// }

export type UnidadMedida = "kg" | "litros" | "unidades" | "cajas";
export type Rol = "administrador" | "barista";
export type EstadoStock = "ok" | "bajo" | "agotado";

// Textos EXACTOS que acepta el CHECK de movimientos_inventario.motivo
export const MOTIVOS = [
  "Compra recibida",
  "Uso en preparación",
  "Merma/Vencido",
  "Ajuste de inventario",
  "Otro",
] as const;
export type Motivo = (typeof MOTIVOS)[number];

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
  activo: boolean; // nuevo (0002)
  estado_stock: EstadoStock; // nuevo (0002): columna generada
  creado_en: string;
  actualizado_en: string;
}

export interface MovimientoInventario {
  id: string;
  insumo_id: string;
  usuario_id: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  motivo: Motivo;
  nota: string | null;
  saldo_resultante: number;
  creado_en: string;
}

export interface ListaCompra {
  id: string;
  insumo_id: string;
  proveedor_id: string | null;
  cantidad_sugerida: number;
  estado: "pendiente" | "comprado";
  origen: "auto" | "manual";
  creado_en: string;
}
