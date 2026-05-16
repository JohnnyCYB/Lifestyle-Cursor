import { EmptyState } from '../../components/EmptyState';
import { useDatabase } from '../../context/DatabaseContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';
import { Button, Card, Chip, Dialog, List, Portal, Text, TextInput } from 'react-native-paper';

const SLOTS = ['morning', 'midday', 'evening'] as const;

function todayKey() {
  return new Date().toLocaleDateString('en-CA');
}

export default function SupplementsScreen() {
  const db = useDatabase();
  const dk = useMemo(() => todayKey(), [db.tick]);
  const [schedules, setSchedules] = useState<Awaited<ReturnType<typeof db.listSupplementSchedules>>>([]);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof db.listDoseLogsForDay>>>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['morning']);

  const load = useCallback(async () => {
    const [s, l] = await Promise.all([db.listSupplementSchedules(), db.listDoseLogsForDay(dk)]);
    setSchedules(s);
    setLogs(l);
  }, [db, dk]);

  useEffect(() => {
    void load();
  }, [load, db.tick]);

  const logMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of logs) {
      m.set(`${l.schedule_id}:${l.slot}`, l.status);
    }
    return m;
  }, [logs]);

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
          <Card.Title title="Today" subtitle={dk} />
          <Card.Content style={{ gap: 10 }}>
            <Text variant="bodySmall" style={{ opacity: 0.75 }}>
              Tap Taken / Skipped for each scheduled slot. This is a wellness log, not medical advice.
            </Text>
          </Card.Content>
        </Card>

        {schedules.filter((s) => s.active).length === 0 ? (
          <EmptyState icon="pill" title="No active supplements" subtitle="Add a schedule to start tracking adherence." />
        ) : (
          schedules
            .filter((s) => s.active)
            .map((s) => {
              let slots: string[] = [];
              try {
                slots = JSON.parse(s.times_of_day) as string[];
              } catch {
                slots = ['morning'];
              }
              return (
                <Card key={s.id}>
                  <Card.Title title={s.name} subtitle={s.dosage ?? 'Dose not set'} />
                  <Card.Content style={{ gap: 10 }}>
                    {slots.map((slot) => {
                      const st = logMap.get(`${s.id}:${slot}`) ?? 'pending';
                      return (
                        <View key={slot} style={{ gap: 8 }}>
                          <Text variant="titleSmall" style={{ textTransform: 'capitalize' }}>
                            {slot} · {st}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Button
                              mode="contained-tonal"
                              onPress={async () => {
                                await db.logDose(s.id, slot, 'taken');
                                await load();
                              }}
                            >
                              Taken
                            </Button>
                            <Button
                              mode="outlined"
                              onPress={async () => {
                                await db.logDose(s.id, slot, 'skipped');
                                await load();
                              }}
                            >
                              Skipped
                            </Button>
                          </View>
                        </View>
                      );
                    })}
                    <Button
                      mode="text"
                      onPress={async () => {
                        await db.setSupplementActive(s.id, false);
                        await load();
                      }}
                    >
                      Deactivate
                    </Button>
                  </Card.Content>
                </Card>
              );
            })
        )}

        {schedules.some((s) => !s.active) ? (
          <Card>
            <Card.Title title="Inactive" />
            <Card.Content style={{ gap: 8 }}>
              {schedules
                .filter((s) => !s.active)
                .map((s) => (
                  <List.Item
                    key={s.id}
                    title={s.name}
                    right={() => (
                      <Button
                        mode="contained-tonal"
                        onPress={async () => {
                          await db.setSupplementActive(s.id, true);
                          await load();
                        }}
                      >
                        Activate
                      </Button>
                    )}
                  />
                ))}
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>

      <View style={{ position: 'absolute', right: 16, bottom: 22 }}>
        <Button mode="contained" icon="plus" onPress={() => setOpen(true)}>
          Add schedule
        </Button>
      </View>

      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>New supplement schedule</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" />
            <TextInput label="Dosage (optional)" value={dosage} onChangeText={setDosage} mode="outlined" />
            <Text variant="labelLarge">Reminder slots</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SLOTS.map((slot) => {
                const on = selectedSlots.includes(slot);
                return (
                  <Chip
                    key={slot}
                    selected={on}
                    onPress={() => {
                      setSelectedSlots((prev) =>
                        on ? prev.filter((x) => x !== slot) : Array.from(new Set([...prev, slot]))
                      );
                    }}
                  >
                    {slot}
                  </Chip>
                );
              })}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={async () => {
                if (!name.trim() || selectedSlots.length === 0) return;
                await db.addSupplementSchedule({
                  name: name.trim(),
                  dosage: dosage.trim() || null,
                  times_of_day: selectedSlots,
                });
                setOpen(false);
                setName('');
                setDosage('');
                setSelectedSlots(['morning']);
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
