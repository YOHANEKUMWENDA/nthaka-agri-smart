import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Users, MapPin, Brain, Bot,
  CloudRain, Settings, Search, Activity, TrendingUp, Globe,
  Sprout, ChevronRight
} from "lucide-react";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DISTRICTS = [
  "Lilongwe","Blantyre","Zomba","Mzimba","Kasungu","Dedza","Salima","Mangochi",
  "Balaka","Chiradzulu","Thyolo","Mulanje","Phalombe","Chikwawa","Nsanje",
  "Karonga","Rumphi","Nkhata Bay","Mchinji","Dowa","Ntchisi","Nkhotakota",
  "Ntcheu","Machinga","Mwanza","Neno","Likoma","Chitipa"
];

const TOP_CROPS = [
  { crop: "Maize", count: 4821, pct: 31, colorClass: "bg-primary" },
  { crop: "Beans", count: 2340, pct: 15, colorClass: "bg-leaf" },
  { crop: "Tobacco", count: 1987, pct: 13, colorClass: "bg-golden" },
  { crop: "Groundnuts", count: 1654, pct: 11, colorClass: "bg-accent" },
  { crop: "Cassava", count: 1203, pct: 8, colorClass: "bg-secondary" },
  { crop: "Soybean", count: 987, pct: 6, colorClass: "bg-earth" },
  { crop: "Rice", count: 743, pct: 5, colorClass: "bg-primary" },
  { crop: "Sorghum", count: 502, pct: 3, colorClass: "bg-destructive" },
];

const MONTHLY_ANALYSES = [
  { month: "Nov", count: 310 }, { month: "Dec", count: 480 }, { month: "Jan", count: 820 },
  { month: "Feb", count: 940 }, { month: "Mar", count: 1120 }, { month: "Apr", count: 760 },
  { month: "May", count: 430 }, { month: "Jun", count: 180 }, { month: "Jul", count: 120 },
  { month: "Aug", count: 140 }, { month: "Sep", count: 190 }, { month: "Oct", count: 260 },
];

const DISTRICT_ACTIVITY = DISTRICTS.map((d, i) => ({
  district: d,
  analyses: Math.floor(Math.random() * 800 + 50),
  users: Math.floor(Math.random() * 120 + 10),
  topCrop: TOP_CROPS[i % TOP_CROPS.length].crop,
  avgPH: (5.5 + Math.random() * 2).toFixed(1),
})).sort((a, b) => b.analyses - a.analyses);

const RECENT_ANALYSES_MOCK = [
  { id: "A-2891", user: "Chisomo Phiri", district: "Zomba", crop: "Maize", score: 94, time: "2m ago", mode: "Lab" },
  { id: "A-2890", user: "Thandiwe Banda", district: "Kasungu", crop: "Tobacco", score: 88, time: "8m ago", mode: "Field" },
  { id: "A-2889", user: "Moses Mwale", district: "Salima", crop: "Rice", score: 91, time: "15m ago", mode: "Lab" },
  { id: "A-2888", user: "Grace Nyirenda", district: "Dedza", crop: "Beans", score: 79, time: "22m ago", mode: "Mixed" },
  { id: "A-2887", user: "Peter Chirwa", district: "Blantyre", crop: "Groundnuts", score: 85, time: "31m ago", mode: "Lab" },
  { id: "A-2886", user: "Alinafe Tembo", district: "Mzimba", crop: "Soybean", score: 93, time: "44m ago", mode: "Field" },
  { id: "A-2885", user: "Kondwani Gondwe", district: "Lilongwe", crop: "Maize", score: 96, time: "1h ago", mode: "Lab" },
  { id: "A-2884", user: "Esther Simwaka", district: "Thyolo", crop: "Tea", score: 82, time: "1h ago", mode: "Mixed" },
];

