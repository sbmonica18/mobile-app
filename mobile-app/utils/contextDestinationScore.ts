import type { AiContextData } from '@/components/ai-command/AiContextMemory';
import { mockDestinations, type Destination } from '@/mocks/destinations';

function parseTravelMinutes(travelTime: string): number {
  const h = travelTime.match(/(\d+)\s*h/);
  const m = travelTime.match(/(\d+)\s*m/);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

function parseBudgetCeil(budgetLabel: string): number | null {
  const digits = budgetLabel.replace(/[^\d]/g, '');
  if (!digits) return null;
  return parseInt(digits, 10);
}

/**
 * Pulse-style context scoring — shared by Home Pulse and AI Insights.
 * Higher = better match for current weather + timing + budget + company.
 */
export function scoreDestinationForContext(
  d: Destination,
  context: Partial<AiContextData> & { weatherDesc?: string },
): number {
  const hour = new Date().getHours();
  const weatherDesc = context.weatherDesc || context.weather;
  const timing = (context.timing || '').toLowerCase();
  const company = (context.company || '').toLowerCase();
  const vehicle = (context.vehicle || '').toLowerCase();
  const isWeekend = timing.includes('weekend') || [0, 6].includes(new Date().getDay());

  let score = d.matchScore * 0.45;
  score += Math.max(0, 40 - d.aqi) * 0.6;
  const mins = parseTravelMinutes(d.travelTime);
  score += Math.max(0, 25 - mins / 20);

  const w = (weatherDesc || d.weather || '').toLowerCase();
  if (/clear|sunny|pleasant|cool|mist/.test(w)) score += 8;
  if (/rain|storm|heavy|shower/.test(w)) {
    if (d.categories.some((c) => /rainy|coffee|cafe|forest/.test(c))) score += 6;
    else score -= 4;
  }

  const isDay = hour >= 6 && hour < 18;
  if (isDay && /photo|views|scenic|sunset/.test(d.categories.join(' '))) score += 4;
  if (!isDay && /cafe|culture|food/.test(d.categories.join(' '))) score += 3;

  if (isWeekend && d.timeFits.some((t) => /multi|one day|weekend|half/i.test(t))) score += 5;
  if (timing.includes('half') && d.timeFits.includes('Half Day')) score += 8;
  if (timing.includes('2 hour') && d.timeFits.includes('2 Hours')) score += 8;
  if (timing.includes('multi') && d.timeFits.includes('Multi-day')) score += 6;

  if (company) {
    const styleHit = d.styles.some((s) => s.toLowerCase() === company || s.toLowerCase().includes(company));
    if (styleHit) score += 10;
    if (company.includes('couple') && d.styles.includes('Couple')) score += 4;
    if (company.includes('family') && d.styles.includes('Family')) score += 4;
    if (company.includes('friend') && d.styles.includes('Friends')) score += 4;
  }

  const budgetCeil = context.budget ? parseBudgetCeil(context.budget) : null;
  if (budgetCeil != null) {
    const destBudget = parseInt(d.budgetEstimate.replace(/\D/g, ''), 10) || 0;
    if (destBudget <= budgetCeil) score += 8;
    else score -= 6;
  }

  if (vehicle.includes('bike') && mins <= 300) score += 4;
  if (vehicle.includes('car') && d.categories.includes('drive')) score += 3;
  if (vehicle.includes('walk') && mins <= 90) score += 5;

  return Math.round(Math.max(55, Math.min(98, score)));
}

export function pickInsightsForContext(
  context: Partial<AiContextData> & { weatherDesc?: string },
  limit = 5,
): Array<Destination & { contextScore: number }> {
  return [...mockDestinations]
    .map((d) => ({
      ...d,
      contextScore: scoreDestinationForContext(d, context),
      matchScore: scoreDestinationForContext(d, context),
    }))
    .sort((a, b) => b.contextScore - a.contextScore)
    .slice(0, limit);
}
