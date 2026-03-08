import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Station Data ──
const STATION_DATA = [
  { station: "Chitipa Aerodrome", district: "Chitipa", region: "Northern", annualRainfall: { 2010: 912, 2011: 1168, 2012: 919, 2013: 1093, 2014: 865, 2015: 669, 2016: 715, 2017: 1048, 2018: 998, 2019: 1005, 2020: 1065 } },
  { station: "Karonga Aerodrome", district: "Karonga", region: "Northern", annualRainfall: { 2010: 1682, 2011: 1151, 2012: 1516, 2013: 2043, 2014: 1839, 2015: 1166, 2016: 1529, 2017: 1338, 2018: 1910, 2019: 1117, 2020: 1358 } },
  { station: "Nkhata Bay Mkondezi", district: "Nkhata Bay", region: "Northern", annualRainfall: { 2010: 780, 2011: 501, 2012: 721, 2013: 728, 2014: 670, 2015: 591, 2016: 792, 2017: 584, 2018: 564, 2019: 638, 2020: 445 } },
  { station: "Rumphi Bolero", district: "Rumphi", region: "Northern", annualRainfall: { 2010: 1264, 2011: 987, 2012: 1017, 2013: 1112, 2014: 1481, 2015: 1335, 2016: 1375, 2017: 821, 2018: 1094, 2019: 894, 2020: 823 } },
  { station: "Mzuzu Airport", district: "Mzimba", region: "Northern", annualRainfall: { 2010: 621, 2011: 790, 2012: 720, 2013: 565, 2014: 1091, 2015: 734, 2016: 862, 2017: 666, 2018: 946, 2019: 883, 2020: 892 } },
  { station: "Kasungu Met", district: "Kasungu", region: "Central", annualRainfall: { 2010: 1045, 2011: 1019, 2012: 701, 2013: 684, 2014: 745, 2015: 787, 2016: 729, 2017: 997, 2018: 1065, 2019: 1096, 2020: 747 } },
  { station: "Nkhotakota Met", district: "Nkhotakota", region: "Central", annualRainfall: { 2010: 858, 2011: 679, 2012: 821, 2013: 650, 2014: 727, 2015: 541, 2016: 583, 2017: 900, 2018: 729, 2019: 897, 2020: 826 } },
  { station: "Ntchisi Agric", district: "Ntchisi", region: "Central", annualRainfall: { 2010: 1226, 2011: 1105, 2012: 1118, 2013: 727, 2014: 987, 2015: 1337, 2016: 573, 2017: 1329, 2018: 1480, 2019: 905, 2020: 818 } },
  { station: "Dowa Agric", district: "Dowa", region: "Central", annualRainfall: { 2010: 946, 2011: 733, 2012: 865, 2013: 884, 2014: 738, 2015: 604, 2016: 647, 2017: 984, 2018: 777, 2019: 819, 2020: 733 } },
  { station: "Salima Airport", district: "Salima", region: "Central", annualRainfall: { 2010: 1005, 2011: 976, 2012: 1191, 2013: 710, 2014: 743, 2015: 822, 2016: 726, 2017: 1703, 2018: 1258, 2019: 1482, 2020: 1202 } },
  { station: "Chitedze Met", district: "Lilongwe", region: "Central", annualRainfall: { 2010: 1010, 2011: 806, 2012: 1143, 2013: 886, 2014: 972, 2015: 820, 2016: 708, 2017: 1029, 2018: 899, 2019: 1160, 2020: 798 } },
  { station: "Mchinji Boma", district: "Mchinji", region: "Central", annualRainfall: { 2010: 1059, 2011: 1099, 2012: 1044, 2013: 1031, 2014: 655, 2015: 720, 2016: 817, 2017: 1038, 2018: 1141, 2019: 1273, 2020: 935 } },
  { station: "Dedza Met", district: "Dedza", region: "Central", annualRainfall: { 2010: 854, 2011: 686, 2012: 851, 2013: 809, 2014: 923, 2015: 1133, 2016: 694, 2017: 980, 2018: 640, 2019: 1048, 2020: 642 } },
  { station: "Nkhande Agric", district: "Ntcheu", region: "Central", annualRainfall: { 2010: 878, 2011: 721, 2012: 876, 2013: 770, 2014: 832, 2015: 557, 2016: 347, 2017: 551, 2018: 761, 2019: 705, 2020: 659 } },
  { station: "Mangochi Aerodrome", district: "Mangochi", region: "Southern", annualRainfall: { 2010: 1305, 2011: 1287, 2012: 904, 2013: 1319, 2014: 1050, 2015: 1325, 2016: 729, 2017: 1109, 2018: 634, 2019: 1070, 2020: 1029 } },
  { station: "Balaka Town", district: "Balaka", region: "Southern", annualRainfall: { 2010: 906, 2011: 862, 2012: 883, 2013: 770, 2014: 767, 2015: 1611, 2016: 678, 2017: 837, 2018: 843, 2019: 1165, 2020: 1036 } },
  { station: "Chancellor College", district: "Zomba", region: "Southern", annualRainfall: { 2010: 839, 2011: 977, 2012: 755, 2013: 936, 2014: 620, 2015: 889, 2016: 601, 2017: 619, 2018: 1032, 2019: 1131, 2020: 692 } },
  { station: "Chiradzulu Mombezi", district: "Chiradzulu", region: "Southern", annualRainfall: { 2010: 940, 2011: 821, 2012: 1065, 2013: 1133, 2014: 939, 2015: 839, 2016: 684, 2017: 953, 2018: 1076, 2019: 1250, 2020: 742 } },
  { station: "Chileka Airport", district: "Blantyre", region: "Southern", annualRainfall: { 2010: 1206, 2011: 1184, 2012: 1244, 2013: 1212, 2014: 1285, 2015: 867, 2016: 880, 2017: 1394, 2018: 1036, 2019: 1384, 2020: 911 } },
  { station: "Mwanza Boma", district: "Mwanza", region: "Southern", annualRainfall: { 2010: 1800, 2011: 1768, 2012: 2535, 2013: 2411, 2014: 2415, 2015: 1395, 2016: 1686, 2017: 3228, 2018: 2781, 2019: 2335, 2020: 1633 } },
  { station: "Thyolo Met", district: "Thyolo", region: "Southern", annualRainfall: { 2010: 527, 2011: 593, 2012: 653, 2013: 780, 2014: 753, 2015: 1188, 2016: 555, 2017: 848, 2018: 619, 2019: 852, 2020: 484 } },
  { station: "Mulanje Mimosa", district: "Mulanje", region: "Southern", annualRainfall: { 2010: 802, 2011: 717, 2012: 735, 2013: 1045, 2014: 764, 2015: 1910, 2016: 554, 2017: 746, 2018: 742, 2019: 981, 2020: 558 } },
  { station: "Nsanje Boma", district: "Nsanje", region: "Southern", annualRainfall: { 2010: 440, 2011: 376, 2012: 334, 2013: 464, 2014: 466, 2015: 823, 2016: 725, 2017: 862, 2018: 954, 2019: 1122, 2020: 631 } },
];

