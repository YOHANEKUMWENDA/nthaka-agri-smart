import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Crop Statistics (pre-computed from Crop_recommendation_1.csv) ──
interface CropStats {
  label: string; emoji: string; season: string; count: number;
  features: { N: { mean: number; std: number }; P: { mean: number; std: number }; K: { mean: number; std: number }; temperature: { mean: number; std: number }; humidity: { mean: number; std: number }; ph: { mean: number; std: number }; rainfall: { mean: number; std: number } };
}

const CROP_STATISTICS: CropStats[] = [
  { label: "rice", emoji: "🍚", season: "Nov–May", count: 100, features: { N: { mean: 80.0, std: 12.0 }, P: { mean: 48.0, std: 10.0 }, K: { mean: 40.0, std: 4.0 }, temperature: { mean: 23.5, std: 2.5 }, humidity: { mean: 82.0, std: 2.0 }, ph: { mean: 6.4, std: 0.8 }, rainfall: { mean: 236.0, std: 40.0 } } },
  { label: "maize", emoji: "🌽", season: "Oct–Apr", count: 100, features: { N: { mean: 77.0, std: 12.0 }, P: { mean: 48.5, std: 10.0 }, K: { mean: 20.0, std: 3.0 }, temperature: { mean: 22.4, std: 2.5 }, humidity: { mean: 65.0, std: 5.0 }, ph: { mean: 6.2, std: 0.6 }, rainfall: { mean: 88.0, std: 15.0 } } },
  { label: "chickpea", emoji: "🫘", season: "May–Sep", count: 100, features: { N: { mean: 40.0, std: 12.0 }, P: { mean: 68.0, std: 4.0 }, K: { mean: 80.0, std: 3.0 }, temperature: { mean: 18.8, std: 1.5 }, humidity: { mean: 16.9, std: 1.5 }, ph: { mean: 7.1, std: 0.3 }, rainfall: { mean: 80.0, std: 10.0 } } },
  { label: "kidneybeans", emoji: "🫘", season: "Nov–Mar", count: 100, features: { N: { mean: 20.8, std: 4.0 }, P: { mean: 68.0, std: 4.0 }, K: { mean: 20.0, std: 3.0 }, temperature: { mean: 20.0, std: 2.5 }, humidity: { mean: 21.6, std: 3.0 }, ph: { mean: 5.7, std: 0.3 }, rainfall: { mean: 105.0, std: 20.0 } } },
  { label: "pigeonpeas", emoji: "🌿", season: "Nov–Jul", count: 100, features: { N: { mean: 20.7, std: 6.0 }, P: { mean: 68.0, std: 5.0 }, K: { mean: 20.0, std: 3.0 }, temperature: { mean: 27.7, std: 3.0 }, humidity: { mean: 48.5, std: 6.0 }, ph: { mean: 5.8, std: 0.4 }, rainfall: { mean: 149.0, std: 20.0 } } },
  { label: "mothbeans", emoji: "🫘", season: "Jul–Oct", count: 100, features: { N: { mean: 21.5, std: 5.0 }, P: { mean: 48.0, std: 8.0 }, K: { mean: 20.4, std: 3.0 }, temperature: { mean: 28.2, std: 3.5 }, humidity: { mean: 48.0, std: 6.0 }, ph: { mean: 6.1, std: 0.8 }, rainfall: { mean: 51.0, std: 8.0 } } },
  { label: "mungbean", emoji: "🫘", season: "Jun–Sep", count: 100, features: { N: { mean: 20.8, std: 5.0 }, P: { mean: 48.0, std: 8.0 }, K: { mean: 20.0, std: 2.5 }, temperature: { mean: 28.5, std: 2.5 }, humidity: { mean: 85.5, std: 1.5 }, ph: { mean: 6.7, std: 0.3 }, rainfall: { mean: 48.0, std: 5.0 } } },
  { label: "blackgram", emoji: "🫘", season: "Jun–Sep", count: 100, features: { N: { mean: 40.0, std: 6.0 }, P: { mean: 68.0, std: 4.0 }, K: { mean: 19.2, std: 2.5 }, temperature: { mean: 29.9, std: 3.0 }, humidity: { mean: 65.1, std: 5.0 }, ph: { mean: 7.1, std: 0.3 }, rainfall: { mean: 67.9, std: 15.0 } } },
  { label: "lentil", emoji: "🫘", season: "May–Sep", count: 100, features: { N: { mean: 18.8, std: 5.0 }, P: { mean: 68.2, std: 6.0 }, K: { mean: 19.8, std: 2.5 }, temperature: { mean: 24.5, std: 3.5 }, humidity: { mean: 64.8, std: 6.0 }, ph: { mean: 6.9, std: 0.4 }, rainfall: { mean: 46.0, std: 8.0 } } },
  { label: "pomegranate", emoji: "🍎", season: "Year-round", count: 100, features: { N: { mean: 19.5, std: 6.0 }, P: { mean: 10.0, std: 5.0 }, K: { mean: 40.0, std: 3.0 }, temperature: { mean: 21.8, std: 3.0 }, humidity: { mean: 90.1, std: 1.5 }, ph: { mean: 6.4, std: 0.5 }, rainfall: { mean: 107.0, std: 15.0 } } },
  { label: "banana", emoji: "🍌", season: "Year-round", count: 100, features: { N: { mean: 100.0, std: 5.0 }, P: { mean: 82.0, std: 10.0 }, K: { mean: 50.0, std: 3.0 }, temperature: { mean: 27.0, std: 1.5 }, humidity: { mean: 80.0, std: 2.0 }, ph: { mean: 6.0, std: 0.3 }, rainfall: { mean: 105.0, std: 10.0 } } },
  { label: "mango", emoji: "🥭", season: "Nov–Mar", count: 100, features: { N: { mean: 20.0, std: 5.0 }, P: { mean: 27.0, std: 6.0 }, K: { mean: 30.0, std: 3.0 }, temperature: { mean: 31.2, std: 3.0 }, humidity: { mean: 50.1, std: 5.0 }, ph: { mean: 5.8, std: 0.5 }, rainfall: { mean: 95.0, std: 10.0 } } },
  { label: "grapes", emoji: "🍇", season: "Jun–Oct", count: 100, features: { N: { mean: 23.2, std: 8.0 }, P: { mean: 132.5, std: 8.0 }, K: { mean: 200.5, std: 3.0 }, temperature: { mean: 23.8, std: 5.0 }, humidity: { mean: 81.6, std: 4.0 }, ph: { mean: 6.0, std: 0.7 }, rainfall: { mean: 70.0, std: 8.0 } } },
  { label: "watermelon", emoji: "🍉", season: "Oct–Mar", count: 100, features: { N: { mean: 99.4, std: 5.0 }, P: { mean: 17.0, std: 3.0 }, K: { mean: 50.0, std: 3.0 }, temperature: { mean: 25.6, std: 1.5 }, humidity: { mean: 85.1, std: 1.5 }, ph: { mean: 6.5, std: 0.3 }, rainfall: { mean: 50.8, std: 5.0 } } },
  { label: "muskmelon", emoji: "🍈", season: "Oct–Mar", count: 100, features: { N: { mean: 100.3, std: 5.0 }, P: { mean: 18.0, std: 3.0 }, K: { mean: 50.0, std: 3.0 }, temperature: { mean: 28.7, std: 2.0 }, humidity: { mean: 92.3, std: 1.0 }, ph: { mean: 6.4, std: 0.3 }, rainfall: { mean: 24.7, std: 3.0 } } },
  { label: "apple", emoji: "🍎", season: "Apr–Oct", count: 100, features: { N: { mean: 20.8, std: 5.0 }, P: { mean: 134.2, std: 8.0 }, K: { mean: 200.1, std: 3.0 }, temperature: { mean: 22.6, std: 2.5 }, humidity: { mean: 92.3, std: 1.5 }, ph: { mean: 5.9, std: 0.4 }, rainfall: { mean: 113.0, std: 8.0 } } },
  { label: "orange", emoji: "🍊", season: "Year-round", count: 100, features: { N: { mean: 19.6, std: 5.0 }, P: { mean: 16.3, std: 5.0 }, K: { mean: 10.1, std: 3.0 }, temperature: { mean: 22.8, std: 3.5 }, humidity: { mean: 92.2, std: 1.0 }, ph: { mean: 7.0, std: 0.3 }, rainfall: { mean: 110.5, std: 8.0 } } },
  { label: "papaya", emoji: "🍐", season: "Year-round", count: 100, features: { N: { mean: 50.0, std: 12.0 }, P: { mean: 59.0, std: 8.0 }, K: { mean: 50.1, std: 3.0 }, temperature: { mean: 33.7, std: 3.0 }, humidity: { mean: 92.4, std: 1.0 }, ph: { mean: 6.7, std: 0.2 }, rainfall: { mean: 143.0, std: 15.0 } } },
  { label: "coconut", emoji: "🥥", season: "Year-round", count: 100, features: { N: { mean: 21.9, std: 5.0 }, P: { mean: 16.9, std: 5.0 }, K: { mean: 30.6, std: 3.0 }, temperature: { mean: 27.4, std: 1.5 }, humidity: { mean: 94.8, std: 1.0 }, ph: { mean: 6.0, std: 0.3 }, rainfall: { mean: 175.7, std: 25.0 } } },
  { label: "cotton", emoji: "☁️", season: "Nov–May", count: 100, features: { N: { mean: 118.0, std: 12.0 }, P: { mean: 46.0, std: 8.0 }, K: { mean: 20.0, std: 3.0 }, temperature: { mean: 24.0, std: 2.5 }, humidity: { mean: 80.0, std: 3.0 }, ph: { mean: 6.9, std: 0.3 }, rainfall: { mean: 80.3, std: 12.0 } } },
  { label: "jute", emoji: "🌿", season: "Mar–Aug", count: 100, features: { N: { mean: 78.4, std: 12.0 }, P: { mean: 46.9, std: 8.0 }, K: { mean: 39.9, std: 3.0 }, temperature: { mean: 25.0, std: 2.0 }, humidity: { mean: 85.0, std: 3.0 }, ph: { mean: 6.7, std: 0.3 }, rainfall: { mean: 175.0, std: 20.0 } } },
  { label: "coffee", emoji: "☕", season: "Year-round", count: 100, features: { N: { mean: 101.2, std: 12.0 }, P: { mean: 28.7, std: 6.0 }, K: { mean: 30.0, std: 3.0 }, temperature: { mean: 25.5, std: 1.5 }, humidity: { mean: 58.9, std: 5.0 }, ph: { mean: 6.8, std: 0.2 }, rainfall: { mean: 158.0, std: 20.0 } } },
];

