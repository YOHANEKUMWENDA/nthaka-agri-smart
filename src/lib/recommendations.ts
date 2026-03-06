import { type District, forecastRainfall } from "./malawi-districts";

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
  score: number; // 0-100 suitability score
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
  soilAssessment: string;
}

interface CropProfile {
  name: string;
  emoji: string;
  season: string;
  nRange: [number, number];
  pRange: [number, number];
  kRange: [number, number];
  phRange: [number, number];
  moistureRange: [number, number];
  tempRange: [number, number];
  rainfallPreference: ("Low" | "Moderate" | "High")[];
}

export const CROP_PROFILES: (CropProfile & { rainfallRange: [number, number] })[] = [
  { name: "Maize", emoji: "🌽", season: "Oct–Apr", nRange: [60, 120], pRange: [30, 60], kRange: [30, 60], phRange: [5.5, 7.5], moistureRange: [40, 70], tempRange: [18, 32], rainfallPreference: ["Moderate", "High"] },
  { name: "Rice", emoji: "🍚", season: "Nov–May", nRange: [80, 140], pRange: [20, 50], kRange: [20, 50], phRange: [5.0, 7.0], moistureRange: [60, 90], tempRange: [20, 35], rainfallPreference: ["High"] },
  { name: "Groundnuts", emoji: "🥜", season: "Nov–Apr", nRange: [10, 40], pRange: [30, 60], kRange: [20, 50], phRange: [5.5, 7.0], moistureRange: [30, 60], tempRange: [20, 30], rainfallPreference: ["Moderate"] },
  { name: "Tobacco", emoji: "🍂", season: "Oct–Mar", nRange: [40, 80], pRange: [20, 50], kRange: [40, 80], phRange: [5.5, 6.8], moistureRange: [35, 65], tempRange: [18, 30], rainfallPreference: ["Moderate"] },
  { name: "Soybeans", emoji: "🫘", season: "Nov–Apr", nRange: [10, 30], pRange: [30, 60], kRange: [20, 50], phRange: [6.0, 7.0], moistureRange: [40, 65], tempRange: [20, 30], rainfallPreference: ["Moderate"] },
  { name: "Cassava", emoji: "🥔", season: "Oct–Jul", nRange: [20, 60], pRange: [10, 40], kRange: [30, 70], phRange: [5.0, 6.5], moistureRange: [30, 60], tempRange: [22, 35], rainfallPreference: ["Low", "Moderate"] },
  { name: "Sweet Potato", emoji: "🍠", season: "Oct–May", nRange: [20, 50], pRange: [20, 50], kRange: [40, 80], phRange: [5.5, 6.8], moistureRange: [35, 65], tempRange: [20, 30], rainfallPreference: ["Moderate"] },
  { name: "Cotton", emoji: "☁️", season: "Nov–May", nRange: [40, 80], pRange: [20, 40], kRange: [20, 40], phRange: [5.5, 7.5], moistureRange: [35, 60], tempRange: [20, 35], rainfallPreference: ["Low", "Moderate"] },
  { name: "Sorghum", emoji: "🌾", season: "Nov–Apr", nRange: [30, 70], pRange: [20, 40], kRange: [15, 40], phRange: [5.5, 8.0], moistureRange: [25, 55], tempRange: [22, 35], rainfallPreference: ["Low", "Moderate"] },
  { name: "Millet", emoji: "🌾", season: "Nov–Mar", nRange: [20, 50], pRange: [15, 35], kRange: [15, 35], phRange: [5.0, 7.5], moistureRange: [20, 50], tempRange: [22, 35], rainfallPreference: ["Low"] },
  { name: "Beans", emoji: "🫘", season: "Nov–Mar", nRange: [10, 30], pRange: [30, 60], kRange: [20, 50], phRange: [6.0, 7.5], moistureRange: [40, 65], tempRange: [18, 28], rainfallPreference: ["Moderate"] },
  { name: "Pigeon Peas", emoji: "🌿", season: "Nov–Jul", nRange: [10, 30], pRange: [20, 50], kRange: [15, 40], phRange: [5.0, 7.0], moistureRange: [25, 55], tempRange: [20, 35], rainfallPreference: ["Low", "Moderate"] },
  { name: "Sunflower", emoji: "🌻", season: "Nov–Apr", nRange: [40, 80], pRange: [20, 40], kRange: [20, 40], phRange: [6.0, 7.5], moistureRange: [30, 55], tempRange: [20, 30], rainfallPreference: ["Moderate"] },
  { name: "Tea", emoji: "🍵", season: "Year-round", nRange: [60, 120], pRange: [15, 40], kRange: [30, 60], phRange: [4.5, 5.8], moistureRange: [60, 85], tempRange: [15, 25], rainfallPreference: ["High"] },
  { name: "Sugarcane", emoji: "🎋", season: "Year-round", nRange: [80, 150], pRange: [20, 50], kRange: [40, 80], phRange: [5.5, 7.5], moistureRange: [50, 80], tempRange: [22, 35], rainfallPreference: ["High"] },
];

