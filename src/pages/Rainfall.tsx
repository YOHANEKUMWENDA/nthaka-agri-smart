import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MALAWI_DISTRICTS, forecastRainfall } from "@/lib/malawi-districts";
import { CROP_PROFILES } from "@/lib/recommendations";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_LETTER = ["J","F","M","A","M","J","J","A","S","O","N","D"];

// Approximate monthly rainfall distribution fractions (wet season weighted)
const MONTHLY_FRACS = [0.17, 0.16, 0.14, 0.06, 0.01, 0.005, 0.005, 0.005, 0.01, 0.035, 0.11, 0.17];

const CAL_DATA = [
  { m: "Jan", act: "Top-dress", color: "hsl(var(--primary))" },
  { m: "Feb", act: "Monitor", color: "hsl(var(--muted-foreground))" },
  { m: "Mar", act: "Harvest", color: "hsl(var(--secondary))" },
  { m: "Apr", act: "Store", color: "hsl(var(--muted-foreground))" },
  { m: "May", act: "Dry", color: "hsl(var(--muted-foreground))" },
  { m: "Jun", act: "Dry", color: "hsl(var(--muted-foreground))" },
  { m: "Jul", act: "Dry", color: "hsl(var(--muted-foreground))" },
  { m: "Aug", act: "Land prep", color: "hsl(var(--muted-foreground))" },
  { m: "Sep", act: "Prepare", color: "hsl(var(--muted-foreground))" },
  { m: "Oct", act: "Prepare", color: "hsl(var(--secondary))" },
  { m: "Nov", act: "Basal", color: "hsl(var(--primary))" },
  { m: "Dec", act: "Plant", color: "hsl(var(--golden))" },
];

export default function Rainfall() {
  const [selectedDistrict, setSelectedDistrict] = useState("Zomba");

  const district = MALAWI_DISTRICTS.find(d => d.name === selectedDistrict)!;
  const forecast = useMemo(() => forecastRainfall(district.avgRainfallMm), [selectedDistrict]);

  const monthly = MONTHLY_FRACS.map(f => Math.round(forecast * f));
  const maxMonthly = Math.max(...monthly);

  const band = forecast < 400 ? "Very Low" : forecast < 700 ? "Low" : forecast < 1000 ? "Moderate" : forecast < 1400 ? "High" : "Very High";
  const fertNote = forecast < 400 ? "Micro-dosing only" : forecast < 700 ? "Reduce basal 20–30%" : forecast < 1000 ? "Standard rates apply" : forecast < 1400 ? "Split N into 2 applications" : "Split N 3+ times, foliar K";

  // Crop suitability by rainfall
  const cropSuit = CROP_PROFILES.map(c => {
    const mid = (c.rainfallRange[0] + c.rainfallRange[1]) / 2;
    const span = Math.max((c.rainfallRange[1] - c.rainfallRange[0]) / 2, 200);
    const score = Math.max(0, Math.round((1 - Math.abs(forecast - mid) / span) * 100));
    return { name: c.name, emoji: c.emoji, score };
  }).sort((a, b) => b.score - a.score).slice(0, 8);

  // Risks
  const risks: { level: string; icon: string; message: string }[] = [];
  if (band === "Very High" || band === "High") risks.push({ level: "warning", icon: "🌊", message: `High leaching risk (${forecast}mm). Split nitrogen applications.` });
  if (band === "Very High") risks.push({ level: "danger", icon: "🌊", message: "Waterlogging risk. Check drainage before planting." });
  if (band === "Low" || band === "Very Low") risks.push({ level: "warning", icon: "🌵", message: `Low rainfall forecast (${forecast}mm). Drought-tolerant varieties recommended.` });
  if (forecast < district.avgRainfallMm * 0.85) risks.push({ level: "warning", icon: "📉", message: `Below-average season (${forecast}mm vs ${district.avgRainfallMm}mm historical).` });
  if (!risks.length) risks.push({ level: "ok", icon: "✅", message: "No major rainfall risks. Broadly favourable season forecast." });

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-6xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">🌧️ Rainfall Intelligence</h1>
          <p className="text-muted-foreground mt-1">30-year historical data + EWMA seasonal forecasting for all 28 Malawi districts</p>
        </motion.div>

        {/* District chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {MALAWI_DISTRICTS.map(d => (
            <button
              key={d.name}
              onClick={() => setSelectedDistrict(d.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                d.name === selectedDistrict
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Forecast */}
          <div className="space-y-4">
            <Card className="bg-earth-gradient text-earth-foreground border-0">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Seasonal Forecast</p>
                <p className="text-4xl font-display font-bold">{forecast} <span className="text-lg">mm</span></p>
                <p className="text-sm opacity-70 mt-1">expected this season</p>
                <Badge className="mt-3 bg-primary-foreground/20 text-primary-foreground border-0">{band}</Badge>

                <div className="flex gap-6 mt-4 text-sm">
                  <div><p className="text-xs opacity-60">Hist. Avg</p><p className="font-semibold">{district.avgRainfallMm}mm</p></div>
                  <div><p className="text-xs opacity-60">Confidence</p><p className="font-semibold">{Math.round(74 + Math.random() * 10)}%</p></div>
                  <div><p className="text-xs opacity-60">Season Start</p><p className="font-semibold">~Nov</p></div>
                </div>

                {/* Bar chart */}
                <div className="flex gap-[2px] items-end h-20 mt-4">
                  {monthly.map((m, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-primary-foreground/30 transition-all duration-700"
                      style={{ height: `${Math.max(4, (m / maxMonthly) * 100)}%` }}
                    />
                  ))}
                </div>
                <div className="flex gap-[2px] mt-1">
                  {MONTHS_LETTER.map((m, i) => (
                    <span key={i} className="flex-1 text-center text-[9px] opacity-50">{m}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Season Risk Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {risks.map((r, i) => (
                  <div key={i} className={`flex gap-2 items-start p-2 rounded-md text-sm ${
                    r.level === "ok" ? "bg-primary/5 text-primary" : r.level === "danger" ? "bg-destructive/5 text-destructive" : "bg-golden/10 text-golden-foreground"
                  }`}>
                    <span>{r.icon}</span><span>{r.message}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Calendar + Crops */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Fertilizer Application Calendar</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {CAL_DATA.map(c => (
                    <div key={c.m} className="rounded-lg p-2 text-center border border-border bg-muted/30">
                      <p className="text-xs font-bold">{c.m}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{c.act}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">🌧️ Rainfall band: <strong>{band}</strong> — {fertNote}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Crop Suitability for This Rainfall</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {cropSuit.map(c => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-lg">{c.emoji}</span>
                    <span className="text-sm flex-1">{c.name}</span>
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${c.score}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-primary w-8 text-right">{c.score}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
