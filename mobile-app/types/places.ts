export type PlaceResult = {
  placeKey: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  query?: string;
};

export type PlaceItem = PlaceResult & {
  id: string;
  timestamp?: string;
};

export type WeatherInfo = {
  temperatureC: number;
  humidity: number;
  windKph: number;
  description: string;
  code: number;
  /** US AQI when available from Open-Meteo air-quality API. */
  aqi?: number;
  uvIndex?: number;
  /** Precipitation probability 0–100 for the current hour. */
  rainProbability?: number;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
  label: string;
  address: string;
};
