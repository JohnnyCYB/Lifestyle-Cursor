import { EmptyState } from '../../components/EmptyState';
import { useDatabase } from '../../context/DatabaseContext';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, RefreshControl, ScrollView, View } from 'react-native';
import { Button, Card, FAB, List, Text } from 'react-native-paper';

function todayKey() {
  return new Date().toLocaleDateString('en-CA');
}

export default function NutritionScreen() {
  const db = useDatabase();
  const dk = useMemo(() => todayKey(), [db.tick]);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof db.listMealsWithItems>>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRows(await db.listMealsWithItems(dk));
  }, [db, dk]);

  useEffect(() => {
    void load();
  }, [load, db.tick]);

  const totals = useMemo(() => {
    let kcal = 0;
    let p = 0;
    let c = 0;
    let f = 0;
    for (const r of rows) {
      for (const it of r.items) {
        const q = it.quantity || 1;
        kcal += (it.kcal ?? 0) * q;
        p += (it.protein_g ?? 0) * q;
        c += (it.carbs_g ?? 0) * q;
        f += (it.fat_g ?? 0) * q;
      }
    }
    return { kcal, p, c, f };
  }, [rows]);

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
          <Card.Title title="Today" subtitle={dk} />
          <Card.Content style={{ gap: 6 }}>
            <Text variant="titleMedium">
              {Math.round(totals.kcal)} kcal · P {Math.round(totals.p)} · C {Math.round(totals.c)} · F {Math.round(totals.f)}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.75 }}>
              Barcode lookup uses Open Food Facts (community data). Photos are stored locally; AI estimates are optional in
              Settings.
            </Text>
          </Card.Content>
        </Card>

        {rows.length === 0 ? (
          <EmptyState
            icon="food"
            title="No meals logged today"
            subtitle="Add a meal manually, scan a barcode, or attach a photo."
          />
        ) : (
          rows.map(({ meal, items }) => (
            <Card key={meal.id}>
              <Card.Title
                title={meal.meal_type ? `${meal.meal_type}` : 'Meal'}
                subtitle={new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <Card.Content style={{ gap: 8 }}>
                {meal.photo_uri ? (
                  <Image source={{ uri: meal.photo_uri }} style={{ width: '100%', height: 180, borderRadius: 12 }} />
                ) : null}
                {items.map((it) => (
                  <List.Item
                    key={it.id}
                    title={`${it.food_name} × ${it.quantity}`}
                    description={`${Math.round((it.kcal ?? 0) * it.quantity)} kcal`}
                  />
                ))}
                {meal.notes ? <Text variant="bodySmall">{meal.notes}</Text> : null}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <View style={{ position: 'absolute', right: 16, bottom: 22, gap: 10, alignItems: 'flex-end' }}>
        <FAB icon="barcode-scan" label="Scan" size="small" onPress={() => router.push('/scan-barcode')} />
        <FAB icon="silverware-fork-knife" label="Meal" onPress={() => router.push('/add-meal')} />
      </View>
    </View>
  );
}
