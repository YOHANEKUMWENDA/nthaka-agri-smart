import { type District } from "./malawi-districts";
import { CROP_STATISTICS, MALAWI_CROP_MAP } from "./crop-dataset";
import { type FertilizerAdjustment, type SoilAlert, type ApplicationStep } from "./fertilizer-adjuster";
import { supabase } from "@/integrations/supabase/client";

export interface SoilInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  temperature: number;
  organicMatter: number;
  district: District;
}

export interface CropRecommendation {
  crop: string;
  score: number;
  confidence: number;
  reason: string;
  season: string;
  emoji: string;
}

export interface FertilizerPlan {
  type: string;
  applicationRate: string;
  timing: string;
  notes: string;
}

export interface Recommendation {
  crops: CropRecommendation[];
  fertilizers: FertilizerPlan[];
  forecastedRainfall: number;
  rainfallCategory: string;
  rainfallBand: string;
  rainfallBandDescription: string;
  soilAssessment: string;
  soilAlerts: SoilAlert[];
  fertilizerAdjustment: FertilizerAdjustment | null;
  mlPrediction: {
    crop: string;
    confidence: number;
    alternatives: { crop: string; confidence: number }[];
    algorithm: string;
  } | null;
}

// Keep old CROP_PROFILES export for backward compat
export const CROP_PROFILES = CROP_STATISTICS.map(c => ({
  name: MALAWI_CROP_MAP[c.label] || c.label,
  emoji: c.emoji,
  season: c.season,
  nRange: [c.features.N.mean - c.features.N.std, c.features.N.mean + c.features.N.std] as [number, number],
  pRange: [c.features.P.mean - c.features.P.std, c.features.P.mean + c.features.P.std] as [number, number],
  kRange: [c.features.K.mean - c.features.K.std, c.features.K.mean + c.features.K.std] as [number, number],
  phRange: [c.features.ph.mean - c.features.ph.std, c.features.ph.mean + c.features.ph.std] as [number, number],
  moistureRange: [c.features.humidity.mean - c.features.humidity.std, c.features.humidity.mean + c.features.humidity.std] as [number, number],
  tempRange: [c.features.temperature.mean - c.features.temperature.std, c.features.temperature.mean + c.features.temperature.std] as [number, number],
  rainfallRange: [c.features.rainfall.mean - c.features.rainfall.std, c.features.rainfall.mean + c.features.rainfall.std] as [number, number],
  rainfallPreference: ["Moderate"] as ("Low" | "Moderate" | "High")[],
}));

/**
 * Call the server-side recommend edge function
 */
export async function generateRecommendations(input: SoilInput): Promise<Recommendation> {
  const { data, error } = await supabase.functions.invoke("recommend", {
    body: {
      nitrogen: input.nitrogen,
      phosphorus: input.phosphorus,
      potassium: input.potassium,
      ph: input.ph,
      moisture: input.moisture,
      temperature: input.temperature,
      organicMatter: input.organicMatter,
      districtName: input.district.name,
    },
  });

  if (error) {
    throw new Error(`Recommendation failed: ${error.message}`);
  }

  return data as Recommendation;
}
