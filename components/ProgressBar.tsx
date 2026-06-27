import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, fontSizes } from "../constants/theme";

interface ProgressBarProps {
  /** 0 - 100 */
  progress: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color,
  height = 10,
}: ProgressBarProps) {
  const theme = useAppTheme();
  const clamped = Math.max(0, Math.min(100, progress));
  const barColor = color ?? theme.accent;

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label ? (
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
          ) : (
            <View />
          )}
          {showPercentage && (
            <Text style={[styles.percent, { color: theme.textMuted }]}>
              {Math.round(clamped)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          { height, backgroundColor: theme.border, borderRadius: height / 2 },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: barColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  percent: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