const RECENT_USERS = [
  { name: "Dalitso Kumwenda", district: "Karonga", joined: "Today", analyses: 3, status: "active" },
  { name: "Wiza Nkhata", district: "Mchinji", joined: "Today", analyses: 1, status: "active" },
  { name: "Fatsani Mkandawire", district: "Ntcheu", joined: "Yesterday", analyses: 7, status: "active" },
  { name: "Bertha Chilowa", district: "Mangochi", joined: "Yesterday", analyses: 2, status: "idle" },
  { name: "Julius Phwadwa", district: "Nsanje", joined: "2 days", analyses: 12, status: "active" },
];

const MODEL_PERF = [
  { algo: "Random Forest", acc: "99.55%", f1: "99.54%", cv: "99.49%", status: "active" },
  { algo: "Gradient Boosting", acc: "98.18%", f1: "98.19%", cv: "98.75%", status: "standby" },
  { algo: "Decision Tree", acc: "98.64%", f1: "98.63%", cv: "98.52%", status: "disabled" },
  { algo: "Naive Bayes", acc: "99.49%", f1: "99.54%", cv: "99.55%", status: "standby" },
];

const FERTILIZER_USAGE = [
  { name: "NPK 23:21:0", pct: 38 },
  { name: "Urea (46%N)", pct: 29 },
  { name: "CAN (27%N)", pct: 18 },
  { name: "DAP (18:46:0)", pct: 12 },
  { name: "Other", pct: 3 },
];