const DISTRICT_DEFAULTS: Record<string, number> = {
  "Chitipa": 1100, "Karonga": 950, "Likoma": 1050, "Mzimba": 900, "Nkhata Bay": 1400, "Rumphi": 850,
  "Dedza": 1000, "Dowa": 850, "Kasungu": 800, "Lilongwe": 850, "Mchinji": 900, "Nkhotakota": 1300,
  "Ntcheu": 950, "Ntchisi": 1000, "Salima": 900,
  "Balaka": 800, "Blantyre": 1100, "Chikwawa": 700, "Chiradzulu": 1050, "Machinga": 850,
  "Mangochi": 800, "Mulanje": 1600, "Mwanza": 750, "Neno": 900, "Nsanje": 700,
  "Phalombe": 1200, "Thyolo": 1300, "Zomba": 1100,
};

function forecastEWMA(historicalValues: number[], alpha = 0.3) {
  if (historicalValues.length < 3) {
    const avg = historicalValues.reduce((s, v) => s + v, 0) / historicalValues.length;
    return { predicted: Math.round(avg), confidence: 50 };
  }
  let ewma = historicalValues[0];
  const ewmaValues = [ewma];
  for (let i = 1; i < historicalValues.length; i++) {
    ewma = alpha * historicalValues[i] + (1 - alpha) * ewma;
    ewmaValues.push(ewma);
  }
  const lastEwma = ewmaValues[ewmaValues.length - 1];
  const thirdLastEwma = ewmaValues[ewmaValues.length - 3] ?? ewmaValues[0];
  const trend = lastEwma - thirdLastEwma;
  let forecast = lastEwma + trend * 0.5;
  forecast = Math.max(200, Math.round(forecast));
  const mean = historicalValues.reduce((s, v) => s + v, 0) / historicalValues.length;
  const variance = historicalValues.reduce((s, v) => s + (v - mean) ** 2, 0) / historicalValues.length;
  const cv = Math.sqrt(variance) / mean;
  return { predicted: forecast, confidence: Math.max(50, Math.round(100 - cv * 100)) };
}

