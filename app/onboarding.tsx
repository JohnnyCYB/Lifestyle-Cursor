import { useDatabase } from '../context/DatabaseContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function Onboarding() {
  const { completeOnboarding } = useDatabase();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 20, gap: 14, justifyContent: 'center' }}>
        <Text variant="headlineMedium">Life RPG</Text>
        <Text variant="bodyLarge" style={{ opacity: 0.85 }}>
          Turn your habits into quests, earn points, and level up. This is your private wellness tracker: nutrition,
          gym metrics, supplements, and achievements—mostly offline.
        </Text>
        <Text variant="titleMedium">What should we call you?</Text>
        <TextInput mode="outlined" placeholder="Hero name" value={name} onChangeText={setName} autoFocus />
        <Button
          mode="contained"
          disabled={busy || !name.trim()}
          onPress={async () => {
            setBusy(true);
            try {
              await completeOnboarding(name.trim());
              router.replace('/(tabs)');
            } finally {
              setBusy(false);
            }
          }}
        >
          Start adventure
        </Button>
        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
          Tip: you can export a JSON backup anytime from Settings.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
