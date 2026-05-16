import { EmptyState } from '../../components/EmptyState';
import { SimpleBarChart } from '../../components/SimpleBarChart';
import { useDatabase } from '../../context/DatabaseContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';
import { Button, Card, Dialog, List, Portal, Text, TextInput } from 'react-native-paper';

export default function GymScreen() {
  const db = useDatabase();
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof db.listGymMetrics>>>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('bodyweight');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('lb');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setMetrics(await db.listGymMetrics(undefined, 80));
  }, [db]);

  useEffect(() => {
    void load();
  }, [load, db.tick]);

  const chart = useMemo(() => {
    const body = metrics.filter((m) => m.metric_type === 'bodyweight').slice(0, 14).reverse();
    return body.map((m) => ({
      label: new Date(m.logged_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      value: m.value,
    }));
  }, [metrics]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await load();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
      >
        <Card>
          <Card.Title title="Starter templates" subtitle="Ideas (not auto-tracked)" />
          <Card.Content style={{ gap: 8 }}>
            <Text variant="bodyMedium">
              Push / Pull / Legs 3×/wk, or Upper / Lower 4×/wk. Track load and bodyweight here; award yourself quest points on
              the Home tab when you finish a session.
            </Text>
          </Card.Content>
        </Card>

        <Card>
          <Card.Title title="Bodyweight trend" subtitle="Last entries (newest on the right)" />
          <Card.Content>
            {chart.length === 0 ? (
              <EmptyState icon="scale-bathroom" title="No bodyweight entries" subtitle="Log your weight to see a chart." />
            ) : (
              <SimpleBarChart data={chart} height={160} />
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Title title="Recent metrics" />
          <Card.Content style={{ gap: 6 }}>
            {metrics.length === 0 ? (
              <EmptyState icon="dumbbell" title="Nothing logged yet" subtitle="Add weight, reps, or custom metrics." />
            ) : (
              metrics.slice(0, 25).map((m) => (
                <List.Item
                  key={m.id}
                  title={`${m.metric_type}`}
                  description={new Date(m.logged_at).toLocaleString()}
                  right={() => (
                    <Text variant="titleMedium" style={{ alignSelf: 'center' }}>
                      {m.value}
                      {m.unit ? ` ${m.unit}` : ''}
                    </Text>
                  )}
                />
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={{ position: 'absolute', right: 16, bottom: 22 }}>
        <Button mode="contained" icon="plus" onPress={() => setOpen(true)}>
          Log metric
        </Button>
      </View>

      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>Log gym metric</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <TextInput label="Type (e.g. bodyweight, bench_press)" value={type} onChangeText={setType} mode="outlined" />
            <TextInput label="Value" keyboardType="decimal-pad" value={value} onChangeText={setValue} mode="outlined" />
            <TextInput label="Unit (lb, kg, reps…)" value={unit} onChangeText={setUnit} mode="outlined" />
            <TextInput label="Notes (optional)" value={notes} onChangeText={setNotes} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={async () => {
                const v = Number(value);
                if (!type.trim() || !Number.isFinite(v)) return;
                await db.addGymMetric({
                  metric_type: type.trim(),
                  value: v,
                  unit: unit.trim() || null,
                  logged_at: new Date().toISOString(),
                  notes: notes.trim() || null,
                });
                setOpen(false);
                setValue('');
                setNotes('');
                await load();
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}
