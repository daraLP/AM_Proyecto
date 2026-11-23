import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProveedor,
  asociarInsumo,
  crearProveedor,
  desasociarInsumo,
  eliminarProveedor,
  listarInsumosDeProveedor,
  listarProveedores,
  obtenerProveedor,
  type DatosProveedor,
} from "../services/proveedores";
import {
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  renombrarCategoria,
} from "../services/categorias";
import { actualizarNombre, cambiarRol, listarPerfiles } from "../services/perfiles";
import type { Rol } from "../types/database";
import { ErrorUsuario } from "../utils/errores";

export function useCategorias() {
  return useQuery({ queryKey: ["categorias"], queryFn: listarCategorias, staleTime: 5 * 60_000 });
}

export function useProveedores() {
  return useQuery({ queryKey: ["proveedores"], queryFn: listarProveedores, staleTime: 5 * 60_000 });
}

export function useProveedor(id: string | undefined) {
  return useQuery({
    queryKey: ["proveedor", id],
    enabled: Boolean(id),
    queryFn: () => obtenerProveedor(id as string),
  });
}

export function useInsumosDeProveedor(id: string | undefined) {
  return useQuery({
    queryKey: ["proveedor", id, "insumos"],
    enabled: Boolean(id),
    queryFn: () => listarInsumosDeProveedor(id as string),
  });
}

export function usePerfiles() {
  return useQuery({ queryKey: ["perfiles"], queryFn: listarPerfiles });
}

// Resultado { error } de los servicios de categorías → excepción para useMutation
async function resolver(promesa: Promise<{ error: string | null }>) {
  const { error } = await promesa;
  if (error) throw new ErrorUsuario(error);
}

export function useGestionCategorias() {
  const queryClient = useQueryClient();
  const refrescar = () => void queryClient.invalidateQueries({ queryKey: ["categorias"] });
  return {
    crear: useMutation({ mutationFn: (n: string) => resolver(crearCategoria(n)), onSuccess: refrescar }),
    renombrar: useMutation({
      mutationFn: (p: { id: string; nombre: string }) => resolver(renombrarCategoria(p.id, p.nombre)),
      onSuccess: refrescar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => resolver(eliminarCategoria(id)), onSuccess: refrescar }),
  };
}

export function useGestionProveedores() {
  const queryClient = useQueryClient();
  const refrescar = () => {
    void queryClient.invalidateQueries({ queryKey: ["proveedores"] });
    void queryClient.invalidateQueries({ queryKey: ["proveedor"] });
    void queryClient.invalidateQueries({ queryKey: ["proveedores-cercanos"] });
  };
  return {
    crear: useMutation({ mutationFn: (d: DatosProveedor) => crearProveedor(d), onSuccess: refrescar }),
    actualizar: useMutation({
      mutationFn: (p: { id: string; datos: DatosProveedor }) => actualizarProveedor(p.id, p.datos),
      onSuccess: refrescar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarProveedor(id), onSuccess: refrescar }),
    asociar: useMutation({
      mutationFn: (p: { proveedorId: string; insumoId: string }) => asociarInsumo(p.proveedorId, p.insumoId),
      onSuccess: refrescar,
    }),
    desasociar: useMutation({
      mutationFn: (p: { proveedorId: string; insumoId: string }) => desasociarInsumo(p.proveedorId, p.insumoId),
      onSuccess: refrescar,
    }),
  };
}

export function useGestionUsuarios() {
  const queryClient = useQueryClient();
  const refrescar = () => void queryClient.invalidateQueries({ queryKey: ["perfiles"] });
  return {
    cambiarRol: useMutation({
      mutationFn: (p: { userId: string; rol: Rol }) => cambiarRol(p.userId, p.rol),
      onSuccess: refrescar,
    }),
    actualizarNombre: useMutation({
      mutationFn: (p: { userId: string; nombre: string }) => actualizarNombre(p.userId, p.nombre),
      onSuccess: refrescar,
    }),
  };
}
