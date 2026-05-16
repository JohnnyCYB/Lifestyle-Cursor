import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useDatabase } from '../context/DatabaseContext';

export default function Index() {
  const { ready, profile } = useDatabase();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator />
        <Text>Loading your save file…</Text>
      </View>
    );
  }
  if (!profile?.onboarding_completed) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/(tabs)" />;
}
