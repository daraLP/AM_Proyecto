// Evita que un botón dispare la misma acción dos veces con toques seguidos.
// Un toque se ignora si la acción anterior sigue en curso (promesa pendiente)
// o si pasó menos de `enfriamientoMs` desde el toque anterior.
export function crearBloqueo(enfriamientoMs = 600, ahora: () => number = Date.now) {
  let ocupado = false;
  let hasta = 0;
  return {
    /** Ejecuta `fn` salvo que haya un envío en curso. Devuelve true si se ejecutó. */
    ejecutar(fn: () => unknown): boolean {
      if (ocupado || ahora() < hasta) return false;
      hasta = ahora() + enfriamientoMs;
      let resultado: unknown;
      try {
        resultado = fn();
      } catch (e) {
        hasta = 0;
        throw e;
      }
      if (resultado && typeof (resultado as Promise<unknown>).then === "function") {
        ocupado = true;
        const liberar = () => {
          ocupado = false;
        };
        (resultado as Promise<unknown>).then(liberar, liberar);
      }
      return true;
    },
  };
}