function getRainfallBand(mm: number) {
  if (mm < 400) return "Very Low";
  if (mm < 650) return "Low";
  if (mm < 950) return "Moderate";
  if (mm < 1400) return "High";
  return "Very High";
}

function getBandDescription(mm: number) {
  if (mm < 400) return "Very low rainfall. Only grow drought-resistant crops.";
  if (mm < 650) return "Low rainfall. Use micro-dosing fertilizer technique.";
  if (mm < 950) return "Moderate rainfall. Good for maize, beans, groundnuts.";
  if (mm < 1400) return "High rainfall. Split nitrogen to prevent leaching.";
  return "Very high rainfall. Use slow-release fertilizer. Waterlogging risk.";
}

function getMonthlyDistribution(annualMm: number) {
  const pct: Record<string, number> = { Oct: 0.02, Nov: 0.08, Dec: 0.14, Jan: 0.20, Feb: 0.22, Mar: 0.18, Apr: 0.09, May: 0.04, Jun: 0.01, Jul: 0.01, Aug: 0.00, Sep: 0.01 };
  const result: Record<string, number> = {};
  for (const [m, f] of Object.entries(pct)) result[m] = Math.round(annualMm * f * 10) / 10;
  return result;
}

function getCropSuitabilityByRainfall(annualMm: number) {
  const crops = [
    { crop: "Sorghum", min: 300, max: 900, emoji: "🌾" }, { crop: "Millet", min: 300, max: 800, emoji: "🌾" },
    { crop: "Groundnuts", min: 500, max: 1200, emoji: "🥜" }, { crop: "Cassava", min: 600, max: 1500, emoji: "🍠" },
    { crop: "Maize", min: 600, max: 1200, emoji: "🌽" }, { crop: "Beans", min: 650, max: 1100, emoji: "🫘" },
    { crop: "Sweet Potato", min: 700, max: 1300, emoji: "🍠" }, { crop: "Tobacco", min: 700, max: 1200, emoji: "🌿" },
    { crop: "Soybean", min: 700, max: 1100, emoji: "🌱" }, { crop: "Cotton", min: 700, max: 1300, emoji: "☁️" },
    { crop: "Tomato", min: 600, max: 1200, emoji: "🍅" }, { crop: "Rice", min: 1000, max: 2500, emoji: "🍚" },
    { crop: "Sugarcane", min: 1200, max: 2500, emoji: "🎋" }, { crop: "Tea", min: 1200, max: 2500, emoji: "🍵" },
    { crop: "Coffee", min: 1000, max: 2000, emoji: "☕" },
  ];
  const result = [];
  for (const c of crops) {
    if (c.min <= annualMm && annualMm <= c.max) {
      const centre = (c.min + c.max) / 2;
      const score = 100 - Math.round(Math.abs(annualMm - centre) / (c.max - c.min) * 60);
      result.push({ ...c, suitability: Math.max(10, score) });
    }
  }
  return result.sort((a, b) => b.suitability - a.suitability).slice(0, 8);
}

