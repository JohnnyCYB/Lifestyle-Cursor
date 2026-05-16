import * as Crypto from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getDatabase } from '../lib/db';
import {
  bumpAiUsageUsd,
  estimateMealFromPhoto,
  estimateTokensToUsd,
  parseAiSettings,
  type AiSettings,
} from '../lib/aiService';

export type UserProfile = {
  id: string;
  display_name: string;
  total_points: number;
  onboarding_completed: number;
  created_at: string;
};

export type Quest = {
  id: string;
  title: string;
  points: number;
  is_custom: number;
  created_at: string;
};

export type LedgerRow = {
  id: string;
  points: number;
  reason: string;
  quest_id: string | null;
  created_at: string;
};

export type Food = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  serving_label: string | null;
  created_at: string;
};

export type Meal = {
  id: string;
  logged_at: string;
  meal_type: string | null;
  notes: string | null;
  photo_uri: string | null;
  created_at: string;
};

export type MealItem = {
  id: string;
  meal_id: string;
  food_id: string | null;
  food_name: string;
  quantity: number;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
};

export type GymMetric = {
  id: string;
  metric_type: string;
  value: number;
  unit: string | null;
  logged_at: string;
  notes: string | null;
};

export type SupplementSchedule = {
  id: string;
  name: string;
  dosage: string | null;
  times_of_day: string;
  active: number;
  created_at: string;
};

export type DoseLog = {
  id: string;
  schedule_id: string;
  day_key: string;
  slot: string;
  status: string;
  logged_at: string;
};

