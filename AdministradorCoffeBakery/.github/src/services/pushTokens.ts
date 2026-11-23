import { supabase } from "../lib/supabaseClient";

export async function guardarPushToken(params: {
  usuarioId: string;
  token: string;
  plataforma: string;
}) {
  // token es único: si el dispositivo cambia de usuario, el upsert lo reasigna
  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      {
        usuario_id: params.usuarioId,
        token: params.token,
        plataforma: params.plataforma,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: "token" },
    );
  if (error) console.warn("No se pudo guardar el token push:", error.message);
}

export async function eliminarPushToken(token: string) {
  const { error } = await supabase.from("push_tokens").delete().eq("token", token);
  if (error) console.warn("No se pudo eliminar el token push:", error.message);
}
