import { useDatabase } from '../context/DatabaseContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Button, Card, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

function todayKey() {
  return new Date().toLocaleDateString('en-CA');
}

export default function AddMealScreen() {
  const db = useDatabase();
  const params = useLocalSearchParams<{ barcode?: string }>();
  const dayKey = useMemo(() => todayKey(), []);

  const [mealType, setMealType] = useState('lunch');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [foodName, setFoodName] = useState('');
  const [qty, setQty] = useState('1');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [foodId, setFoodId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bc = typeof params.barcode === 'string' ? params.barcode : undefined;
      if (!bc) return;
      const foods = await db.listFoods(200);
      const hit = foods.find((f) => f.barcode === bc);
      if (cancelled) return;
      if (hit) {
        setFoodId(hit.id);
        setFoodName(hit.name);
        setKcal(hit.kcal != null ? String(hit.kcal) : '');
        setProtein(hit.protein_g != null ? String(hit.protein_g) : '');
        setCarbs(hit.carbs_g != null ? String(hit.carbs_g) : '');
        setFat(hit.fat_g != null ? String(hit.fat_g) : '');
      } else {
        setFoodId(null);
        setFoodName('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.barcode, db]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      <Card>
        <Card.Title title="Meal" subtitle={dayKey} />
        <Card.Content style={{ gap: 10 }}>
          <SegmentedButtons
            value={mealType}
            onValueChange={setMealType}
            buttons={[
              { value: 'breakfast', label: 'Breakfast' },
              { value: 'lunch', label: 'Lunch' },
              { value: 'dinner', label: 'Dinner' },
              { value: 'snack', label: 'Snack' },
            ]}
          />
          <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" />
          {photoUri ? <Image source={{ uri: photoUri }} style={{ width: '100%', height: 200, borderRadius: 12 }} /> : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button mode="outlined" onPress={async () => {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) return;
              const res = await ImagePicker.launchImageLibraryAsync({
                quality: 0.85,
                mediaTypes: ['images'],
              });
              if (!res.canceled) setPhotoUri(res.assets[0]?.uri ?? null);
            }}>
              Attach photo
            </Button>
            <Button mode="outlined" onPress={async () => {
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if (!perm.granted) return;
              const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
              if (!res.canceled) setPhotoUri(res.assets[0]?.uri ?? null);
            }}>
              Camera
            </Button>
          </View>
          <Button
            mode="contained-tonal"
            loading={aiBusy}
            onPress={async () => {
              if (!photoUri) {
                setAiError('Add a photo first.');
                return;
              }
              setAiBusy(true);
              setAiError(null);
              try {
                const est = await db.runAiMealEstimate(photoUri);
                setFoodName(est.description);
                setKcal(String(est.kcal));
                setProtein(String(est.protein_g));
                setCarbs(String(est.carbs_g));
                setFat(String(est.fat_g));
                setFoodId(null);
              } catch (e) {
                setAiError(e instanceof Error ? e.message : 'AI failed');
              } finally {
                setAiBusy(false);
              }
            }}
          >
            Optional: AI estimate from photo
          </Button>
          {aiError ? (
            <Text variant="bodySmall" style={{ color: '#fb7185' }}>
              {aiError}
            </Text>
          ) : null}
          <Text variant="labelLarge">Primary item</Text>
          <TextInput label="Food name" value={foodName} onChangeText={setFoodName} mode="outlined" />
          <TextInput label="Quantity" value={qty} onChangeText={setQty} keyboardType="decimal-pad" mode="outlined" />
          <TextInput label="kcal (optional)" value={kcal} onChangeText={setKcal} keyboardType="decimal-pad" mode="outlined" />
          <TextInput label="Protein g" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" mode="outlined" />
          <TextInput label="Carbs g" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" mode="outlined" />
          <TextInput label="Fat g" value={fat} onChangeText={setFat} keyboardType="decimal-pad" mode="outlined" />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        loading={busy}
        onPress={async () => {
          if (!foodName.trim()) return;
          const q = Number(qty);
          if (!Number.isFinite(q) || q <= 0) return;
          setBusy(true);
          try {
            await db.createMeal({
              logged_at: new Date().toISOString(),
              day_key: dayKey,
              meal_type: mealType,
              notes: notes.trim() || null,
              photo_uri: photoUri,
              items: [
                {
                  food_id: foodId,
                  food_name: foodName.trim(),
                  quantity: q,
                  kcal: kcal ? Number(kcal) : null,
                  protein_g: protein ? Number(protein) : null,
                  carbs_g: carbs ? Number(carbs) : null,
                  fat_g: fat ? Number(fat) : null,
                },
              ],
            });
            router.back();
          } finally {
            setBusy(false);
          }
        }}
      >
        Save meal
      </Button>
      <Button onPress={() => router.back()}>Cancel</Button>
    </ScrollView>
  );
}
