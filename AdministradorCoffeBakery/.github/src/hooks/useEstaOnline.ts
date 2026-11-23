import { useEffect, useState } from "react";
import "../lib/netinfo";
import NetInfo from "@react-native-community/netinfo";

function estadoIndicaConexion(
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
): boolean {
  return isConnected !== false && isInternetReachable !== false;
}

export function useEstaOnline(): boolean {
  const [estaOnline, setEstaOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setEstaOnline(
        estadoIndicaConexion(state.isConnected, state.isInternetReachable),
      );
    });
  }, []);

  return estaOnline;
}
