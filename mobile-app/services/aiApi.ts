import { apiClient } from './api';

export type AiDecisionResponse = {
  recommendationScore: number;
  weatherRating: number;
  aqiRating: number;
  trafficRating: number;
  crowdRating: number;
  budgetRating: number;
  roadConditionsRating: number;
  reason: string;
  brief: string;
  averageBudget: number;
  bestTime: string;
  travelTime: string;
};

export type AiPlannerResponse = {
  placeName: string;
  description: string;
  matchScore: number;
  distance: string;
  budget: string;
  weather: string;
  reasons: string[];
};

export type CompanionAlert = {
  title: string;
  detail: string;
  type: string;
};

export type RouteStory = {
  title: string;
  distance: string;
  story: string;
};

export type AiCompanionResponse = {
  alerts: CompanionAlert[];
  routeStories: RouteStory[];
};

export async function getAiDecision(placeName: string, purpose?: string): Promise<AiDecisionResponse> {
  const params = new URLSearchParams();
  params.append('placeName', placeName);
  if (purpose) params.append('purpose', purpose);
  
  const response = await apiClient.get(`/ai/decision?${params.toString()}`);
  return response.data;
}

export async function getAiPlanner(prompt: string): Promise<AiPlannerResponse[]> {
  const response = await apiClient.post('/ai/planner', { prompt });
  return response.data;
}

export async function getAiJourneyCompanion(placeName: string, latitude: number, longitude: number): Promise<AiCompanionResponse> {
  const params = new URLSearchParams();
  params.append('placeName', placeName);
  params.append('latitude', latitude.toString());
  params.append('longitude', longitude.toString());
  
  const response = await apiClient.get(`/ai/journey-companion?${params.toString()}`);
  return response.data;
}
