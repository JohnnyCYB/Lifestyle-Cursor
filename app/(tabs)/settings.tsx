import { getDatabase } from '../../lib/db';
import { useDatabase } from '../../context/DatabaseContext';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { Button, Card, Divider, Switch, Text, TextInput } from 'react-native-paper';

export default function SettingsScreen() {
  const db = useDatabase();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [apiBase, setApiBase] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [cap, setCap] = useState('5');
  const [usage, setUsage] = useState('0');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadAi = useCallback(async () => {
    const s = await db.getAiSettings();
    setAiEnabled(s.enabled);
    setApiBase(s.apiBase);
    setApiKey(s.apiKey);
    setModel(s.model);
    setCap(String(s.monthlyUsdCap));
    setUsage(String(s.usageUsdMonth));
  }, [db]);

  useEffect(() => {
    void loadAi();
  }, [loadAi, db.tick]);

  const saveAi = useCallback(async () => {
    await db.setAiSettings({
      enabled: aiEnabled,
      apiBase,
      apiKey,
      model,
      monthlyUsdCap: Number(cap) || 0,
    });
    setMsg('Saved AI settings (stored locally on this device).');
    await loadAi();
  }, [aiEnabled, apiBase, apiKey, cap, db, loadAi, model]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      <Card>
        <Card.Title title="Backup" subtitle="JSON export / import" />
        <Card.Content style={{ gap: 10 }}>
          <Button
            mode="contained"
            icon="export"
            onPress={async () => {
              setBusy(true);
              setMsg(null);
              try {
                const snap = await db.exportSnapshot();
                const json = JSON.stringify(snap, null, 2);
                const baseDir = FileSystem.cacheDirectory;
                if (!baseDir) {
                  await Clipboard.setStringAsync(json);
                  setMsg('Copied backup JSON to clipboard.');
                  return;
                }
                const path = `${baseDir}life-rpg-backup.json`;
                await FileSystem.writeAsStringAsync(path, json, { encoding: 'utf8' });
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export Life RPG' });
                } else if (Platform.OS === 'web') {
                  await Clipboard.setStringAsync(json);
                  setMsg('Copied backup JSON to clipboard (web).');
                } else {
                  setMsg(`Wrote backup to cache: ${path}`);
                }
              } catch (e) {
                setMsg(e instanceof Error ? e.message : 'Export failed');
              } finally {
                setBusy(false);
              }
            }}
          >
            Export JSON
          </Button>
          <Button
            mode="outlined"
            icon="import"
            onPress={async () => {
              setBusy(true);
              setMsg(null);
              try {
                const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
                if (picked.canceled) return;
                const asset = picked.assets?.[0];
                if (!asset?.uri) return;
                const raw = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });
                const data = JSON.parse(raw) as Record<string, unknown>;
                await db.importSnapshot(data);
                setMsg('Import complete.');
              } catch (e) {
                setMsg(e instanceof Error ? e.message : 'Import failed');
              } finally {
                setBusy(false);
              }
            }}
          >
            Import JSON
          </Button>
          <Text variant="bodySmall" style={{ opacity: 0.75 }}>
            Import replaces all local tables. Keep regular exports if you experiment.
          </Text>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Onboarding" />
        <Card.Content style={{ gap: 10 }}>
          <Button
            mode="outlined"
            onPress={async () => {
              const sqlite = await getDatabase();
              await sqlite.runAsync('UPDATE user_profile SET onboarding_completed = 0 WHERE id = ?', 'local');
              db.refresh();
              setMsg('Onboarding reset.');
              router.replace('/');
            }}
          >
            Replay welcome screens
          </Button>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Optional AI (hosted)" subtitle="Not required for $0 MVP" />
        <Card.Content style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="titleMedium">Enable AI meal estimates</Text>
            <Switch value={aiEnabled} onValueChange={setAiEnabled} />
          </View>
          <Text variant="bodySmall" style={{ opacity: 0.75 }}>
            Uses your API key against an OpenAI-compatible `/v1/chat/completions` endpoint. Budget tracking is a simple local
            counter (not a precise billing system).
          </Text>
          <TextInput label="API base URL" value={apiBase} onChangeText={setApiBase} autoCapitalize="none" mode="outlined" />
          <TextInput label="API key" value={apiKey} onChangeText={setApiKey} secureTextEntry mode="outlined" />
          <TextInput label="Model" value={model} onChangeText={setModel} mode="outlined" />
          <TextInput label="Monthly USD cap (0 disables cap)" value={cap} onChangeText={setCap} keyboardType="decimal-pad" mode="outlined" />
          <Text variant="bodySmall">Approximate usage this month: ${usage}</Text>
          <Divider />
          <Button mode="contained" onPress={() => void saveAi()} loading={busy}>
            Save AI settings
          </Button>
        </Card.Content>
      </Card>

      {msg ? <Text variant="bodyMedium">{msg}</Text> : null}
    </ScrollView>
  );
}
