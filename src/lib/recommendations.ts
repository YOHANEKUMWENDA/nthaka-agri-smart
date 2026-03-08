import { type District, forecastRainfall } from "./malawi-districts";
import { predictCrop, CROP_STATISTICS, MALAWI_CROP_MAP } from "./crop-dataset";
import { adjustForRainfall, getSoilAlerts, type FertilizerAdjustment, type SoilAlert, type ApplicationStep } from "./fertilizer-adjuster";
import { getStationForDistrict, forecastEWMA, getRainfallBand, getBandDescription } from "./rainfall-data";

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

function assessSoil(input: SoilInput): string {
  const parts: string[] = [];
  if (input.nitrogen < 20) parts.push("very low nitrogen — apply Urea or CAN urgently");
  else if (input.nitrogen < 40) parts.push("low nitrogen");
  else if (input.nitrogen > 100) parts.push("high nitrogen");
  if (input.phosphorus < 10) parts.push("very low phosphorus — apply TSP or DAP");
  else if (input.phosphorus < 20) parts.push("low phosphorus");
  if (input.potassium < 20) parts.push("low potassium");
  if (input.ph < 5.5) parts.push("acidic soil (add lime 4–6 weeks before planting)");
  else if (input.ph > 8.0) parts.push("alkaline soil (add sulphur)");
  else if (input.ph < 6.0) parts.push("slightly acidic soil");
  if (input.organicMatter < 1) parts.push("very low organic matter — add compost urgently");
  else if (input.organicMatter < 2) parts.push("low organic matter");
  if (input.moisture < 25) parts.push("dry soil conditions");
  else if (input.moisture > 80) parts.push("waterlogged soil — improve drainage");
  if (parts.length === 0) return "Soil conditions are generally favorable for most crops.";
  return `Notable conditions: ${parts.join("; ")}. Recommendations have been adjusted accordingly.`;
}

function generateFertilizerPlan(input: SoilInput, rainfallCat: string): FertilizerPlan[] {
  const plans: FertilizerPlan[] = [];
  const rainfallAdj = rainfallCat === "High" || rainfallCat === "Very High"
    ? "Split application recommended to reduce leaching."
    : rainfallCat === "Low" || rainfallCat === "Very Low"
      ? "Apply near root zone. Use micro-dosing if possible."
      : "";

  if (input.nitrogen < 60) {
    plans.push({
      type: "Urea (46-0-0)",
      applicationRate: `${Math.round((60 - input.nitrogen) * 2.2)} kg/ha`,
      timing: "Basal + top-dress at 4–6 weeks",
      notes: `Nitrogen deficient soil. ${rainfallAdj}`,
    });
  }
  if (input.phosphorus < 30) {
    plans.push({
      type: "TSP (0-46-0)",
      applicationRate: `${Math.round((30 - input.phosphorus) * 2.5)} kg/ha`,
      timing: "Basal application at planting",
      notes: "Phosphorus boost for root development.",
    });
  }
  if (input.potassium < 30) {
    plans.push({
      type: "MOP (0-0-60)",
      applicationRate: `${Math.round((30 - input.potassium) * 1.8)} kg/ha`,
      timing: "Basal application at planting",
      notes: "Potassium for disease resistance and crop quality.",
    });
  }
  if (input.nitrogen >= 60 && input.phosphorus >= 30 && input.potassium >= 30) {
    plans.push({
      type: "NPK 23:21:0 + 4S (Maintenance)",
      applicationRate: "100 kg/ha",
      timing: "Basal at planting",
      notes: "Soil nutrients adequate. Maintenance dose recommended.",
    });
  }
  if (input.organicMatter < 2) {
    plans.push({
      type: "Compost / Manure",
      applicationRate: "5–10 tonnes/ha",
      timing: "2–4 weeks before planting",
      notes: "Low organic matter. Improve soil structure and water retention.",
    });
  }
  if (input.ph < 5.5) {
    plans.push({
      type: "Agricultural Lime",
      applicationRate: `${Math.round((5.5 - input.ph) * 2000)} kg/ha`,
      timing: "4–6 weeks before planting",
      notes: "Correct soil acidity for better nutrient availability.",
    });
  }
  return plans;
}

export function generateRecommendations(input: SoilInput): Recommendation {
  // Use real station data if available, otherwise fallback to district avg
  const station = getStationForDistrict(input.district.name);
  let forecastedRainfall: number;
  let confidence: number;

  if (station) {
    const values = Object.values(station.annualRainfall).sort();
    const result = forecastEWMA(values);
    forecastedRainfall = result.predicted;
    confidence = result.confidence;
  } else {
    forecastedRainfall = forecastRainfall(input.district.avgRainfallMm);
    confidence = 70;
  }

  const rainfallBand = getRainfallBand(forecastedRainfall);
  const rainfallCategory = forecastedRainfall < 800 ? "Low" : forecastedRainfall > 1100 ? "High" : "Moderate";

  // ML-style prediction using Gaussian Naive Bayes on dataset statistics
  const mlResult = predictCrop(
    input.nitrogen,
    input.phosphorus,
    input.potassium,
    input.temperature,
    input.moisture, // humidity equivalent
    input.ph,
    forecastedRainfall
  );

  // Build crop recommendations from ML prediction
  const allPredictions = [
    { crop: mlResult.crop, confidence: mlResult.confidence },
    ...mlResult.alternatives
  ];

  const cropStats = CROP_STATISTICS;
  const crops: CropRecommendation[] = allPredictions.slice(0, 5).map((pred, i) => {
    const stat = cropStats.find(c => (MALAWI_CROP_MAP[c.label] || c.label) === pred.crop);
    return {
      crop: pred.crop,
      score: Math.max(10, Math.round(95 - i * 12 - (100 - pred.confidence) * 0.3)),
      confidence: pred.confidence,
      reason: `ML prediction based on soil (N:${input.nitrogen}, P:${input.phosphorus}, K:${input.potassium}, pH:${input.ph}) and ${rainfallBand} rainfall (${forecastedRainfall}mm) in ${input.district.name}.`,
      season: stat?.season || "Oct–Apr",
      emoji: stat?.emoji || "🌱",
    };
  });

  // Rainfall-adjusted fertilizer plan for top crop
  const topCrop = mlResult.crop;
  const fertAdjustment = adjustForRainfall(forecastedRainfall, topCrop);

  // Soil alerts
  const soilAlerts = getSoilAlerts(
    input.nitrogen, input.phosphorus, input.potassium, input.ph, forecastedRainfall
  );

  return {
    crops,
    fertilizers: generateFertilizerPlan(input, rainfallCategory),
    forecastedRainfall,
    rainfallCategory,
    rainfallBand,
    rainfallBandDescription: getBandDescription(forecastedRainfall),
    soilAssessment: assessSoil(input),
    soilAlerts,
    fertilizerAdjustment: fertAdjustment,
    mlPrediction: {
      crop: mlResult.crop,
      confidence: mlResult.confidence,
      alternatives: mlResult.alternatives,
      algorithm: "Gaussian Naive Bayes (dataset-trained)",
    },
  };
}
