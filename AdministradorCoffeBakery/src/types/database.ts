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

export type Categoria = Tablas["categorias"]["Row"];
export type Proveedor = Tablas["proveedores"]["Row"];
export type PushToken = Tablas["push_tokens"]["Row"];

// Ítem de la lista de compras con el insumo y el proveedor ya resueltos (join)
export type ItemCompra = ListaCompra & {
  insumos: Pick<Insumo, "id" | "nombre" | "unidad_medida" | "stock_actual" | "stock_minimo"> | null;
  proveedores: Pick<Proveedor, "id" | "nombre"> | null;
};

// Movimiento con el nombre de quien lo registró
export type MovimientoConUsuario = MovimientoInventario & {
  perfiles: { nombre: string } | null;
};

export type ProveedorCercano = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  latitud: number;
  longitud: number;
  distancia_m: number | null;
};

export const UNIDADES_MEDIDA: readonly { label: string; value: UnidadMedida }[] = [
  { label: "Kg", value: "kg" },
  { label: "Litros", value: "litros" },
  { label: "Unidades", value: "unidades" },
  { label: "Cajas", value: "cajas" },
];

// Movimiento con quién lo hizo y sobre qué insumo (pantalla «Actividad del equipo»)
export type MovimientoActividad = MovimientoInventario & {
  perfiles: { nombre: string } | null;
  insumos: { nombre: string; unidad_medida: string } | null;
};
