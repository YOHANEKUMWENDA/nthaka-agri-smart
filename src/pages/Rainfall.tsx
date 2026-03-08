import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const MONTHS_LETTER = ["J","F","M","A","M","J","J","A","S","O","N","D"];
const MONTHS_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Stations with real data (for UI indicator)
const DISTRICTS_WITH_STATIONS = [
  "Chitipa","Karonga","Nkhata Bay","Rumphi","Mzimba",
  "Kasungu","Nkhotakota","Ntchisi","Dowa","Salima","Lilongwe","Mchinji","Dedza","Ntcheu",
  "Mangochi","Balaka","Zomba","Chiradzulu","Blantyre","Mwanza","Thyolo","Mulanje","Nsanje"
];

interface RainfallData {
  forecast: number;
  confidence: number;
  band: string;
  bandDescription: string;
  avgRainfall: number;
  stationName: string | null;
  historicalYears: number[];
  historicalValues: number[];
  monthlyDistribution: Record<string, number>;
  fertilizerCalendar: { month: string; action: string }[];
  cropSuitability: { crop: string; emoji: string; suitability: number }[];
  risks: { level: string; icon: string; message: string }[];
}

export default function Rainfall() {
  const [selectedDistrict, setSelectedDistrict] = useState("Zomba");
  const [data, setData] = useState<RainfallData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRainfall = async () => {
      setLoading(true);
      try {
        const { data: result, error } = await supabase.functions.invoke("rainfall", {
          body: { districtName: selectedDistrict },
        });
        if (error) throw error;
        setData(result);
      } catch (err) {
        console.error("Rainfall fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRainfall();
  }, [selectedDistrict]);

  const district = MALAWI_DISTRICTS.find(d => d.name === selectedDistrict)!;

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <main className="container max-w-6xl px-4 py-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">🌧️ Rainfall Intelligence</h1>
          <div className="flex flex-wrap gap-2 mb-8">
            {MALAWI_DISTRICTS.map(d => (
              <button key={d.name} onClick={() => setSelectedDistrict(d.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${d.name === selectedDistrict ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                {d.name} {DISTRICTS_WITH_STATIONS.includes(d.name) ? "📊" : ""}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading rainfall data from server...</p>
          </div>
        </main>
      </div>
    );
  }

  const { forecast, confidence, band, bandDescription, historicalYears, historicalValues, monthlyDistribution, fertilizerCalendar, cropSuitability, risks } = data;
  const monthlyValues = MONTHS_ORDER.map(m => monthlyDistribution[m] || 0);
  const maxMonthly = Math.max(...monthlyValues);
  const maxHistorical = Math.max(...historicalValues, forecast);

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-6xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">🌧️ Rainfall Intelligence</h1>
          <p className="text-muted-foreground mt-1">Real meteorological station data (2010–2020) + EWMA seasonal forecasting — powered by backend</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {MALAWI_DISTRICTS.map(d => (
            <button key={d.name} onClick={() => setSelectedDistrict(d.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${d.name === selectedDistrict ? "bg-primary/10 border-primary text-primary" : DISTRICTS_WITH_STATIONS.includes(d.name) ? "border-border text-foreground hover:border-primary/30" : "border-border text-muted-foreground hover:border-primary/30 opacity-60"}`}>
              {d.name} {DISTRICTS_WITH_STATIONS.includes(d.name) ? "📊" : ""}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="bg-earth-gradient text-earth-foreground border-0">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-2">EWMA Seasonal Forecast</p>
                <p className="text-4xl font-display font-bold">{forecast} <span className="text-lg">mm</span></p>
                <p className="text-sm opacity-70 mt-1">predicted for next season</p>
                <Badge className="mt-3 bg-primary-foreground/20 text-primary-foreground border-0">{band}</Badge>
                <div className="flex gap-6 mt-4 text-sm">
                  <div><p className="text-xs opacity-60">Hist. Avg</p><p className="font-semibold">{data.avgRainfall}mm</p></div>
                  <div><p className="text-xs opacity-60">Confidence</p><p className="font-semibold">{confidence}%</p></div>
                  <div><p className="text-xs opacity-60">Data Source</p><p className="font-semibold">{data.stationName || "Estimated"}</p></div>
                </div>
                <p className="text-xs opacity-60 mt-4 mb-1">Monthly Distribution</p>
                <div className="flex gap-[2px] items-end h-20">
                  {monthlyValues.map((m, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-primary-foreground/30 transition-all duration-700" style={{ height: `${Math.max(4, (m / (maxMonthly || 1)) * 100)}%` }} />
                  ))}
                </div>
                <div className="flex gap-[2px] mt-1">
                  {MONTHS_LETTER.map((m, i) => (<span key={i} className="flex-1 text-center text-[9px] opacity-50">{m}</span>))}
                </div>
              </CardContent>
            </Card>

            {historicalYears.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Historical Rainfall (2010–2020)</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-[3px] items-end h-24">
                    {historicalValues.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-sm bg-primary/40 transition-all duration-700" style={{ height: `${Math.max(4, (v / maxHistorical) * 100)}%` }} />
                      </div>
                    ))}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm bg-primary transition-all duration-700 border-2 border-dashed border-primary" style={{ height: `${Math.max(4, (forecast / maxHistorical) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-[3px] mt-1">
                    {historicalYears.map(y => (<span key={y} className="flex-1 text-center text-[8px] text-muted-foreground">{String(y).slice(2)}</span>))}
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
                  <div key={i} className={`flex gap-2 items-start p-2 rounded-md text-sm ${r.level === "ok" ? "bg-primary/5 text-primary" : r.level === "danger" ? "bg-destructive/5 text-destructive" : "bg-accent/20 text-accent-foreground"}`}>
                    <span>{r.icon}</span><span>{r.message}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2 italic">{bandDescription}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Fertilizer Application Calendar</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {fertilizerCalendar.map((entry, i) => (
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
                {cropSuitability.length > 0 ? cropSuitability.map(c => (
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
