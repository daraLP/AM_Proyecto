import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";

export interface StockBadgeProps {
  estado: "ok" | "bajo" | "agotado";
}

const etiquetas: Record<StockBadgeProps["estado"], string> = {
  ok: "OK",
  bajo: "STOCK BAJO",
  agotado: "AGOTADO",
};

export function StockBadge({ estado }: StockBadgeProps) {
  return (
    <View style={[styles.badge, estado === "ok" ? styles.ok : styles.alert]}>
      <Text style={[styles.text, estado === "ok" ? styles.okText : styles.alertText]}>
        {etiquetas[estado]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  ok: {
    backgroundColor: theme.colors.primaryLight,
  },
  alert: {
    backgroundColor: theme.colors.errorLight,
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  okText: {
    color: theme.colors.primaryDark,
  },
  alertText: {
    color: theme.colors.error,
  },
});
