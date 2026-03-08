import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";
import { STATION_DATA, getStationForDistrict, forecastEWMA, getMonthlyDistribution, getCropSuitabilityByRainfall } from "@/lib/rainfall-data";
import { getRainfallBand, getBandDescription, getFertilizerCalendar } from "@/lib/fertilizer-adjuster";

const MONTHS_LETTER = ["J","F","M","A","M","J","J","A","S","O","N","D"];
const MONTHS_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Rainfall() {
  const [selectedDistrict, setSelectedDistrict] = useState("Zomba");

  const district = MALAWI_DISTRICTS.find(d => d.name === selectedDistrict)!;
  const station = getStationForDistrict(selectedDistrict);

  const forecastResult = useMemo(() => {
    if (station) {
      const values = Object.values(station.annualRainfall);
      return forecastEWMA(values);
    }
    return { predicted: district.avgRainfallMm, confidence: 65 };
  }, [selectedDistrict]);

  const forecast = forecastResult.predicted;
  const confidence = forecastResult.confidence;
  const band = getRainfallBand(forecast);
  const bandDesc = getBandDescription(forecast);

  // Historical data for chart
  const historicalYears = station ? Object.keys(station.annualRainfall).map(Number).sort() : [];
  const historicalValues = station ? historicalYears.map(y => station.annualRainfall[y]) : [];
  const maxHistorical = Math.max(...historicalValues, forecast);

  // Monthly distribution
  const monthlyDist = getMonthlyDistribution(forecast);
  const monthlyValues = MONTHS_ORDER.map(m => monthlyDist[m] || 0);
  const maxMonthly = Math.max(...monthlyValues);

  // Fertilizer calendar
  const fertCalendar = getFertilizerCalendar(forecast);

  // Crop suitability
  const cropSuit = getCropSuitabilityByRainfall(forecast);

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
          <p className="text-muted-foreground mt-1">Real meteorological station data (2010–2020) + EWMA seasonal forecasting</p>
        </motion.div>

        {/* District chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {MALAWI_DISTRICTS.map(d => {
            const hasData = !!getStationForDistrict(d.name);
            return (
              <button
                key={d.name}
                onClick={() => setSelectedDistrict(d.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  d.name === selectedDistrict
                    ? "bg-primary/10 border-primary text-primary"
                    : hasData
                      ? "border-border text-foreground hover:border-primary/30"
                      : "border-border text-muted-foreground hover:border-primary/30 opacity-60"
                }`}
              >
                {d.name} {hasData ? "📊" : ""}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Forecast */}
          <div className="space-y-4">
            <Card className="bg-earth-gradient text-earth-foreground border-0">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-2">EWMA Seasonal Forecast</p>
                <p className="text-4xl font-display font-bold">{forecast} <span className="text-lg">mm</span></p>
                <p className="text-sm opacity-70 mt-1">predicted for next season</p>
                <Badge className="mt-3 bg-primary-foreground/20 text-primary-foreground border-0">{band}</Badge>

                <div className="flex gap-6 mt-4 text-sm">
                  <div><p className="text-xs opacity-60">Hist. Avg</p><p className="font-semibold">{district.avgRainfallMm}mm</p></div>
                  <div><p className="text-xs opacity-60">Confidence</p><p className="font-semibold">{confidence}%</p></div>
                  <div><p className="text-xs opacity-60">Data Source</p><p className="font-semibold">{station ? station.station : "Estimated"}</p></div>
                </div>

                {/* Monthly distribution chart */}
                <p className="text-xs opacity-60 mt-4 mb-1">Monthly Distribution</p>
                <div className="flex gap-[2px] items-end h-20">
                  {monthlyValues.map((m, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-primary-foreground/30 transition-all duration-700"
                      style={{ height: `${Math.max(4, (m / (maxMonthly || 1)) * 100)}%` }}
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

            {/* Historical data chart */}
            {station && historicalYears.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Historical Rainfall (2010–2020)</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-[3px] items-end h-24">
                    {historicalValues.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm bg-primary/40 transition-all duration-700"
                          style={{ height: `${Math.max(4, (v / maxHistorical) * 100)}%` }}
                        />
                      </div>
                    ))}
                    {/* Forecast bar */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm bg-primary transition-all duration-700 border-2 border-dashed border-primary"
                        style={{ height: `${Math.max(4, (forecast / maxHistorical) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-[3px] mt-1">
                    {historicalYears.map(y => (
                      <span key={y} className="flex-1 text-center text-[8px] text-muted-foreground">{String(y).slice(2)}</span>
                    ))}
                    <span className="flex-1 text-center text-[8px] text-primary font-bold">F</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Min: {Math.min(...historicalValues)}mm · Max: {Math.max(...historicalValues)}mm · Avg: {Math.round(historicalValues.reduce((s,v)=>s+v,0)/historicalValues.length)}mm</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Season Risk Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {risks.map((r, i) => (
                  <div key={i} className={`flex gap-2 items-start p-2 rounded-md text-sm ${
                    r.level === "ok" ? "bg-primary/5 text-primary" : r.level === "danger" ? "bg-destructive/5 text-destructive" : "bg-accent/20 text-accent-foreground"
                  }`}>
                    <span>{r.icon}</span><span>{r.message}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2 italic">{bandDesc}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Calendar + Crops */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Fertilizer Application Calendar</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {fertCalendar.map((entry, i) => (
                  <div key={i} className="flex gap-3 items-start p-2 rounded-md bg-muted/30 border border-border">
                    <span className="text-xs font-bold text-primary w-20 shrink-0">{entry.month}</span>
                    <span className="text-xs text-foreground">{entry.action}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">🌧️ Rainfall band: <strong>{band}</strong> — adjusted for {forecast}mm predicted rainfall</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Crop Suitability for This Rainfall</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {cropSuit.length > 0 ? cropSuit.map(c => (
                  <div key={c.crop} className="flex items-center gap-3">
                    <span className="text-lg">{c.emoji}</span>
                    <span className="text-sm flex-1">{c.crop}</span>
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${c.suitability}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-primary w-8 text-right">{c.suitability}%</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No crops well-suited for this rainfall level.</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Suitability based on rainfall range match (min–max mm)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
