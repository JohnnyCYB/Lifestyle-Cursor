import { EmptyState } from '../../components/EmptyState';
import { SimpleBarChart } from '../../components/SimpleBarChart';
import { useDatabase } from '../../context/DatabaseContext';
import { getDatabase } from '../../lib/db';
import { xpProgress } from '../../lib/level';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Button, Card, Dialog, FAB, List, Portal, ProgressBar, Text, TextInput } from 'react-native-paper';

function last7DayKeys() {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d.toLocaleDateString('en-CA'));
  }
  return out;
}

function weekdayShort(iso: string) {
  const [y, m, day] = iso.split('-').map(Number);
  const d = new Date(y, (m ?? 1) - 1, day ?? 1);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function HomeScreen() {
  const db = useDatabase();
  const [refreshing, setRefreshing] = useState(false);
  const [ledger, setLedger] = useState<Awaited<ReturnType<typeof db.listLedger>>>([]);
  const [quests, setQuests] = useState<Awaited<ReturnType<typeof db.listQuests>>>([]);
  const [weekPoints, setWeekPoints] = useState(0);
  const [series, setSeries] = useState<{ label: string; value: number }[]>([]);
  const [dialog, setDialog] = useState<'points' | 'quest' | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customPts, setCustomPts] = useState('5');
  const [manualPts, setManualPts] = useState('5');
  const [manualReason, setManualReason] = useState('');

  const load = useCallback(async () => {
    const [l, q] = await Promise.all([db.listLedger(25), db.listQuests()]);
    setLedger(l);
    setQuests(q);

    const dayKeys = last7DayKeys();
    const sinceIso = `${dayKeys[0]}T00:00:00`;
    const sqlite = await getDatabase();
    const weekRows = await sqlite.getAllAsync<{ s: number }>(
      `SELECT SUM(points) as s FROM point_ledger WHERE datetime(created_at) >= datetime(?)`,
      sinceIso
    );
    setWeekPoints(weekRows[0]?.s ?? 0);

    const sums = new Map<string, number>();
    for (const dk of dayKeys) {
      sums.set(dk, 0);
    }
    const byDay = await sqlite.getAllAsync<{ d: string; s: number }>(
      `SELECT strftime('%Y-%m-%d', created_at) as d, SUM(points) as s
       FROM point_ledger
       WHERE datetime(created_at) >= datetime(?)
       GROUP BY d`,
      sinceIso
    );
    for (const row of byDay) {
      sums.set(row.d, row.s ?? 0);
    }
    setSeries(dayKeys.map((dk) => ({ label: weekdayShort(dk), value: sums.get(dk) ?? 0 })));
  }, [db]);

  useEffect(() => {
    void load();
  }, [load, db.tick]);

  const total = db.profile?.total_points ?? 0;
  const prog = useMemo(() => xpProgress(total), [total]);

  return (
    <View style={{ flex: 1 }}>
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
          <Card.Title title={`Welcome back, ${db.profile?.display_name ?? 'Hero'}`} subtitle="Your progression" />
          <Card.Content style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="headlineSmall">Level {prog.level}</Text>
              <Text variant="titleMedium">{total} pts</Text>
            </View>
            <Text variant="bodySmall" style={{ opacity: 0.75 }}>
              Next level progress
            </Text>
            <ProgressBar progress={prog.inBand} />
            <Text variant="bodySmall" style={{ opacity: 0.75 }}>
              Points in the last 7 days: {weekPoints}
            </Text>
          </Card.Content>
        </Card>

        <Card>
          <Card.Title title="Quest board" subtitle="Log a completion for points" />
          <Card.Content style={{ gap: 8 }}>
            {quests.length === 0 ? (
              <EmptyState
                icon="map-marker-radius"
                title="No quests yet"
                subtitle="Create a custom quest using the + button."
              />
            ) : (
              quests.map((q) => (
                <List.Item
                  key={q.id}
                  title={q.title}
                  description={`${q.points} pts`}
                  right={() => (
                    <Button
                      mode="contained-tonal"
                      compact
                      onPress={async () => {
                        await db.addPoints(q.points, `Quest: ${q.title}`, q.id);
                        await load();
                      }}
                    >
                      Log
                    </Button>
                  )}
                />
              ))
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Title title="7-day points" subtitle="Based on point_ledger timestamps" />
          <Card.Content>
            <SimpleBarChart data={series} />
          </Card.Content>
        </Card>

        <Card>
          <Card.Title title="Recent loot" subtitle="Point history" />
          <Card.Content style={{ gap: 6 }}>
            {ledger.length === 0 ? (
              <EmptyState
                icon="treasure-chest"
                title="No points logged yet"
                subtitle="Complete a quest or add manual points."
              />
            ) : (
              ledger.map((row) => (
                <List.Item
                  key={row.id}
                  title={row.reason}
                  description={new Date(row.created_at).toLocaleString()}
                  right={() => (
                    <Text variant="titleMedium" style={{ alignSelf: 'center' }}>
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </Text>
                  )}
                />
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={{ position: 'absolute', right: 16, bottom: 22, gap: 10, alignItems: 'flex-end' }}>
        <FAB icon="sword-cross" label="Quest" size="small" onPress={() => setDialog('quest')} />
        <FAB icon="star-plus" label="Points" onPress={() => setDialog('points')} />
      </View>

      <Portal>
        <Dialog visible={dialog === 'points'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Manual points</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <TextInput label="Points" keyboardType="number-pad" value={manualPts} onChangeText={setManualPts} mode="outlined" />
            <TextInput label="Reason" value={manualReason} onChangeText={setManualReason} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={async () => {
                const p = Number(manualPts);
                if (!manualReason.trim() || !Number.isFinite(p)) return;
                await db.addPoints(p, manualReason.trim(), null);
                setDialog(null);
                setManualReason('');
                await load();
              }}
            >
              Award
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'quest'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Create custom quest</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <TextInput label="Title" value={customTitle} onChangeText={setCustomTitle} mode="outlined" />
            <TextInput label="Points" keyboardType="number-pad" value={customPts} onChangeText={setCustomPts} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={async () => {
                const p = Number(customPts);
                if (!customTitle.trim() || !Number.isFinite(p)) return;
                await db.createQuest(customTitle.trim(), p);
                setDialog(null);
                setCustomTitle('');
                await load();
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
