import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16, gap: 8 }}>
      <MaterialCommunityIcons name={icon} size={44} color="#64748b" />
      <Text variant="titleMedium" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.75 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
