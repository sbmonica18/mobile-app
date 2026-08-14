import {
  buildDestinationPulse,
  buildEvents,
  buildIdealPlan,
  buildImpactFromEvents,
  buildSignals,
  buildWhatChanged,
  buildWhy,
} from './intelligenceEngine';
import type { IntelligenceEngineInput, IntelligenceSnapshot } from './intelligenceTypes';

export function runIntelligenceEngine(input: IntelligenceEngineInput): IntelligenceSnapshot {
  const now = input.now ?? new Date();
  const signals = buildSignals({ ...input, now });
  const events = buildEvents({ ...input, now }, signals);
  const available = signals.filter((s) => s.status !== 'unavailable').length;
  const opportunities = events.filter((e) => e.type === 'OPPORTUNITY' || e.action === 'GO_NOW');
  const primary = events.find((e) => e.priority === 'HIGH' || e.priority === 'CRITICAL') ?? events[0];
  const highCount = events.filter((e) => e.priority === 'HIGH' || e.priority === 'CRITICAL').length;

  let headline = 'Area looks steady right now';
  if (highCount > 0) headline = `${highCount} thing${highCount > 1 ? 's' : ''} need your attention`;
  else if (events.length > 0) headline = `${Math.min(events.length, 3)} intelligence updates nearby`;

  return {
    updatedAt: now.toISOString(),
    areaLabel: input.areaLabel || 'Your area',
    signalsAnalyzed: available,
    signals,
    events,
    opportunities,
    headline,
    primaryEventId: primary?.id ?? null,
    why: buildWhy({ ...input, now }),
    idealPlan: buildIdealPlan({ ...input, now }),
    pulse: input.destination ? buildDestinationPulse({ ...input, now }) : null,
    whatChanged: buildWhatChanged({ ...input, now }, input.priorSnapshot),
    impact: buildImpactFromEvents(events),
  };
}