const MALAWI_CROP_MAP: Record<string, string> = {
  rice: "Rice", maize: "Maize", chickpea: "Chickpea", kidneybeans: "Kidney Beans",
  pigeonpeas: "Pigeon Peas", mothbeans: "Moth Beans", mungbean: "Mung Bean",
  blackgram: "Black Gram", lentil: "Lentil", banana: "Banana", mango: "Mango",
  watermelon: "Watermelon", papaya: "Papaya", coconut: "Coconut", cotton: "Cotton",
  coffee: "Coffee", orange: "Orange", apple: "Apple", grapes: "Grapes",
  pomegranate: "Pomegranate", muskmelon: "Muskmelon", jute: "Jute",
};

// ── Station Data (2010–2020) ──
interface StationData { station: string; district: string; region: string; annualRainfall: Record<number, number>; }
const STATION_DATA: StationData[] = [
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

// ── District defaults ──
interface District { name: string; region: string; avgRainfallMm: number; rainfallCategory: string; }
const MALAWI_DISTRICTS: District[] = [
  { name: "Chitipa", region: "Northern", avgRainfallMm: 1100, rainfallCategory: "High" },
  { name: "Karonga", region: "Northern", avgRainfallMm: 950, rainfallCategory: "Moderate" },
  { name: "Likoma", region: "Northern", avgRainfallMm: 1050, rainfallCategory: "High" },
  { name: "Mzimba", region: "Northern", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  { name: "Nkhata Bay", region: "Northern", avgRainfallMm: 1400, rainfallCategory: "High" },
  { name: "Rumphi", region: "Northern", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  { name: "Dedza", region: "Central", avgRainfallMm: 1000, rainfallCategory: "Moderate" },
  { name: "Dowa", region: "Central", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  { name: "Kasungu", region: "Central", avgRainfallMm: 800, rainfallCategory: "Moderate" },
  { name: "Lilongwe", region: "Central", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  { name: "Mchinji", region: "Central", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  { name: "Nkhotakota", region: "Central", avgRainfallMm: 1300, rainfallCategory: "High" },
  { name: "Ntcheu", region: "Central", avgRainfallMm: 950, rainfallCategory: "Moderate" },
  { name: "Ntchisi", region: "Central", avgRainfallMm: 1000, rainfallCategory: "Moderate" },
  { name: "Salima", region: "Central", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  { name: "Balaka", region: "Southern", avgRainfallMm: 800, rainfallCategory: "Low" },
  { name: "Blantyre", region: "Southern", avgRainfallMm: 1100, rainfallCategory: "High" },
  { name: "Chikwawa", region: "Southern", avgRainfallMm: 700, rainfallCategory: "Low" },
  { name: "Chiradzulu", region: "Southern", avgRainfallMm: 1050, rainfallCategory: "High" },
  { name: "Machinga", region: "Southern", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  { name: "Mangochi", region: "Southern", avgRainfallMm: 800, rainfallCategory: "Low" },
  { name: "Mulanje", region: "Southern", avgRainfallMm: 1600, rainfallCategory: "High" },
  { name: "Mwanza", region: "Southern", avgRainfallMm: 750, rainfallCategory: "Low" },
  { name: "Neno", region: "Southern", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  { name: "Nsanje", region: "Southern", avgRainfallMm: 700, rainfallCategory: "Low" },
  { name: "Phalombe", region: "Southern", avgRainfallMm: 1200, rainfallCategory: "High" },
  { name: "Thyolo", region: "Southern", avgRainfallMm: 1300, rainfallCategory: "High" },
  { name: "Zomba", region: "Southern", avgRainfallMm: 1100, rainfallCategory: "High" },
];

// ── Fertilizer Base Rates ──
const BASE_RATES: Record<string, { basal_npk: number; urea: number }> = {
  maize: { basal_npk: 200, urea: 100 }, rice: { basal_npk: 150, urea: 80 },
  wheat: { basal_npk: 150, urea: 100 }, beans: { basal_npk: 100, urea: 0 },
  "kidney beans": { basal_npk: 100, urea: 0 }, soybean: { basal_npk: 100, urea: 0 },
  soybeans: { basal_npk: 100, urea: 0 }, groundnuts: { basal_npk: 100, urea: 0 },
  cassava: { basal_npk: 100, urea: 40 }, sorghum: { basal_npk: 100, urea: 60 },
  millet: { basal_npk: 80, urea: 50 }, cotton: { basal_npk: 150, urea: 120 },
  sugarcane: { basal_npk: 200, urea: 150 }, tomato: { basal_npk: 150, urea: 80 },
  potato: { basal_npk: 200, urea: 80 }, "sweet potato": { basal_npk: 100, urea: 40 },
  tobacco: { basal_npk: 150, urea: 100 }, banana: { basal_npk: 180, urea: 100 },
  coffee: { basal_npk: 200, urea: 120 }, tea: { basal_npk: 200, urea: 130 },
  "pigeon peas": { basal_npk: 100, urea: 0 }, chickpea: { basal_npk: 100, urea: 0 },
  lentil: { basal_npk: 100, urea: 0 }, watermelon: { basal_npk: 150, urea: 80 },
  mango: { basal_npk: 120, urea: 60 }, papaya: { basal_npk: 150, urea: 80 },
  sunflower: { basal_npk: 120, urea: 60 },
};

const ADJUSTMENTS: Record<string, { npkFactor: number; ureaFactor: number; split: number; method: string }> = {
  "Very Low": { npkFactor: 0.6, ureaFactor: 0.5, split: 1, method: "micro-dosing" },
  "Low": { npkFactor: 0.8, ureaFactor: 0.7, split: 1, method: "standard" },
  "Moderate": { npkFactor: 1.0, ureaFactor: 1.0, split: 2, method: "standard" },
  "High": { npkFactor: 1.0, ureaFactor: 1.0, split: 3, method: "split" },
  "Very High": { npkFactor: 1.0, ureaFactor: 0.8, split: 3, method: "slow-release" },
};

// ── Algorithm Functions ──

function gaussianPdf(x: number, mean: number, std: number): number {
  const s = Math.max(std, 0.01);
  const exp = -0.5 * Math.pow((x - mean) / s, 2);
  return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.pow(Math.E, exp);
}

function predictCrop(N: number, P: number, K: number, temperature: number, humidity: number, ph: number, rainfall: number) {
  const scores: { label: string; logProb: number }[] = [];
  for (const cs of CROP_STATISTICS) {
    const f = cs.features;
    let logProb = 0;
    logProb += Math.log(gaussianPdf(N, f.N.mean, f.N.std) + 1e-300);
    logProb += Math.log(gaussianPdf(P, f.P.mean, f.P.std) + 1e-300);
    logProb += Math.log(gaussianPdf(K, f.K.mean, f.K.std) + 1e-300);
    logProb += Math.log(gaussianPdf(temperature, f.temperature.mean, f.temperature.std) + 1e-300);
    logProb += Math.log(gaussianPdf(humidity, f.humidity.mean, f.humidity.std) + 1e-300);
    logProb += Math.log(gaussianPdf(ph, f.ph.mean, f.ph.std) + 1e-300);
    logProb += Math.log(gaussianPdf(rainfall, f.rainfall.mean, f.rainfall.std) + 1e-300);
    scores.push({ label: cs.label, logProb });
  }
  const maxLogProb = Math.max(...scores.map(s => s.logProb));
  const expScores = scores.map(s => ({ label: s.label, prob: Math.exp(s.logProb - maxLogProb) }));
  const total = expScores.reduce((sum, s) => sum + s.prob, 0);
  const normalized = expScores.map(s => ({ label: s.label, prob: (s.prob / total) * 100 })).sort((a, b) => b.prob - a.prob);
  const top = normalized[0];
  return {
    crop: MALAWI_CROP_MAP[top.label] || top.label,
    confidence: Math.round(top.prob * 10) / 10,
    alternatives: normalized.slice(1, 5).map(a => ({ crop: MALAWI_CROP_MAP[a.label] || a.label, confidence: Math.round(a.prob * 10) / 10 }))
  };
}

function forecastEWMA(historicalValues: number[], alpha = 0.3): { predicted: number; confidence: number } {
  if (historicalValues.length < 3) {
    const avg = historicalValues.reduce((s, v) => s + v, 0) / historicalValues.length;
    return { predicted: Math.round(avg), confidence: 50 };
  }
  let ewma = historicalValues[0];
  const ewmaValues: number[] = [ewma];
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
  const std = Math.sqrt(variance);
  const cv = std / mean;
  const confidence = Math.max(50, Math.round(100 - cv * 100));
  return { predicted: forecast, confidence };
}

function getRainfallBand(mm: number): string {
  if (mm < 400) return "Very Low";
  if (mm < 650) return "Low";
  if (mm < 950) return "Moderate";
  if (mm < 1400) return "High";
  return "Very High";
}

function getBandDescription(mm: number): string {
  if (mm < 400) return "Very low rainfall. Only grow drought-resistant crops like sorghum or millet.";
  if (mm < 650) return "Low rainfall. Use micro-dosing fertilizer technique. Drought-tolerant crops recommended.";
  if (mm < 950) return "Moderate rainfall. Good for maize, beans, groundnuts. Standard NPK applies.";
  if (mm < 1400) return "High rainfall. Split nitrogen fertilizer to prevent leaching. Maize and rice do well.";
  return "Very high rainfall. Use slow-release fertilizer. Waterlogging risk — use raised beds.";
}

function getSoilAlerts(N: number, P: number, K: number, ph: number, rainfall: number) {
  const alerts: { type: string; message: string }[] = [];
  if (ph < 5.5) alerts.push({ type: "danger", message: `Soil is too acidic (pH ${ph}). Add lime before planting.` });
  else if (ph > 8.0) alerts.push({ type: "danger", message: `Soil is too alkaline (pH ${ph}). Add sulphur to lower pH.` });
  else if (ph < 6.0) alerts.push({ type: "warning", message: `Soil is slightly acidic (pH ${ph}). Consider adding a small amount of lime.` });
  if (N < 20) alerts.push({ type: "danger", message: "Nitrogen is very low. Plants will grow slowly. Apply Urea or CAN." });
  else if (N < 40) alerts.push({ type: "warning", message: "Nitrogen is low. Add a nitrogen fertilizer like Urea before planting." });
  if (P < 10) alerts.push({ type: "danger", message: "Phosphorus is very low. Root growth will be poor. Apply TSP or DAP." });
  else if (P < 20) alerts.push({ type: "warning", message: "Phosphorus is low. Consider applying phosphate fertilizer." });
  if (K < 20) alerts.push({ type: "warning", message: "Potassium is low. Crops will be more susceptible to disease. Apply MOP." });
  if (rainfall < 400) alerts.push({ type: "danger", message: "Very low rainfall expected. Only grow drought-resistant crops like sorghum or millet." });
  else if (rainfall > 1800) alerts.push({ type: "warning", message: "Very high rainfall expected. Split your fertilizer into smaller amounts to avoid it washing away." });
  return alerts;
}

function buildPlan(npkRate: number, ureaRate: number, splits: number, _band: string, method: string) {
  const plan: { timing: string; action: string; note: string }[] = [];
  if (method === "micro-dosing") {
    plan.push({ timing: "At planting", action: `Apply ${npkRate} kg/ha NPK — place it in the planting hole near the seed, not broadcast.`, note: "Micro-dosing saves fertilizer in dry conditions." });
    if (ureaRate > 0) plan.push({ timing: "4–5 weeks after planting", action: `Apply ${ureaRate} kg/ha Urea — only if rain has fallen that week.`, note: "Never apply Urea to dry soil." });
  } else if (method === "slow-release") {
    plan.push({ timing: "At planting", action: `Apply ${npkRate} kg/ha NPK basal fertilizer.`, note: "In very high rainfall, use coated or slow-release Urea to reduce leaching." });
    if (ureaRate > 0) { const perSplit = Math.round(ureaRate / splits); for (let i = 0; i < splits; i++) plan.push({ timing: `Top-dressing ${i + 1} — ${(i + 1) * 3} weeks after planting`, action: `Apply ${perSplit} kg/ha Urea.`, note: "Small split applications prevent nitrogen washing away." }); }
  } else {
    plan.push({ timing: "At planting", action: `Apply ${npkRate} kg/ha NPK (23:21:0) basal fertilizer.`, note: "Apply in planting rows or holes, 5 cm away from seeds." });
    if (ureaRate > 0) { const perSplit = Math.round(ureaRate / splits); for (let i = 0; i < splits; i++) plan.push({ timing: `Top-dressing ${i + 1} — ${4 + i * 3} weeks after planting`, action: `Apply ${perSplit} kg/ha Urea or CAN.`, note: "Apply after rain when soil is moist." }); }
  }
  return plan;
}

function getWarnings(mm: number, band: string, crop: string): string[] {
  const w: string[] = [];
  if (mm < 400) { w.push("Very low rainfall — irrigation is strongly recommended."); w.push("Do not broadcast fertilizer — use micro-dosing only."); }
  if (mm > 1400) { w.push("High rainfall causes nitrogen leaching. Always split Urea."); w.push("Watch for fungal diseases."); }
  if ((band === "High" || band === "Very High") && ["maize", "wheat", "sorghum"].includes(crop.toLowerCase())) w.push("Avoid applying all Urea at once — split into 2–3 applications.");
  if (mm < 600 && ["rice", "sugarcane"].includes(crop.toLowerCase())) w.push(`Warning: ${crop} normally needs more rainfall than predicted.`);
  return w;
}

function getOrganicAdvice(band: string): string {
  if (band === "Very Low") return "Add compost or animal manure — organic matter holds water in the soil.";
  if (band === "High" || band === "Very High") return "Add compost to improve soil structure and bind nutrients.";
  return "Add compost or crop residues after harvest to maintain soil organic matter.";
}

function adjustForRainfall(rainfallMm: number, crop: string) {
  const cropKey = crop.toLowerCase().trim();
  const band = getRainfallBand(rainfallMm);
  const rates = BASE_RATES[cropKey] || { basal_npk: 150, urea: 80 };
  const adj = ADJUSTMENTS[band];
  const npkRate = Math.round(rates.basal_npk * adj.npkFactor);
  const ureaRate = Math.round(rates.urea * adj.ureaFactor);
  return {
    rainfallBand: band, rainfallMm: Math.round(rainfallMm),
    basalNpkKgHa: npkRate, ureaKgHa: ureaRate,
    applicationMethod: adj.method, splits: adj.split,
    plan: buildPlan(npkRate, ureaRate, adj.split, band, adj.method),
    warnings: getWarnings(rainfallMm, band, crop),
    organicAdvice: getOrganicAdvice(band),
  };
}

function assessSoil(N: number, P: number, K: number, ph: number, organicMatter: number, moisture: number): string {
  const parts: string[] = [];
  if (N < 20) parts.push("very low nitrogen — apply Urea or CAN urgently");
  else if (N < 40) parts.push("low nitrogen");
  else if (N > 100) parts.push("high nitrogen");
  if (P < 10) parts.push("very low phosphorus — apply TSP or DAP");
  else if (P < 20) parts.push("low phosphorus");
  if (K < 20) parts.push("low potassium");
  if (ph < 5.5) parts.push("acidic soil (add lime 4–6 weeks before planting)");
  else if (ph > 8.0) parts.push("alkaline soil (add sulphur)");
  else if (ph < 6.0) parts.push("slightly acidic soil");
  if (organicMatter < 1) parts.push("very low organic matter — add compost urgently");
  else if (organicMatter < 2) parts.push("low organic matter");
  if (moisture < 25) parts.push("dry soil conditions");
  else if (moisture > 80) parts.push("waterlogged soil — improve drainage");
  if (parts.length === 0) return "Soil conditions are generally favorable for most crops.";
  return `Notable conditions: ${parts.join("; ")}. Recommendations have been adjusted accordingly.`;
}

function generateFertilizerPlan(N: number, P: number, K: number, ph: number, organicMatter: number, rainfallCat: string) {
  const plans: { type: string; applicationRate: string; timing: string; notes: string }[] = [];
  const rainfallAdj = rainfallCat === "High" || rainfallCat === "Very High" ? "Split application recommended." : rainfallCat === "Low" || rainfallCat === "Very Low" ? "Apply near root zone." : "";
  if (N < 60) plans.push({ type: "Urea (46-0-0)", applicationRate: `${Math.round((60 - N) * 2.2)} kg/ha`, timing: "Basal + top-dress at 4–6 weeks", notes: `Nitrogen deficient. ${rainfallAdj}` });
  if (P < 30) plans.push({ type: "TSP (0-46-0)", applicationRate: `${Math.round((30 - P) * 2.5)} kg/ha`, timing: "Basal at planting", notes: "Phosphorus boost for root development." });
  if (K < 30) plans.push({ type: "MOP (0-0-60)", applicationRate: `${Math.round((30 - K) * 1.8)} kg/ha`, timing: "Basal at planting", notes: "Potassium for disease resistance." });
  if (N >= 60 && P >= 30 && K >= 30) plans.push({ type: "NPK 23:21:0 + 4S (Maintenance)", applicationRate: "100 kg/ha", timing: "Basal at planting", notes: "Maintenance dose." });
  if (organicMatter < 2) plans.push({ type: "Compost / Manure", applicationRate: "5–10 tonnes/ha", timing: "2–4 weeks before planting", notes: "Low organic matter." });
  if (ph < 5.5) plans.push({ type: "Agricultural Lime", applicationRate: `${Math.round((5.5 - ph) * 2000)} kg/ha`, timing: "4–6 weeks before planting", notes: "Correct soil acidity." });
  return plans;
}

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { nitrogen, phosphorus, potassium, ph, moisture, temperature, organicMatter, districtName } = await req.json();

    // Validate input
    if (nitrogen == null || phosphorus == null || potassium == null || ph == null || moisture == null || temperature == null || organicMatter == null || !districtName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Find district
    const district = MALAWI_DISTRICTS.find(d => d.name === districtName);
    if (!district) {
      return new Response(JSON.stringify({ error: `Unknown district: ${districtName}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Rainfall forecast
    const station = STATION_DATA.find(s => s.district.toLowerCase() === districtName.toLowerCase());
    let forecastedRainfall: number;
    let rainfallConfidence: number;
    if (station) {
      const values = Object.values(station.annualRainfall).sort();
      const result = forecastEWMA(values);
      forecastedRainfall = result.predicted;
      rainfallConfidence = result.confidence;
    } else {
      const seasonalFactor = 0.95 + Math.random() * 0.1;
      forecastedRainfall = Math.round(district.avgRainfallMm * seasonalFactor);
      rainfallConfidence = 65;
    }

    const rainfallBand = getRainfallBand(forecastedRainfall);
    const rainfallCategory = forecastedRainfall < 800 ? "Low" : forecastedRainfall > 1100 ? "High" : "Moderate";

    // ML prediction (Gaussian Naive Bayes)
    const mlResult = predictCrop(nitrogen, phosphorus, potassium, temperature, moisture, ph, forecastedRainfall);

    // Build crop list
    const allPredictions = [{ crop: mlResult.crop, confidence: mlResult.confidence }, ...mlResult.alternatives];
    const crops = allPredictions.slice(0, 5).map((pred, i) => {
      const stat = CROP_STATISTICS.find(c => (MALAWI_CROP_MAP[c.label] || c.label) === pred.crop);
      return {
        crop: pred.crop,
        score: Math.max(10, Math.round(95 - i * 12 - (100 - pred.confidence) * 0.3)),
        confidence: pred.confidence,
        reason: `ML prediction based on soil (N:${nitrogen}, P:${phosphorus}, K:${potassium}, pH:${ph}) and ${rainfallBand} rainfall (${forecastedRainfall}mm) in ${districtName}.`,
        season: stat?.season || "Oct–Apr",
        emoji: stat?.emoji || "🌱",
      };
    });

    // Fertilizer adjustment
    const fertAdjustment = adjustForRainfall(forecastedRainfall, mlResult.crop);
    const soilAlerts = getSoilAlerts(nitrogen, phosphorus, potassium, ph, forecastedRainfall);
    const fertilizers = generateFertilizerPlan(nitrogen, phosphorus, potassium, ph, organicMatter, rainfallCategory);
    const soilAssessment = assessSoil(nitrogen, phosphorus, potassium, ph, organicMatter, moisture);

    const recommendation = {
      crops,
      fertilizers,
      forecastedRainfall,
      rainfallCategory,
      rainfallBand,
      rainfallBandDescription: getBandDescription(forecastedRainfall),
      soilAssessment,
      soilAlerts,
      fertilizerAdjustment: fertAdjustment,
      mlPrediction: {
        crop: mlResult.crop,
        confidence: mlResult.confidence,
        alternatives: mlResult.alternatives,
        algorithm: "Gaussian Naive Bayes (dataset-trained)",
      },
    };

    return new Response(JSON.stringify(recommendation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
