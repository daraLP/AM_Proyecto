import { useEffect, useState } from "react";

export function useDebounce<T>(valor: T, retrasoMs = 300): T {
  const [debounced, setDebounced] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), retrasoMs);
    return () => clearTimeout(id);
  }, [valor, retrasoMs]);
  return debounced;
}
