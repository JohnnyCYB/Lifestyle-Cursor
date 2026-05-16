import * as FileSystem from 'expo-file-system';

export type AiSettings = {
  enabled: boolean;
  apiBase: string;
  apiKey: string;
  model: string;
  monthlyUsdCap: number;
  usageUsdMonth: number;
  usageMonthKey: string;
};

const monthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export function parseAiSettings(raw: Record<string, string>): AiSettings {
  const mk = monthKey();
  const storedMonth = raw.ai_usage_month_key || mk;
  let usageUsd = Number(raw.ai_usage_usd_month || '0');
  if (storedMonth !== mk) {
    usageUsd = 0;
  }
  return {
    enabled: raw.ai_enabled === '1',
    apiBase: (raw.ai_api_base || 'https://api.openai.com/v1').replace(/\/$/, ''),
    apiKey: raw.ai_api_key || '',
    model: raw.ai_model || 'gpt-4o-mini',
    monthlyUsdCap: Math.max(0, Number(raw.ai_monthly_usd_cap || '5')),
    usageUsdMonth: usageUsd,
    usageMonthKey: mk,
  };
}

/** Rough cost estimate per 1k tokens (override via settings if needed). */
const DEFAULT_USD_PER_1K = 0.00015;

/**
 * Optional vision estimate. Requires user-supplied API key; not used in $0 MVP by default.
 * Returns structured guess or throws with a helpful message.
 */
export async function estimateMealFromPhoto(params: {
  imageUri: string;
  settings: AiSettings;
  estimatedCostUsd?: number;
}): Promise<{ description: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number }> {
  const { imageUri, settings } = params;
  if (!settings.enabled) {
    throw new Error('Enable AI in Settings and add an API key.');
  }
  if (!settings.apiKey) {
    throw new Error('Add an API key in Settings.');
  }
  const mk = monthKey();
  let usage = settings.usageUsdMonth;
  if (settings.usageMonthKey !== mk) {
    usage = 0;
  }
  const est = params.estimatedCostUsd ?? 0.003;
  if (settings.monthlyUsdCap > 0 && usage + est > settings.monthlyUsdCap) {
    throw new Error('Monthly AI budget cap reached. Raise the cap or wait until next month.');
  }

  const raw = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
  const mime = imageUri.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';

  const body = {
    model: settings.model,
    messages: [
      {
        role: 'user' as const,
        content: [
          {
            type: 'text',
            text:
              'Estimate this meal for a food log. Reply ONLY valid JSON with keys: description (string), kcal (number), protein_g, carbs_g, fat_g. Use reasonable guesses if uncertain.',
          },
          {
            type: 'image_url',
            image_url: { url: `data:${mime};base64,${raw}` },
          },
        ],
      },
    ],
    max_tokens: 300,
  };

  const url = `${settings.apiBase}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as { error?: { message?: string } })?.error?.message || res.statusText;
    throw new Error(msg || 'AI request failed');
  }
  const text =
    (json as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content || '';
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('AI response was not JSON');
  }
  const parsed = JSON.parse(text.slice(start, end + 1)) as {
    description?: string;
    kcal?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  };
  return {
    description: String(parsed.description || 'Meal'),
    kcal: Number(parsed.kcal ?? 0),
    protein_g: Number(parsed.protein_g ?? 0),
    carbs_g: Number(parsed.carbs_g ?? 0),
    fat_g: Number(parsed.fat_g ?? 0),
  };
}

export function bumpAiUsageUsd(current: AiSettings, usageUsdDelta: number): AiSettings {
  const mk = monthKey();
  let usage = current.usageUsdMonth;
  if (current.usageMonthKey !== mk) {
    usage = 0;
  }
  return {
    ...current,
    usageUsdMonth: usage + usageUsdDelta,
    usageMonthKey: mk,
  };
}

export function estimateTokensToUsd(tokens: number): number {
  return (tokens / 1000) * DEFAULT_USD_PER_1K;
}
