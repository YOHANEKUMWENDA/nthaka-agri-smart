import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Recommendation, SoilInput } from "@/lib/recommendations";
import { generatePDFReport } from "@/lib/pdf-report";
import { Download, CloudRain, Sprout, FlaskConical, FileText, ArrowLeft, AlertTriangle, CheckCircle, Info, Cpu, ListChecks } from "lucide-react";

interface Props {
  result: Recommendation;
  input: SoilInput;
  onBack: () => void;
}

export default function RecommendationResults({ result, input, onBack }: Props) {
  const alertIcon = (type: string) => {
    if (type === "danger") return <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />;
    if (type === "warning") return <AlertTriangle className="h-4 w-4 text-accent-foreground shrink-0" />;
    return <Info className="h-4 w-4 text-primary shrink-0" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> New Analysis
        </Button>
        <Button
          onClick={() => generatePDFReport(input, result)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-golden"
        >
          <Download className="mr-2 h-4 w-4" /> Download PDF Report
        </Button>
      </div>

      {/* ML Prediction Badge */}
      {result.mlPrediction && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                ML Model Prediction: <span className="text-primary">{result.mlPrediction.crop}</span>
                <span className="text-muted-foreground ml-2">({result.mlPrediction.confidence}% confidence)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Algorithm: {result.mlPrediction.algorithm}
                {result.mlPrediction.alternatives.length > 0 && (
                  <> · Alternatives: {result.mlPrediction.alternatives.map(a => a.crop).join(", ")}</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rainfall & Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-body font-semibold text-muted-foreground flex items-center gap-2">
              <CloudRain className="h-4 w-4" /> Rainfall Forecast — {input.district.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-foreground">{result.forecastedRainfall} mm</p>
            <div className="flex gap-2 mt-2">
              <Badge
                variant={result.rainfallCategory === "High" ? "default" : result.rainfallCategory === "Low" ? "destructive" : "secondary"}
              >
                {result.rainfallCategory} Rainfall
              </Badge>
              <Badge variant="outline">{result.rainfallBand}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{result.rainfallBandDescription}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-body font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Soil Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{result.soilAssessment}</p>
          </CardContent>
        </Card>
      </div>

      {/* Soil Alerts */}
      {result.soilAlerts && result.soilAlerts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" /> Soil Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.soilAlerts.map((alert, i) => (
              <div key={i} className={`flex gap-2 items-start p-2 rounded-md text-sm ${
                alert.type === "danger" ? "bg-destructive/5 text-destructive" 
                : alert.type === "warning" ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/10 dark:text-yellow-200"
                : "bg-primary/5 text-primary"
              }`}>
                {alertIcon(alert.type)}
                <span>{alert.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Crop Recommendations */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" /> Top Crop Recommendations
        </h2>
        <div className="space-y-3">
          {result.crops.map((crop, i) => (
            <motion.div
              key={crop.crop}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card border-border hover:shadow-golden transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-3xl">{crop.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-foreground">{crop.crop}</h3>
                      <Badge variant="outline" className="shrink-0 text-xs">{crop.season}</Badge>
                    </div>
                    <Progress value={crop.score} className="h-2 mb-1.5" />
                    <p className="text-xs text-muted-foreground truncate">{crop.reason}</p>
                  </div>
                  <span className="text-lg font-bold text-primary tabular-nums">{crop.score}%</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fertilizer Plan */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" /> Fertilizer Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.fertilizers.map((f, i) => (
            <motion.div
              key={f.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-display font-bold text-foreground text-sm">{f.type}</h3>
                  <p className="text-lg font-semibold text-primary">{f.applicationRate}</p>
                  <p className="text-xs text-muted-foreground"><strong>Timing:</strong> {f.timing}</p>
                  <p className="text-xs text-muted-foreground">{f.notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rainfall-Adjusted Application Plan */}
      {result.fertilizerAdjustment && (
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" /> Rainfall-Adjusted Application Plan
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge variant="outline">Method: {result.fertilizerAdjustment.applicationMethod}</Badge>
                <Badge variant="outline">NPK: {result.fertilizerAdjustment.basalNpkKgHa} kg/ha</Badge>
                <Badge variant="outline">Urea: {result.fertilizerAdjustment.ureaKgHa} kg/ha</Badge>
                <Badge variant="outline">Splits: {result.fertilizerAdjustment.splits}</Badge>
              </div>

              {/* Step-by-step plan */}
              <div className="space-y-3">
                {result.fertilizerAdjustment.plan.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{step.timing}</p>
                      <p className="text-sm text-foreground">{step.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warnings */}
              {result.fertilizerAdjustment.warnings.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  {result.fertilizerAdjustment.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 items-start text-sm text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Organic advice */}
              <div className="flex gap-2 items-start p-3 rounded-md bg-primary/5 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">{result.fertilizerAdjustment.organicAdvice}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Bottom download */}
      <div className="text-center pt-4 pb-8">
        <Button
          onClick={() => generatePDFReport(input, result)}
          variant="outline"
          size="lg"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Download className="mr-2 h-4 w-4" /> Download Full Report (PDF)
        </Button>
      </div>
    </motion.div>
  );
}
