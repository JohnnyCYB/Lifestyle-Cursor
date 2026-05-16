import { useMemo } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export function SimpleBarChart({
  data,
  height = 140,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const theme = useTheme();
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 8 }}>
      {data.map((d) => {
        const h = Math.round((d.value / max) * (height - 28));
        return (
          <View key={d.label} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: '100%',
                height: Math.max(6, h),
                borderRadius: 8,
                backgroundColor: theme.colors.primary,
                opacity: 0.85,
              }}
            />
            <Text numberOfLines={1} variant="labelSmall" style={{ opacity: 0.75 }}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