type Ctx = {
  ready: boolean;
  tick: number;
  refresh: () => void;
  profile: UserProfile | null;
  setDisplayName: (name: string) => Promise<void>;
  completeOnboarding: (name: string) => Promise<void>;
  addPoints: (points: number, reason: string, questId?: string | null) => Promise<void>;
  listLedger: (limit?: number) => Promise<LedgerRow[]>;
  listQuests: () => Promise<Quest[]>;
  createQuest: (title: string, points: number) => Promise<void>;
  listFoods: (limit?: number) => Promise<Food[]>;
  upsertFoodFromBarcode: (input: {
    barcode: string;
    name: string;
    brand?: string;
    kcal?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    serving_label?: string;
  }) => Promise<Food>;
  createMeal: (input: {
    logged_at: string;
    day_key: string;
    meal_type?: string | null;
    notes?: string | null;
    photo_uri?: string | null;
    items: {
      food_id?: string | null;
      food_name: string;
      quantity: number;
      kcal?: number | null;
      protein_g?: number | null;
      carbs_g?: number | null;
      fat_g?: number | null;
    }[];
  }) => Promise<string>;
  listMealsWithItems: (dayKey: string) => Promise<{ meal: Meal; items: MealItem[] }[]>;
  addGymMetric: (input: {
    metric_type: string;
    value: number;
    unit?: string | null;
    logged_at: string;
    notes?: string | null;
  }) => Promise<void>;
  listGymMetrics: (metric_type?: string, limit?: number) => Promise<GymMetric[]>;
  addSupplementSchedule: (input: {
    name: string;
    dosage?: string | null;
    times_of_day: string[];
  }) => Promise<void>;
  listSupplementSchedules: () => Promise<SupplementSchedule[]>;
  setSupplementActive: (id: string, active: boolean) => Promise<void>;
  logDose: (scheduleId: string, slot: string, status: 'taken' | 'skipped') => Promise<void>;
  listDoseLogsForDay: (dayKey: string) => Promise<DoseLog[]>;
  getSettingsMap: () => Promise<Record<string, string>>;
  setSettingsBatch: (pairs: Record<string, string>) => Promise<void>;
  getAiSettings: () => Promise<AiSettings>;
  setAiSettings: (next: Partial<AiSettings>) => Promise<void>;
  runAiMealEstimate: (imageUri: string) => Promise<{
    description: string;
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;
  exportSnapshot: () => Promise<Record<string, unknown>>;
  importSnapshot: (data: Record<string, unknown>) => Promise<void>;
};

const DatabaseContext = createContext<Ctx | null>(null);

function todayKey() {
  return new Date().toLocaleDateString('en-CA');
}

async function seedIfEmpty(db: Awaited<ReturnType<typeof getDatabase>>) {
  const rows = await db.getAllAsync<{ c: number }>('SELECT COUNT(*) as c FROM user_profile');
  const c = rows[0]?.c ?? 0;
  if (c === 0) {
    const id = 'local';
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO user_profile (id, display_name, total_points, onboarding_completed, created_at) VALUES (?, ?, 0, 0, ?)`,
      id,
      'Hero',
      now
    );
  }
  const q = await db.getAllAsync<{ c: number }>('SELECT COUNT(*) as c FROM quests');
  if ((q[0]?.c ?? 0) === 0) {
    const now = new Date().toISOString();
    const defaults: { title: string; points: number }[] = [
      { title: 'Work out', points: 15 },
      { title: 'Log all meals', points: 10 },
      { title: 'Tidy space (5 min)', points: 5 },
      { title: 'Drink water goal', points: 5 },
      { title: 'Big milestone (cert/degree)', points: 500 },
    ];
    for (const d of defaults) {
      await db.runAsync(
        `INSERT INTO quests (id, title, points, is_custom, created_at) VALUES (?, ?, ?, 0, ?)`,
        Crypto.randomUUID(),
        d.title,
        d.points,
        now
      );
    }
  }
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const loadProfile = useCallback(async () => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<UserProfile>('SELECT * FROM user_profile LIMIT 1');
    setProfile(rows[0] ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = await getDatabase();
      await seedIfEmpty(db);
      if (!cancelled) {
        await loadProfile();
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProfile, tick]);

  const setDisplayName = useCallback(
    async (name: string) => {
      const db = await getDatabase();
      await db.runAsync('UPDATE user_profile SET display_name = ? WHERE id = ?', name, 'local');
      refresh();
    },
    [refresh]
  );

  const completeOnboarding = useCallback(
    async (name: string) => {
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE user_profile SET display_name = ?, onboarding_completed = 1 WHERE id = ?',
        name,
        'local'
      );
      refresh();
    },
    [refresh]
  );

  const addPoints = useCallback(
    async (points: number, reason: string, questId?: string | null) => {
      const db = await getDatabase();
      const id = Crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execAsync('BEGIN');
      try {
        await db.runAsync(
          `INSERT INTO point_ledger (id, points, reason, quest_id, created_at) VALUES (?, ?, ?, ?, ?)`,
          id,
          points,
          reason,
          questId ?? null,
          now
        );
        await db.runAsync('UPDATE user_profile SET total_points = total_points + ? WHERE id = ?', points, 'local');
        await db.execAsync('COMMIT');
      } catch (e) {
        await db.execAsync('ROLLBACK');
        throw e;
      }
      refresh();
    },
    [refresh]
  );

  const listLedger = useCallback(async (limit = 50) => {
    const db = await getDatabase();
    return await db.getAllAsync<LedgerRow>(
      `SELECT * FROM point_ledger ORDER BY datetime(created_at) DESC LIMIT ?`,
      limit
    );
  }, []);

  const listQuests = useCallback(async () => {
    const db = await getDatabase();
    return await db.getAllAsync<Quest>(`SELECT * FROM quests ORDER BY is_custom ASC, title ASC`);
  }, []);

  const createQuest = useCallback(
    async (title: string, points: number) => {
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO quests (id, title, points, is_custom, created_at) VALUES (?, ?, ?, 1, ?)`,
        Crypto.randomUUID(),
        title,
        points,
        new Date().toISOString()
      );
      refresh();
    },
    [refresh]
  );

  const listFoods = useCallback(async (limit = 80) => {
    const db = await getDatabase();
    return await db.getAllAsync<Food>(
      `SELECT * FROM foods ORDER BY datetime(created_at) DESC LIMIT ?`,
      limit
    );
  }, []);

  const upsertFoodFromBarcode = useCallback(
    async (input: {
      barcode: string;
      name: string;
      brand?: string;
      kcal?: number;
      protein_g?: number;
      carbs_g?: number;
      fat_g?: number;
      serving_label?: string;
    }) => {
      const db = await getDatabase();
      const existing = await db.getAllAsync<Food>('SELECT * FROM foods WHERE barcode = ? LIMIT 1', input.barcode);
      const now = new Date().toISOString();
      if (existing[0]) {
        await db.runAsync(
          `UPDATE foods SET name=?, brand=?, kcal=?, protein_g=?, carbs_g=?, fat_g=?, serving_label=? WHERE id=?`,
          input.name,
          input.brand ?? null,
          input.kcal ?? null,
          input.protein_g ?? null,
          input.carbs_g ?? null,
          input.fat_g ?? null,
          input.serving_label ?? null,
          existing[0].id
        );
        refresh();
        return (await db.getAllAsync<Food>('SELECT * FROM foods WHERE id = ?', existing[0].id))[0]!;
      }
      const id = Crypto.randomUUID();
      await db.runAsync(
        `INSERT INTO foods (id, name, brand, barcode, kcal, protein_g, carbs_g, fat_g, serving_label, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        input.name,
        input.brand ?? null,
        input.barcode,
        input.kcal ?? null,
        input.protein_g ?? null,
        input.carbs_g ?? null,
        input.fat_g ?? null,
        input.serving_label ?? null,
        now
      );
      refresh();
      return (await db.getAllAsync<Food>('SELECT * FROM foods WHERE id = ?', id))[0]!;
    },
    [refresh]
  );

  const createMeal = useCallback(
    async (input: {
      logged_at: string;
      day_key: string;
      meal_type?: string | null;
      notes?: string | null;
      photo_uri?: string | null;
      items: {
        food_id?: string | null;
        food_name: string;
        quantity: number;
        kcal?: number | null;
        protein_g?: number | null;
        carbs_g?: number | null;
        fat_g?: number | null;
      }[];
    }) => {
      const db = await getDatabase();
      const mealId = Crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execAsync('BEGIN');
      try {
        await db.runAsync(
          `INSERT INTO meals (id, logged_at, meal_type, notes, photo_uri, created_at, day_key) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          mealId,
          input.logged_at,
          input.meal_type ?? null,
          input.notes ?? null,
          input.photo_uri ?? null,
          now,
          input.day_key
        );
        for (const it of input.items) {
          await db.runAsync(
            `INSERT INTO meal_items (id, meal_id, food_id, food_name, quantity, kcal, protein_g, carbs_g, fat_g)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            Crypto.randomUUID(),
            mealId,
            it.food_id ?? null,
            it.food_name,
            it.quantity,
            it.kcal ?? null,
            it.protein_g ?? null,
            it.carbs_g ?? null,
            it.fat_g ?? null
          );
        }
        await db.execAsync('COMMIT');
      } catch (e) {
        await db.execAsync('ROLLBACK');
        throw e;
      }
      refresh();
      return mealId;
    },
    [refresh]
  );

  const listMealsWithItems = useCallback(async (dayKey: string) => {
    const db = await getDatabase();
    const meals = await db.getAllAsync<Meal>(
      `SELECT * FROM meals WHERE day_key = ? ORDER BY datetime(logged_at) DESC`,
      dayKey
    );
    const out: { meal: Meal; items: MealItem[] }[] = [];
    for (const m of meals) {
      const items = await db.getAllAsync<MealItem>(`SELECT * FROM meal_items WHERE meal_id = ? ORDER BY rowid ASC`, m.id);
      out.push({ meal: m, items });
    }
    return out;
  }, []);

  const addGymMetric = useCallback(
    async (input: {
      metric_type: string;
      value: number;
      unit?: string | null;
      logged_at: string;
      notes?: string | null;
    }) => {
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO gym_metrics (id, metric_type, value, unit, logged_at, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        Crypto.randomUUID(),
        input.metric_type,
        input.value,
        input.unit ?? null,
        input.logged_at,
        input.notes ?? null
      );
      refresh();
    },
    [refresh]
  );

  const listGymMetrics = useCallback(async (metric_type?: string, limit = 60) => {
    const db = await getDatabase();
    if (metric_type) {
      return await db.getAllAsync<GymMetric>(
        `SELECT * FROM gym_metrics WHERE metric_type = ? ORDER BY datetime(logged_at) DESC LIMIT ?`,
        metric_type,
        limit
      );
    }
    return await db.getAllAsync<GymMetric>(
      `SELECT * FROM gym_metrics ORDER BY datetime(logged_at) DESC LIMIT ?`,
      limit
    );
  }, []);

  const addSupplementSchedule = useCallback(
    async (input: { name: string; dosage?: string | null; times_of_day: string[] }) => {
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO supplement_schedules (id, name, dosage, times_of_day, active, created_at) VALUES (?, ?, ?, ?, 1, ?)`,
        Crypto.randomUUID(),
        input.name,
        input.dosage ?? null,
        JSON.stringify(input.times_of_day),
        new Date().toISOString()
      );
      refresh();
    },
    [refresh]
  );

  const listSupplementSchedules = useCallback(async () => {
    const db = await getDatabase();
    return await db.getAllAsync<SupplementSchedule>(
      `SELECT * FROM supplement_schedules ORDER BY active DESC, name ASC`
    );
  }, []);

  const setSupplementActive = useCallback(
    async (id: string, active: boolean) => {
      const db = await getDatabase();
      await db.runAsync('UPDATE supplement_schedules SET active = ? WHERE id = ?', active ? 1 : 0, id);
      refresh();
    },
    [refresh]
  );

  const logDose = useCallback(
    async (scheduleId: string, slot: string, status: 'taken' | 'skipped') => {
      const db = await getDatabase();
      const day = todayKey();
      await db.runAsync(`DELETE FROM dose_logs WHERE schedule_id = ? AND day_key = ? AND slot = ?`, scheduleId, day, slot);
      await db.runAsync(
        `INSERT INTO dose_logs (id, schedule_id, day_key, slot, status, logged_at) VALUES (?, ?, ?, ?, ?, ?)`,
        Crypto.randomUUID(),
        scheduleId,
        day,
        slot,
        status,
        new Date().toISOString()
      );
      refresh();
    },
    [refresh]
  );

  const listDoseLogsForDay = useCallback(async (dayKey: string) => {
    const db = await getDatabase();
    return await db.getAllAsync<DoseLog>(`SELECT * FROM dose_logs WHERE day_key = ?`, dayKey);
  }, []);

  const getSettingsMap = useCallback(async () => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string }>(`SELECT key, value FROM app_settings`);
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  }, []);

  const setSettingsBatch = useCallback(
    async (pairs: Record<string, string>) => {
      const db = await getDatabase();
      await db.execAsync('BEGIN');
      try {
        for (const [k, v] of Object.entries(pairs)) {
          await db.runAsync(
            `INSERT INTO app_settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            k,
            v
          );
        }
        await db.execAsync('COMMIT');
      } catch (e) {
        await db.execAsync('ROLLBACK');
        throw e;
      }
      refresh();
    },
    [refresh]
  );

  const getAiSettings = useCallback(async () => {
    const map = await getSettingsMap();
    return parseAiSettings(map);
  }, [getSettingsMap]);

  const setAiSettings = useCallback(
    async (next: Partial<AiSettings>) => {
      const cur = await getAiSettings();
      const merged: AiSettings = { ...cur, ...next };
      await setSettingsBatch({
        ai_enabled: merged.enabled ? '1' : '0',
        ai_api_base: merged.apiBase,
        ai_api_key: merged.apiKey,
        ai_model: merged.model,
        ai_monthly_usd_cap: String(merged.monthlyUsdCap),
        ai_usage_usd_month: String(merged.usageUsdMonth),
        ai_usage_month_key: merged.usageMonthKey,
      });
    },
    [getAiSettings, setSettingsBatch]
  );

  const runAiMealEstimate = useCallback(
    async (imageUri: string) => {
      const settings = await getAiSettings();
      const result = await estimateMealFromPhoto({ imageUri, settings });
      const tokens = 900;
      const usd = estimateTokensToUsd(tokens);
      const bumped = bumpAiUsageUsd(settings, usd);
      await setAiSettings(bumped);
      return result;
    },
    [getAiSettings, setAiSettings]
  );

  const exportSnapshot = useCallback(async () => {
    const db = await getDatabase();
    const tables = [
      'user_profile',
      'point_ledger',
      'quests',
      'foods',
      'meals',
      'meal_items',
      'gym_metrics',
      'supplement_schedules',
      'dose_logs',
      'app_settings',
    ] as const;
    const out: Record<string, unknown> = { version: 1, exported_at: new Date().toISOString() };
    for (const t of tables) {
      out[t] = await db.getAllAsync(`SELECT * FROM ${t}`);
    }
    return out;
  }, []);

  const importSnapshot = useCallback(
    async (data: Record<string, unknown>) => {
      const db = await getDatabase();
      const tables = [
        'user_profile',
        'point_ledger',
        'quests',
        'foods',
        'meals',
        'meal_items',
        'gym_metrics',
        'supplement_schedules',
        'dose_logs',
        'app_settings',
      ] as const;
      await db.execAsync('BEGIN');
      try {
      const deleteOrder = [
        'dose_logs',
        'meal_items',
        'meals',
        'gym_metrics',
        'foods',
        'supplement_schedules',
        'point_ledger',
        'quests',
        'app_settings',
        'user_profile',
      ];
      for (const t of deleteOrder) {
        await db.execAsync(`DELETE FROM ${t}`);
      }
      for (const t of tables) {
          const rows = data[t] as Record<string, unknown>[] | undefined;
          if (!rows?.length) continue;
          for (const row of rows) {
            const keys = Object.keys(row);
            const placeholders = keys.map(() => '?').join(',');
            const vals: (string | number | Uint8Array | null)[] = keys.map((k) => {
              const v = row[k];
              if (v === null || v === undefined) return null;
              if (typeof v === 'boolean') return v ? 1 : 0;
              if (typeof v === 'bigint') return Number(v);
              if (typeof v === 'number' || typeof v === 'string' || v instanceof Uint8Array) return v;
              return String(v);
            });
            await db.runAsync(`INSERT INTO ${t} (${keys.join(',')}) VALUES (${placeholders})`, ...vals);
          }
        }
        await db.execAsync('COMMIT');
      } catch (e) {
        await db.execAsync('ROLLBACK');
        throw e;
      }
      refresh();
    },
    [refresh]
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      tick,
      refresh,
      profile,
      setDisplayName,
      completeOnboarding,
      addPoints,
      listLedger,
      listQuests,
      createQuest,
      listFoods,
      upsertFoodFromBarcode,
      createMeal,
      listMealsWithItems,
      addGymMetric,
      listGymMetrics,
      addSupplementSchedule,
      listSupplementSchedules,
      setSupplementActive,
      logDose,
      listDoseLogsForDay,
      getSettingsMap,
      setSettingsBatch,
      getAiSettings,
      setAiSettings,
      runAiMealEstimate,
      exportSnapshot,
      importSnapshot,
    }),
    [
      ready,
      tick,
      refresh,
      profile,
      setDisplayName,
      completeOnboarding,
      addPoints,
      listLedger,
      listQuests,
      createQuest,
      listFoods,
      upsertFoodFromBarcode,
      createMeal,
      listMealsWithItems,
      addGymMetric,
      listGymMetrics,
      addSupplementSchedule,
      listSupplementSchedules,
      setSupplementActive,
      logDose,
      listDoseLogsForDay,
      getSettingsMap,
      setSettingsBatch,
      getAiSettings,
      setAiSettings,
      runAiMealEstimate,
      exportSnapshot,
      importSnapshot,
    ]
  );

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const v = useContext(DatabaseContext);
  if (!v) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return v;
}
