import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "../lib/supabaseClient";
import { aErrorUsuario } from "../utils/errores";

const BUCKET = "fotos-insumos";
const ANCHO_MAXIMO = 1024; // el bucket limita a 2 MB

// Reduce y comprime la imagen, la sube al bucket y devuelve su URL pública
export async function subirFotoInsumo(uriLocal: string, insumoId: string): Promise<string> {
  const imagen = await ImageManipulator.manipulateAsync(
    uriLocal,
    [{ resize: { width: ANCHO_MAXIMO } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );

  const respuesta = await fetch(imagen.uri);
  const bytes = await respuesta.arrayBuffer();
  const ruta = `${insumoId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, bytes, { contentType: "image/jpeg", upsert: false });
  if (error) throw aErrorUsuario(error, "No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo.");

  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}