function scoreCrop(crop: CropProfile, input: SoilInput, rainfallCat: string): number {
  let score = 100;
  const penalty = (val: number, [min, max]: [number, number]) => {
    if (val < min) return Math.min(30, (min - val) / min * 50);
    if (val > max) return Math.min(30, (val - max) / max * 50);
    return 0;
  };
  score -= penalty(input.nitrogen, crop.nRange);
  score -= penalty(input.phosphorus, crop.pRange);
  score -= penalty(input.potassium, crop.kRange);
  score -= penalty(input.ph, crop.phRange) * 1.5;
  score -= penalty(input.moisture, crop.moistureRange);
  score -= penalty(input.temperature, crop.tempRange);
  if (!crop.rainfallPreference.includes(rainfallCat as any)) score -= 15;
  return Math.max(0, Math.round(score));
}

function assessSoil(input: SoilInput): string {
  const parts: string[] = [];
  if (input.nitrogen < 30) parts.push("low nitrogen");
  else if (input.nitrogen > 100) parts.push("high nitrogen");
  if (input.phosphorus < 15) parts.push("low phosphorus");
  if (input.potassium < 20) parts.push("low potassium");
  if (input.ph < 5.5) parts.push("acidic soil");
  else if (input.ph > 7.5) parts.push("alkaline soil");
  if (input.organicMatter < 2) parts.push("low organic matter");
  if (parts.length === 0) return "Soil conditions are generally favorable for most crops.";
  return `Notable conditions: ${parts.join(", ")}. Recommendations have been adjusted accordingly.`;
}

function generateFertilizerPlan(input: SoilInput, rainfallCat: string): FertilizerPlan[] {
  const plans: FertilizerPlan[] = [];
  const rainfallAdj = rainfallCat === "High" ? "Split application recommended to reduce leaching." : rainfallCat === "Low" ? "Apply near root zone with irrigation." : "";

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
  const forecastedRainfall = forecastRainfall(input.district.avgRainfallMm);
  const rainfallCategory = forecastedRainfall < 800 ? "Low" : forecastedRainfall > 1100 ? "High" : "Moderate";

  const scoredCrops = CROP_PROFILES.map(crop => ({
    crop: crop.name,
    score: scoreCrop(crop, input, rainfallCategory),
    reason: `Suitability based on your soil (N:${input.nitrogen}, P:${input.phosphorus}, K:${input.potassium}, pH:${input.ph}) and ${rainfallCategory.toLowerCase()} rainfall in ${input.district.name}.`,
    season: crop.season,
    emoji: crop.emoji,
  })).sort((a, b) => b.score - a.score);

  return {
    crops: scoredCrops.slice(0, 5),
    fertilizers: generateFertilizerPlan(input, rainfallCategory),
    forecastedRainfall,
    rainfallCategory,
    soilAssessment: assessSoil(input),
  };
}