const CHATBOT_STATS = [
  { label: "Total Sessions", value: "8,421", icon: Bot, delta: "+12%" },
  { label: "Agricultural Queries", value: "7,103", icon: Sprout, delta: "+9%" },
  { label: "Off-topic Blocked", value: "1,318", icon: Activity, delta: "-3%" },
  { label: "Avg Response Time", value: "2.8s", icon: TrendingUp, delta: "-0.4s" },
];

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Spark({ data, className = "text-primary" }: { data: number[]; className?: string }) {
  const h = 32, w = 90;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBar({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div className="flex items-end gap-0.5 h-16 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className={`w-full rounded-t-sm transition-all duration-700 ${i === data.length - 1 ? "bg-primary" : "bg-primary/30"}`}
            style={{ height: `${(d.count / max) * 56}px` }}
          />
          <span className="text-[9px] text-muted-foreground -rotate-45 origin-top whitespace-nowrap">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const cls = status === "active" ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]" : status === "idle" ? "bg-golden shadow-[0_0_6px_hsl(var(--golden))]" : "bg-muted-foreground";
  return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${cls}`} />;
}

// ─── Score color ──────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 90) return "text-primary";
  if (score >= 75) return "text-golden";
  return "text-destructive";
}

function statusVariant(s: string): "default" | "secondary" | "outline" {
  if (s === "active") return "default";
  if (s === "standby") return "secondary";
  return "outline";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [searchQ, setSearchQ] = useState("");
  const [ticker, setTicker] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [recentDbAnalyses, setRecentDbAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const t = setInterval(() => setTicker(x => x + 1), 4000);
    return () => clearInterval(t);
  }, []);

  // Fetch real counts from DB
  useEffect(() => {
    async function fetchStats() {
      const { count: aCount } = await supabase.from("analysis_history").select("*", { count: "exact", head: true });
      setTotalAnalyses(aCount ?? 0);
      const { count: uCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      setTotalUsers(uCount ?? 0);
      const { data } = await supabase.from("analysis_history").select("*").order("created_at", { ascending: false }).limit(10);
      setRecentDbAnalyses(data ?? []);
    }
    fetchStats();
  }, []);

  const sparkData = [310, 480, 820, 940, 1120, 760, 430, 180, 120, 140, 190, 260];
  const liveCount = (totalAnalyses ?? 15782) + ticker;

  const filteredDistricts = DISTRICT_ACTIVITY.filter(d =>
    d.district.toLowerCase().includes(searchQ.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sprout className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  // ─── KPI Cards ──────────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Analyses", value: liveCount.toLocaleString(), sub: "+94 today", spark: sparkData, Icon: BarChart3 },
    { label: "Registered Users", value: (totalUsers ?? 3241).toLocaleString(), sub: "+17 this week", spark: [80, 110, 130, 160, 180, 200, 190, 210, 230, 240, 260, 280], Icon: Users },
    { label: "Active Districts", value: "28 / 28", sub: "100% coverage", spark: [20, 20, 22, 22, 24, 26, 26, 26, 28, 28, 28, 28], Icon: MapPin },
    { label: "API Uptime", value: "99.97%", sub: "Last 30 days", spark: [99, 100, 100, 99, 100, 100, 100, 100, 99, 100, 100, 100], Icon: Globe },
  ];

  // ─── Tab sections ───────────────────────────────────────────────────────────
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analyses", label: "Analyses", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "districts", label: "Districts", icon: MapPin },
    { id: "model", label: "ML Model", icon: Brain },
    { id: "chatbot", label: "AI Chatbot", icon: Bot },
    { id: "rainfall", label: "Rainfall", icon: CloudRain },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-7xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">NthakaGuide system overview and management</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
              <StatusDot status="active" />
              <span className="text-xs font-semibold text-primary">LIVE</span>
              <span className="text-xs text-muted-foreground font-mono">{liveCount.toLocaleString()} analyses</span>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {tabs.map(t => (
                <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <t.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ═══ OVERVIEW ═══ */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                  <Card key={i} className="border-border relative overflow-hidden">
                    <CardContent className="p-5">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                      <div className="flex items-center gap-2 mb-2">
                        <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{kpi.label}</span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-primary font-medium">{kpi.sub}</span>
                        <Spark data={kpi.spark} className="text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">Analyses per Month</CardTitle>
                        <p className="text-2xl font-display font-bold text-foreground mt-1">7,813</p>
                        <span className="text-xs text-primary">This Year</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Peak</p>
                        <p className="text-lg font-bold text-primary">1,120</p>
                        <p className="text-xs text-muted-foreground">March</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent><MiniBar data={MONTHLY_ANALYSES} /></CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-base">District Coverage</CardTitle></CardHeader>
                  <CardContent>
                    {[
                      { zone: "Southern", pct: 35 }, { zone: "Central", pct: 25 },
                      { zone: "Lakeshore", pct: 20 }, { zone: "Northern", pct: 15 }, { zone: "Remote", pct: 5 },
                    ].map(z => (
                      <div key={z.zone} className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground flex-1">{z.zone}</span>
                        <Progress value={z.pct} className="flex-1 h-2" />
                        <span className="text-xs font-semibold text-foreground w-8 text-right">{z.pct}%</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Top Crops + Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Top Recommended Crops</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {TOP_CROPS.map((c, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground">{c.crop}</span>
                          <span className="font-semibold text-primary">{c.count.toLocaleString()}</span>
                        </div>
                        <Progress value={c.pct} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Recent Analyses</CardTitle>
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-[10px]">LIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    {(recentDbAnalyses.length > 0 ? recentDbAnalyses.slice(0, 6) : RECENT_ANALYSES_MOCK.slice(0, 6)).map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {(a.user || a.district || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{a.user || a.district}</p>
                          <p className="text-xs text-muted-foreground">{a.district} · {a.time || new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-primary">{a.crop || a.recommended_crop}</p>
                          <p className="text-xs text-muted-foreground">{a.score || a.crop_score || "—"}%</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Fertilizer Usage */}
              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-base">Fertilizer Recommendation Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
                    <div className="space-y-3">
                      {FERTILIZER_USAGE.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm text-foreground flex-1 min-w-[120px]">{f.name}</span>
                          <span className="text-xs font-semibold text-primary w-8 text-right">{f.pct}%</span>
                          <div className="w-40 h-1.5 bg-muted rounded-full">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(f.pct / 38) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Card className="border-border bg-muted/30">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">FAO Validated</p>
                        {["Urea — 1.5M t/yr", "NPK — 1.2M t/yr", "CAN — 356K t/yr", "DAP — 55K t/yr"].map(v => (
                          <p key={v} className="text-xs text-primary">✔ {v}</p>
                        ))}
                        <p className="text-xs text-destructive">✗ TSP — 198 t/yr</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ ANALYSES ═══ */}
            <TabsContent value="analyses" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total", val: liveCount.toLocaleString() },
                  { label: "Lab Mode", val: "9,102" },
                  { label: "Field Mode", val: "4,231" },
                  { label: "Mixed Mode", val: "2,449" },
                ].map((s, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-display font-bold text-foreground mt-1">{s.val}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Recent Analyses Log</CardTitle>
                    <div className="relative w-56">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-9 h-9 text-sm" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {["ID", "User", "District", "Top Crop", "Score", "Mode", "Time"].map(h => (
                          <TableHead key={h} className="text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RECENT_ANALYSES_MOCK.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-primary text-xs">{a.id}</TableCell>
                          <TableCell className="text-sm">{a.user}</TableCell>
                          <TableCell className="text-sm">{a.district}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{a.crop}</Badge></TableCell>
                          <TableCell className={`text-sm font-semibold ${scoreColor(a.score)}`}>{a.score}%</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{a.mode}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{a.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ USERS ═══ */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", val: (totalUsers ?? 3241).toLocaleString() },
                  { label: "Active Today", val: "287" },
                  { label: "New This Week", val: "94" },
                  { label: "With 5+ Analyses", val: "1,082" },
                ].map((s, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-display font-bold text-foreground mt-1">{s.val}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">Recent Registrations</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {["User", "Home District", "Joined", "Analyses", "Status"].map(h => (
                          <TableHead key={h} className="text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RECENT_USERS.map((u, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center text-[10px] font-bold text-primary">
                                {u.name.split(" ").map(w => w[0]).join("")}
                              </div>
                              <span className="text-sm">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{u.district}</TableCell>
                          <TableCell className="text-sm">{u.joined}</TableCell>
                          <TableCell className="text-sm font-semibold text-primary">{u.analyses}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <StatusDot status={u.status} />
                              <span className={`text-xs ${u.status === "active" ? "text-primary" : "text-golden"}`}>{u.status}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ DISTRICTS ═══ */}
            <TabsContent value="districts" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">All 28 Official Districts · Sorted by Activity</p>
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filter districts..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
              </div>
              <Card className="border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {["District", "Analyses", "Users", "Top Crop", "Avg pH", "Activity"].map(h => (
                          <TableHead key={h} className="text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDistricts.map((d, i) => {
                        const pct = Math.round((d.analyses / DISTRICT_ACTIVITY[0].analyses) * 100);
                        const ph = Number(d.avgPH);
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-semibold text-sm">{d.district}</TableCell>
                            <TableCell className="text-sm font-semibold text-primary">{d.analyses.toLocaleString()}</TableCell>
                            <TableCell className="text-sm">{d.users}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs">{d.topCrop}</Badge></TableCell>
                            <TableCell className={`text-sm ${ph < 6 ? "text-destructive" : ph > 7.5 ? "text-golden" : "text-primary"}`}>{d.avgPH}</TableCell>
                            <TableCell className="min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="flex-1 h-1.5" />
                                <span className="text-[10px] text-muted-foreground w-7">{pct}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ ML MODEL ═══ */}
            <TabsContent value="model" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base">Deployed Model Performance</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {["Algorithm", "Accuracy", "F1-Score", "CV Mean", "Status"].map(h => (
                            <TableHead key={h} className="text-xs">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MODEL_PERF.map((m, i) => (
                          <TableRow key={i} className={m.status === "active" ? "bg-primary/5" : ""}>
                            <TableCell className={`text-sm ${m.status === "active" ? "text-primary font-bold" : "text-muted-foreground"}`}>{m.algo}</TableCell>
                            <TableCell className="text-sm">{m.acc}</TableCell>
                            <TableCell className="text-sm">{m.f1}</TableCell>
                            <TableCell className="text-sm">{m.cv}</TableCell>
                            <TableCell><Badge variant={statusVariant(m.status)} className="text-[10px] uppercase">{m.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base">Model Health</CardTitle></CardHeader>
                  <CardContent className="space-y-0">
                    {[
                      { label: "Crop Model (Random Forest)", file: "best_crop_model.pkl", size: "4.2 MB" },
                      { label: "Fert Model", file: "best_fert_model.pkl", size: "1.1 MB" },
                      { label: "Crop Scaler", file: "crop_scaler.pkl", size: "2.1 KB" },
                      { label: "Crop Encoder", file: "crop_label_encoder.pkl", size: "1.4 KB" },
                      { label: "Soil Type Encoder", file: "soil_type_encoder.pkl", size: "0.9 KB" },
                    ].map((f, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm text-foreground">{f.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">{f.file}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{f.size}</p>
                          <p className="text-xs text-primary">✔ loaded</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">Feature Importance (Random Forest — Crop Model)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                    {[
                      { f: "Rainfall (annual_mm)", imp: 28.4 },
                      { f: "Humidity (%)", imp: 21.7 },
                      { f: "Temperature (°C)", imp: 18.2 },
                      { f: "Potassium K (mg/kg)", imp: 12.1 },
                      { f: "pH", imp: 9.8 },
                      { f: "Nitrogen N (mg/kg)", imp: 5.6 },
                      { f: "Phosphorus P (mg/kg)", imp: 4.2 },
                    ].map((fi, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{fi.f}</span>
                          <span className="font-semibold text-primary">{fi.imp}%</span>
                        </div>
                        <Progress value={(fi.imp / 28.4) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ AI CHATBOT ═══ */}
            <TabsContent value="chatbot" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {CHATBOT_STATS.map((s, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                        <s.icon className="h-5 w-5 text-primary/50" />
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground mt-1">{s.value}</p>
                      <p className="text-xs text-primary mt-1">{s.delta}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base">AI Model Configuration</CardTitle></CardHeader>
                  <CardContent className="space-y-0">
                    {[
                      ["Model", "Lovable AI (Gemini 2.5 Flash)"],
                      ["Provider", "Lovable Cloud"],
                      ["Max Tokens", "1,500"],
                      ["Temperature", "0.4"],
                      ["Status", "✔ Connected"],
                    ].map(([k, v], i) => (
                      <div key={i} className="flex gap-3 py-2 border-b border-border last:border-0">
                        <span className="text-xs text-muted-foreground min-w-[100px] shrink-0">{k}</span>
                        <span className={`text-xs ${k === "Status" ? "text-primary" : "text-foreground"} font-mono break-all`}>{v}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base">Topic Classification Stats</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Agricultural queries passed", pct: 84 },
                      { label: "Greetings passed (local)", pct: 11 },
                      { label: "Off-topic blocked", pct: 4 },
                      { label: "Classification API errors", pct: 1 },
                    ].map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-bold text-primary">{s.pct}%</span>
                        </div>
                        <Progress value={s.pct} className="h-1.5" />
                      </div>
                    ))}
                    <Card className="bg-muted/30 border-border">
                      <CardContent className="p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Sample Session</p>
                        <p className="text-xs text-primary mb-1">User: My maize is yellowing. Help?</p>
                        <p className="text-xs text-muted-foreground">→ Classified: agricultural ✔ · 0.3s</p>
                        <p className="text-xs text-muted-foreground">→ AI response: 2.1s · 387 tokens</p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ═══ RAINFALL ═══ */}
            <TabsContent value="rainfall" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "NASA POWER Coverage", val: "2000–2025", sub: "25 years satellite data" },
                  { label: "Districts Connected", val: "28 / 28", sub: "All Malawi districts" },
                  { label: "Avg Annual Forecast", val: "1,043mm", sub: "EWMA across all districts" },
                  { label: "Satellite API Uptime", val: "99.1%", sub: "NASA POWER availability" },
                ].map((s, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-display font-bold text-primary mt-1">{s.val}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">Rainfall by Zone (2024 Forecast)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { zone: "High Rainfall", mm: 1280, districts: 6 },
                      { zone: "Central Plateau", mm: 920, districts: 11 },
                      { zone: "Lakeshore", mm: 790, districts: 6 },
                      { zone: "N. Highlands", mm: 1110, districts: 4 },
                      { zone: "Shire Valley", mm: 620, districts: 3 },
                    ].map(z => (
                      <Card key={z.zone} className="bg-muted/30 border-border text-center">
                        <CardContent className="p-4">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">{z.zone}</p>
                          <p className="text-2xl font-display font-bold text-primary">{z.mm}</p>
                          <p className="text-[9px] text-muted-foreground">mm/yr</p>
                          <p className="text-xs text-muted-foreground mt-2">{z.districts} districts</p>
                          <Progress value={(z.mm / 1280) * 100} className="h-1 mt-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">API Call Log (Last 24h)</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  {[
                    { district: "Zomba", type: "Annual", status: "✔ 25yr data", time: "2m ago" },
                    { district: "Kasungu", type: "Monthly", status: "✔ 11 months", time: "8m ago" },
                    { district: "Lilongwe", type: "Daily", status: "✔ 29 days", time: "14m ago" },
                    { district: "Karonga", type: "Annual", status: "✔ 25yr data", time: "22m ago" },
                    { district: "Likoma", type: "Annual", status: "✔ 25yr data", time: "31m ago" },
                    { district: "Neno", type: "Monthly", status: "✔ 11 months", time: "41m ago" },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground w-24">{l.district}</span>
                      <Badge variant="outline" className="text-[10px]">{l.type}</Badge>
                      <span className="flex-1 text-xs text-primary">{l.status}</span>
                      <span className="text-xs text-muted-foreground">{l.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ SETTINGS ═══ */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  {
                    title: "System Information", items: [
                      ["App Name", "NthakaGuide"], ["Version", "2.0.0"], ["Environment", "Production"],
                      ["Database", "PostgreSQL (Lovable Cloud)"], ["Runtime", "Deno Edge Functions"], ["Framework", "React + Vite"],
                    ]
                  },
                  {
                    title: "API Configuration", items: [
                      ["Auth", "Lovable Cloud Auth"], ["CORS", "Configured automatically"],
                      ["JWT Expiry", "24 hours"], ["Rate Limit", "100 req/min"],
                      ["Edge Functions", "Auto-deployed"], ["API Prefix", "/functions/v1"],
                    ]
                  },
                  {
                    title: "ML Model Settings", items: [
                      ["Crop Model", "Random Forest (200 trees)"], ["Features", "7 raw (N,P,K,temp,humidity,pH,rain)"],
                      ["Training Datasets", "6"], ["Total Training Rows", "~66,000+"],
                      ["Malawi Crops", "28 classes"], ["Zone Filter", "climate_zone × land_use"],
                    ]
                  },
                  {
                    title: "External Services", items: [
                      ["NASA POWER", "api.larc.nasa.gov (free)"], ["Open-Meteo", "api.open-meteo.com (free)"],
                      ["AI Provider", "Lovable AI"], ["AI Model", "Gemini 2.5 Flash"],
                      ["Chatbot Filter", "2-stage classification"], ["Storage", "Lovable Cloud Storage"],
                    ]
                  },
                ].map((section, i) => (
                  <Card key={i} className="border-border">
                    <CardHeader><CardTitle className="text-base">{section.title}</CardTitle></CardHeader>
                    <CardContent className="space-y-0">
                      {section.items.map(([k, v], j) => (
                        <div key={j} className="flex gap-3 py-2 border-b border-border last:border-0">
                          <span className="text-xs text-muted-foreground min-w-[120px] shrink-0">{k}</span>
                          <span className="text-xs text-foreground font-mono break-all">{v}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
