export const MIGRATIONS: { id: number; sql: string }[] = [
  {
    id: 1,
    sql: `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Hero',
  total_points INTEGER NOT NULL DEFAULT 0,
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS point_ledger (
  id TEXT PRIMARY KEY NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  quest_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  points INTEGER NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  kcal REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  serving_label TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY NOT NULL,
  logged_at TEXT NOT NULL,
  day_key TEXT NOT NULL,
  meal_type TEXT,
  notes TEXT,
  photo_uri TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_items (
  id TEXT PRIMARY KEY NOT NULL,
  meal_id TEXT NOT NULL,
  food_id TEXT,
  food_name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  kcal REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS gym_metrics (
  id TEXT PRIMARY KEY NOT NULL,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  logged_at TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS supplement_schedules (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  times_of_day TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dose_logs (
  id TEXT PRIMARY KEY NOT NULL,
  schedule_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  slot TEXT NOT NULL,
  status TEXT NOT NULL,
  logged_at TEXT NOT NULL,
  FOREIGN KEY (schedule_id) REFERENCES supplement_schedules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_point_ledger_created ON point_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_meals_day_key ON meals(day_key);
CREATE INDEX IF NOT EXISTS idx_gym_logged ON gym_metrics(logged_at);
CREATE INDEX IF NOT EXISTS idx_dose_day ON dose_logs(day_key);
`,
  },
];
