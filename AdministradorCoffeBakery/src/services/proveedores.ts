import { supabase } from "../lib/supabaseClient";
import type { Insumo, Proveedor, ProveedorCercano } from "../types/database";
import { ErrorUsuario, aErrorUsuario } from "../utils/errores";

export interface DatosProveedor {
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

export async function listarProveedores(): Promise<Proveedor[]> {
  const { data, error } = await supabase.from("proveedores").select("*").order("nombre");
  if (error) throw aErrorUsuario(error);
  return data ?? [];
}

export async function obtenerProveedor(id: string): Promise<Proveedor | null> {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw aErrorUsuario(error);
  return data ?? null;
}

// CU-04: ordenados por distancia desde la posición del usuario (Haversine en la BD)
export async function proveedoresCercanos(params: {
  lat: number;
  lng: number;
  radioKm?: number;
  insumoId?: string | null;
}): Promise<ProveedorCercano[]> {
  const { data, error } = await supabase.rpc("proveedores_cercanos", {
    p_lat: params.lat,
    p_lng: params.lng,
    p_radio_km: params.radioKm ?? 25,
    p_insumo_id: params.insumoId ?? undefined,
  });
  if (error) throw aErrorUsuario(error);
  return (data ?? []) as ProveedorCercano[];
}

export async function crearProveedor(datos: DatosProveedor): Promise<string> {
  const { data, error } = await supabase
    .from("proveedores")
    .insert(datos)
    .select("id")
    .single();
  if (error) throw aErrorUsuario(error);
  return data.id;
}

export async function actualizarProveedor(id: string, datos: DatosProveedor) {
  const { error } = await supabase.from("proveedores").update(datos).eq("id", id);
  if (error) throw aErrorUsuario(error);
}

export async function eliminarProveedor(id: string) {
  const { error } = await supabase.from("proveedores").delete().eq("id", id);
  if (error?.code === "23503")
    throw new ErrorUsuario("No se puede eliminar este proveedor porque tiene insumos o compras asociados. Quítalos primero.", "en_uso");
  if (error) throw aErrorUsuario(error);
}

// Insumos que vende un proveedor (N:M proveedor_insumos)
export async function listarInsumosDeProveedor(proveedorId: string): Promise<Insumo[]> {
  const { data, error } = await supabase
    .from("proveedor_insumos")
    .select("insumos(*)")
    .eq("proveedor_id", proveedorId);
  if (error) throw aErrorUsuario(error);
  const filas = (data ?? []) as unknown as { insumos: Insumo | null }[];
  return filas
    .map((f) => f.insumos)
    .filter((i): i is Insumo => i !== null && i.activo)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function asociarInsumo(proveedorId: string, insumoId: string) {
  const { error } = await supabase
    .from("proveedor_insumos")
    .insert({ proveedor_id: proveedorId, insumo_id: insumoId });
  if (error && error.code !== "23505") throw aErrorUsuario(error);
}

export async function desasociarInsumo(proveedorId: string, insumoId: string) {
  const { error } = await supabase
    .from("proveedor_insumos")
    .delete()
    .eq("proveedor_id", proveedorId)
    .eq("insumo_id", insumoId);
  if (error) throw aErrorUsuario(error);
}
