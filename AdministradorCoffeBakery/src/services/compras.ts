import { supabase } from "../lib/supabaseClient";
import type { ItemCompra, ListaCompra } from "../types/database";
import { ErrorUsuario, MENSAJES, aErrorUsuario } from "../utils/errores";

const SELECT_ITEM =
  "*, insumos(id,nombre,unidad_medida,stock_actual,stock_minimo), proveedores(id,nombre)";

export async function listarCompras(): Promise<ItemCompra[]> {
  const { data, error } = await supabase
    .from("lista_compras")
    .select(SELECT_ITEM)
    .eq("estado", "pendiente")
    .order("creado_en", { ascending: true });
  if (error) throw aErrorUsuario(error);
  return (data ?? []) as unknown as ItemCompra[];
}

export async function obtenerItemCompra(id: string): Promise<ItemCompra | null> {
  const { data, error } = await supabase
    .from("lista_compras")
    .select(SELECT_ITEM)
    .eq("id", id)
    .maybeSingle();
  if (error) throw aErrorUsuario(error);
  return (data ?? null) as unknown as ItemCompra | null;
}

// Alta manual. La RLS exige origen = 'manual', estado = 'pendiente' y creado_por = auth.uid()
export async function agregarCompraManual(params: {
  insumoId: string;
  cantidad: number;
  proveedorId?: string | null;
}): Promise<void> {
  const { data: sesion } = await supabase.auth.getSession();
  const userId = sesion.session?.user.id;
  if (!userId) throw new ErrorUsuario(MENSAJES.sesionTerminada);

  const { error } = await supabase.from("lista_compras").insert({
    insumo_id: params.insumoId,
    cantidad_sugerida: params.cantidad,
    proveedor_id: params.proveedorId ?? null,
    origen: "manual",
    estado: "pendiente",
    creado_por: userId,
  });
  if (error) {
    // Índice único parcial lc_un_pendiente_por_insumo (RN-06)
    if (error.code === "23505")
      throw new ErrorUsuario("Este insumo ya está en tu lista de compras. No hace falta agregarlo de nuevo.", "duplicado");
    throw aErrorUsuario(error);
  }
}

// RN-08: cierra el ítem y reintegra stock. Idempotente por client_op_id (CA-06)
export async function comprarItem(params: {
  itemId: string;
  cantidad: number;
  opId: string;
}): Promise<ListaCompra> {
  const { data, error } = await supabase.rpc("comprar_item", {
    p_item_id: params.itemId,
    p_cantidad: params.cantidad,
    p_client_op_id: params.opId,
  });
  if (error) throw aErrorUsuario(error);
  return data as ListaCompra;
}
