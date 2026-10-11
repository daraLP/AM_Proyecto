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

import type { Database } from "./database.types";

type Tablas = Database["public"]["Tables"];

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

export type Perfil = Omit<Tablas["perfiles"]["Row"], "rol"> & { rol: Rol };

export type Insumo = Omit<
  Tablas["insumos"]["Row"],
  "unidad_medida" | "estado_stock"
> & {
  unidad_medida: UnidadMedida;
  estado_stock: EstadoStock;
};

export type MovimientoInventario = Omit<
  Tablas["movimientos_inventario"]["Row"],
  "tipo" | "motivo"
> & {
  tipo: "entrada" | "salida";
  motivo: Motivo;
};

export type ListaCompra = Omit<
  Tablas["lista_compras"]["Row"],
  "estado" | "origen"
> & {
  estado: "pendiente" | "comprado";
  origen: "auto" | "manual";
};