function getFertilizerCalendar(annualMm: number) {
  if (annualMm < 650) return [
    { month: "November", action: "Soil preparation. Add organic matter/compost." },
    { month: "December", action: "Plant seeds. Apply small fertilizer near seed (micro-dosing)." },
    { month: "January", action: "Weed carefully. Check for pests." },
    { month: "February", action: "Apply small top-dressing only if rain is steady." },
    { month: "March", action: "Monitor crop. Avoid fertilizer if soil is dry." },
  ];
  if (annualMm < 950) return [
    { month: "November", action: "Prepare soil. Add lime if pH is low." },
    { month: "December", action: "Plant with basal NPK fertilizer (200 kg/ha)." },
    { month: "January", action: "Weed. Apply Urea top-dressing at 6 weeks (100 kg/ha)." },
    { month: "February", action: "Check for pests and diseases." },
    { month: "March", action: "Second top-dressing if needed." },
  ];
  return [
    { month: "November", action: "Prepare soil. Apply lime if pH below 6." },
    { month: "December", action: "Plant with basal NPK (200 kg/ha). Avoid waterlogging." },
    { month: "January", action: "First Urea top-dressing — 50 kg/ha (split)." },
    { month: "February", action: "Second Urea 50 kg/ha. Watch for disease." },
    { month: "March", action: "Reduce fertilizer — heavy rain causes leaching." },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { districtName } = await req.json();
    if (!districtName) {
      return new Response(JSON.stringify({ error: "Missing districtName" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const station = STATION_DATA.find(s => s.district.toLowerCase() === districtName.toLowerCase());
    const avgRainfall = DISTRICT_DEFAULTS[districtName] || 900;

    let forecast: number, confidence: number;
    let historicalYears: number[] = [];
    let historicalValues: number[] = [];

    if (station) {
      historicalYears = Object.keys(station.annualRainfall).map(Number).sort();
      historicalValues = historicalYears.map(y => (station.annualRainfall as Record<number, number>)[y]);
      const result = forecastEWMA(historicalValues);
      forecast = result.predicted;
      confidence = result.confidence;
    } else {
      forecast = avgRainfall;
      confidence = 65;
    }

    const band = getRainfallBand(forecast);
    const risks: { level: string; icon: string; message: string }[] = [];
    if (band === "Very High" || band === "High") risks.push({ level: "warning", icon: "🌊", message: `High leaching risk (${forecast}mm). Split nitrogen applications.` });
    if (band === "Very High") risks.push({ level: "danger", icon: "🌊", message: "Waterlogging risk. Check drainage." });
    if (band === "Low" || band === "Very Low") risks.push({ level: "warning", icon: "🌵", message: `Low rainfall (${forecast}mm). Drought-tolerant varieties recommended.` });
    if (forecast < avgRainfall * 0.85) risks.push({ level: "warning", icon: "📉", message: `Below-average season (${forecast}mm vs ${avgRainfall}mm historical).` });
    if (!risks.length) risks.push({ level: "ok", icon: "✅", message: "No major rainfall risks." });

    return new Response(JSON.stringify({
      forecast, confidence, band,
      bandDescription: getBandDescription(forecast),
      avgRainfall,
      stationName: station?.station || null,
      historicalYears, historicalValues,
      monthlyDistribution: getMonthlyDistribution(forecast),
      fertilizerCalendar: getFertilizerCalendar(forecast),
      cropSuitability: getCropSuitabilityByRainfall(forecast),
      risks,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("rainfall error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
