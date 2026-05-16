import { useDatabase } from '../context/DatabaseContext';
import { fetchOpenFoodFactsProduct } from '../lib/openfoodfacts';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';

export default function ScanBarcodeScreen() {
  const db = useDatabase();
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const scannedRef = useRef(false);

  const finishWithBarcode = useCallback(
    async (barcode: string) => {
      const clean = barcode.trim();
      if (!clean) return;
      setBusy(true);
      setStatus(null);
      try {
        const off = await fetchOpenFoodFactsProduct(clean);
        if (!off.product) {
          setStatus('Product not found in Open Food Facts. You can still log manually.');
          router.replace({ pathname: '/add-meal', params: { barcode: clean } });
          return;
        }
        const p = off.product;
        const n = p.nutriments ?? {};
        const kcal = n['energy-kcal_100g'];
        await db.upsertFoodFromBarcode({
          barcode: clean,
          name: p.product_name || 'Unknown product',
          brand: p.brands,
          kcal: typeof kcal === 'number' ? kcal : undefined,
          protein_g: typeof n['proteins_100g'] === 'number' ? n['proteins_100g'] : undefined,
          carbs_g: typeof n['carbohydrates_100g'] === 'number' ? n['carbohydrates_100g'] : undefined,
          fat_g: typeof n['fat_100g'] === 'number' ? n['fat_100g'] : undefined,
          serving_label: p.serving_size,
        });
        router.replace({ pathname: '/add-meal', params: { barcode: clean } });
      } catch (e) {
        setStatus(e instanceof Error ? e.message : 'Lookup failed');
      } finally {
        setBusy(false);
      }
    },
    [db]
  );

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scannedRef.current) return;
      scannedRef.current = true;
      void finishWithBarcode(data);
    },
    [finishWithBarcode]
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Card>
        <Card.Title title="Barcode" subtitle="Open Food Facts lookup (free)" />
        <Card.Content style={{ gap: 10 }}>
          <Text variant="bodyMedium" style={{ opacity: 0.8 }}>
            On phones, use the camera scanner. On web, paste a barcode and press lookup.
          </Text>
          {Platform.OS === 'web' ? (
            <View style={{ gap: 10 }}>
              <TextInput label="Barcode" value={manual} onChangeText={setManual} mode="outlined" autoCapitalize="none" />
              <Button mode="contained" loading={busy} onPress={() => void finishWithBarcode(manual)}>
                Lookup
              </Button>
            </View>
          ) : !permission?.granted ? (
            <Button mode="contained" onPress={() => void requestPermission()}>
              Allow camera
            </Button>
          ) : (
            <View style={{ height: 360, borderRadius: 16, overflow: 'hidden' }}>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
                }}
                onBarcodeScanned={onBarcodeScanned}
              />
            </View>
          )}
          {status ? (
            <Text variant="bodySmall" style={{ color: '#fb7185' }}>
              {status}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
      <Button onPress={() => router.back()}>Close</Button>
    </View>
  );
}
