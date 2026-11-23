// Edge Function: notifica por push (Expo) cuando se inserta un ítem AUTOMÁTICO en lista_compras.
// Se invoca desde un Database Webhook (lista_compras · INSERT) con el header x-webhook-secret.
// La dependencia se declara en deno.json (junto a este archivo) y se importa por nombre.
import { createClient } from "@supabase/supabase-js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }

  const { record } = await req.json();
  // RN-12: solo se avisa de los ítems creados por el trigger
  if (!record || record.origen !== "auto") return new Response("omitido");

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: insumo } = await sb
    .from("insumos")
    .select("nombre, stock_actual, unidad_medida, estado_stock")
    .eq("id", record.insumo_id)
    .single();
  const { data: tokens } = await sb.from("push_tokens").select("token");
  if (!insumo || !tokens?.length) return new Response("sin destinatarios");

  const agotado = insumo.estado_stock === "agotado";
  const mensajes = tokens.map(({ token }: { token: string }) => ({
    to: token,
    sound: "default",
    channelId: "stock-alerts",
    title: agotado ? `Agotado: ${insumo.nombre}` : `Stock bajo: ${insumo.nombre}`,
    body: `Quedan ${insumo.stock_actual} ${insumo.unidad_medida}. Se agregó a la lista de compras.`,
    data: { route: "/compras", itemId: record.id },
  }));

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(mensajes),
  });
  const cuerpo = await res.json().catch(() => null);

  // Limpieza: elimina los tokens que Expo reporta como DeviceNotRegistered
  const tickets: Array<{ status: string; details?: { error?: string } }> =
    cuerpo?.data ?? [];
  const invalidos = tickets
    .map((ticket, i) =>
      ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered"
        ? tokens[i].token
        : null,
    )
    .filter((token): token is string => token !== null);
  if (invalidos.length > 0) {
    await sb.from("push_tokens").delete().in("token", invalidos);
  }

  return new Response(JSON.stringify(cuerpo), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
});
