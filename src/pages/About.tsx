import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CROP_MODEL = [
  { algo: "🏆 Random Forest", acc: "99.55%", f1: "99.55%", cv: "99.45% ± 0.23%", winner: true },
  { algo: "Gradient Boosting", acc: "98.86%", f1: "98.87%", cv: "99.00% ± 0.47%", winner: false },
  { algo: "Decision Tree", acc: "97.95%", f1: "97.94%", cv: "98.68% ± 0.34%", winner: false },
  { algo: "Logistic Regression", acc: "97.27%", f1: "97.25%", cv: "97.12% ± 0.99%", winner: false },
];

const FERT_MODEL = [
  { algo: "🏆 Random Forest", acc: "100.00%", f1: "100.00%", cv: "99.00% ± 2.00%", winner: true },
  { algo: "Logistic Regression", acc: "100.00%", f1: "100.00%", cv: "92.47% ± 6.25%", winner: false },
  { algo: "Decision Tree", acc: "95.00%", f1: "95.33%", cv: "99.07% ± 1.87%", winner: false },
  { algo: "Gradient Boosting", acc: "95.00%", f1: "94.73%", cv: "97.50% ± 3.13%", winner: false },
];

const FEATURE_IMP = [
  { name: "rainfall", pct: 22.0 },
  { name: "humidity", pct: 21.7 },
  { name: "K", pct: 18.1 },
  { name: "P", pct: 15.1 },
  { name: "N", pct: 10.3 },
  { name: "temperature", pct: 7.5 },
  { name: "ph", pct: 5.2 },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-6xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Model Performance</h1>
          <p className="text-muted-foreground mt-1">Real results from training on actual datasets — COM422 | UNIMA 2025/2026</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Crop Model */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Crop Recommendation Model (2,200 samples · 22 classes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="text-left py-2">Algorithm</th>
                        <th className="text-left py-2">Accuracy</th>
                        <th className="text-left py-2">F1-Score</th>
                        <th className="text-left py-2">CV (5-fold)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CROP_MODEL.map(r => (
                        <tr key={r.algo} className={`border-b border-border/50 ${r.winner ? "text-primary font-semibold" : "text-foreground"}`}>
                          <td className="py-2">{r.algo}</td>
                          <td className="py-2">{r.acc}</td>
                          <td className="py-2">{r.f1}</td>
                          <td className="py-2">{r.cv}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Fertilizer Model */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Fertilizer Prediction Model (99 samples · 7 classes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="text-left py-2">Algorithm</th>
                        <th className="text-left py-2">Accuracy</th>
                        <th className="text-left py-2">F1-Score</th>
                        <th className="text-left py-2">CV (5-fold)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FERT_MODEL.map(r => (
                        <tr key={r.algo} className={`border-b border-border/50 ${r.winner ? "text-primary font-semibold" : "text-foreground"}`}>
                          <td className="py-2">{r.algo}</td>
                          <td className="py-2">{r.acc}</td>
                          <td className="py-2">{r.f1}</td>
                          <td className="py-2">{r.cv}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 p-3 rounded-md bg-golden/10 text-sm text-foreground border border-golden/20">
                  <span className="font-semibold">ℹ️ Note:</span> The fertilizer dataset has only 99 samples. High test accuracy is expected on a small set. Cross-validation is a more reliable indicator — RF CV of 99.00% confirms it generalises well.
                </div>
              </CardContent>
            </Card>

            {/* Feature Importance */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Feature Importance — Crop Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {FEATURE_IMP.map(f => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="text-sm w-24 text-muted-foreground">{f.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(f.pct / 22) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-primary w-12 text-right">{f.pct}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">System Architecture</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>📂 <strong className="text-foreground">train_models.py</strong> — trains both models</p>
                <p>🐍 <strong className="text-foreground">app.py</strong> — Flask REST API</p>
                <p>🌐 <strong className="text-foreground">index.html</strong> — this web app</p>
                <p>📱 <strong className="text-foreground">Flutter</strong> — mobile app client</p>
                <hr className="border-border" />
                <p>📦 <strong className="text-foreground">best_crop_model.pkl</strong> — RF crop model</p>
                <p>📦 <strong className="text-foreground">best_fert_model.pkl</strong> — RF fert model</p>
                <p>📦 <strong className="text-foreground">crop_scaler.pkl</strong> — StandardScaler</p>
                <p>📦 <strong className="text-foreground">fert_scaler.pkl</strong> — StandardScaler</p>
                <p>📦 <strong className="text-foreground">*_label_encoder.pkl</strong> — LabelEncoders</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Datasets Used</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                {[
                  ["Crop", "Crop_recommendation.csv — 2,200 samples, 7 features, 22 classes"],
                  ["Fert", "Fertilizer_Prediction.csv — 99 samples, 8 features, 7 classes"],
                  ["Source", "Kaggle — openly licensed agronomic datasets"],
                  ["Split", "80/20 train/test · stratified · random_state=42"],
                  ["CV", "5-Fold cross-validation on full dataset"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 pb-2 border-b border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase w-14 shrink-0">{k}</span>
                    <span className="text-foreground">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">API Endpoints</CardTitle></CardHeader>
              <CardContent className="text-sm font-mono space-y-1">
                <p><span className="text-primary font-bold">GET</span> /</p>
                <p><span className="text-primary font-bold">GET</span> /metadata</p>
                <p><span className="text-golden font-bold">POST</span> /predict/crop</p>
                <p><span className="text-golden font-bold">POST</span> /predict/fert</p>
                <p><span className="text-golden font-bold">POST</span> /predict/full <span className="text-muted-foreground text-xs">← main</span></p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
