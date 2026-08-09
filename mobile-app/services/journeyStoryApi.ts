import type { JourneyStoryPayload, JourneyStorySeed } from '@/types/journeyStory';
import { buildJourneyStory } from '@/mocks/journeyStory';
import { apiClient } from './api';

export async function generateJourneyStoryRemote(
  seed: JourneyStorySeed,
): Promise<JourneyStoryPayload> {
  const local = buildJourneyStory(seed);
  try {
    const response = await apiClient.post<{
      narrative?: string;
      travelScore?: number;
      destinationImage?: string;
    }>('/ai/journey-story', seed);
    if (response.data?.narrative) {
      return {
        ...local,
        narrative: response.data.narrative,
        travelScore: response.data.travelScore ?? local.travelScore,
        destinationImage: response.data.destinationImage || local.destinationImage,
      };
    }
  } catch {
    // local cinematic builder
  }
  return local;
}

export async function persistJourneyStoryRemote(story: JourneyStoryPayload): Promise<boolean> {
  try {
    await apiClient.post('/journey-stories', {
      externalId: story.id,
      destinationName: story.destinationName,
      originName: story.originName,
      travelScore: story.travelScore,
      distanceKm: story.statistics.distanceKm,
      travelMinutes: story.statistics.travelMinutes,
      destinationId: story.destinationId ?? null,
      totalBudgetInr: story.statistics.totalBudgetInr,
      tripDays: story.tripDays ?? null,
      narrative: story.narrative,
      payloadJson: JSON.stringify(story),
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchJourneyStoriesRemote(): Promise<JourneyStoryPayload[]> {
  try {
    const response = await apiClient.get<Array<{ payloadJson?: string; externalId?: string }>>(
      '/journey-stories',
    );
    return (response.data || [])
      .map((row) => {
        try {
          return row.payloadJson ? (JSON.parse(row.payloadJson) as JourneyStoryPayload) : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as JourneyStoryPayload[];
  } catch {
    return [];
  }
}
