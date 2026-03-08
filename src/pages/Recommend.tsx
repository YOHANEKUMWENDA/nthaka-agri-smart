import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavHeader from "@/components/NavHeader";
import SoilInputForm from "@/components/SoilInputForm";
import FieldAssessment, { fieldAnswersToSoilValues } from "@/components/FieldAssessment";
import ComboMode from "@/components/ComboMode";
import RecommendationResults from "@/components/RecommendationResults";
import { generateRecommendations, type SoilInput, type Recommendation } from "@/lib/recommendations";
import { getDistrictByName, MALAWI_DISTRICTS } from "@/lib/malawi-districts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mountain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Recommend() {
  const [result, setResult] = useState<Recommendation | null>(null);
  const [input, setInput] = useState<SoilInput | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("lab");
  const [district, setDistrict] = useState("");

  const saveToHistory = async (soilInput: SoilInput, rec: Recommendation, mode: string) => {
    if (!user) return;
    const topCrop = rec.crops[0];
    await supabase.from("analysis_history").insert({
      user_id: user.id,
      district: soilInput.district.name,
      nitrogen: soilInput.nitrogen,
      phosphorus: soilInput.phosphorus,
      potassium: soilInput.potassium,
      ph: soilInput.ph,
      moisture: soilInput.moisture,
      temperature: soilInput.temperature,
      organic_matter: soilInput.organicMatter,
      input_mode: mode,
      recommended_crop: topCrop?.crop || "Unknown",
      crop_score: topCrop?.score || 0,
      fertilizer_type: rec.fertilizers?.[0]?.type || null,
      result_json: rec as any,
    });
  };

  const runAnalysis = async (data: SoilInput, mode: string) => {
    setLoading(true);
    try {
      const rec = await generateRecommendations(data);
      setInput(data);
      setResult(rec);
      saveToHistory(data, rec, mode);
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLabSubmit = (data: SoilInput) => {
    runAnalysis(data, "lab");
  };

  const handleFieldComplete = (answers: { [step: number]: string }) => {
    const d = getDistrictByName(district);
    if (!d) return;
    const vals = fieldAnswersToSoilValues(answers);
    const soilInput: SoilInput = { ...vals, district: d };
    runAnalysis(soilInput, "field");
  };

  const handleComboSubmit = (vals: {
    nitrogen: number; phosphorus: number; potassium: number;
    ph: number; moisture: number; temperature: number; organicMatter: number;
  }) => {
    const d = getDistrictByName(district);
    if (!d) return;
    const soilInput: SoilInput = { ...vals, district: d };
    runAnalysis(soilInput, "combo");
  };

  const handleBack = () => {
    setResult(null);
    setInput(null);
  };

  const regions = ["Northern", "Central", "Southern"] as const;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {result ? "Your Recommendations" : "Soil Analyzer"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {result
              ? `Results for ${input?.district.name} district`
              : "Enter your soil data to get crop and fertilizer recommendations"}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-semibold">Running server-side ML analysis...</p>
            <p className="text-xs text-muted-foreground">Gaussian Naive Bayes + EWMA Rainfall Forecast</p>
          </div>
        ) : result && input ? (
          <RecommendationResults result={result} input={input} onBack={handleBack} />
        ) : (
          <Tabs defaultValue="lab" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="lab" className="font-semibold">🧪 Lab Data</TabsTrigger>
              <TabsTrigger value="field" className="font-semibold">👁️ Field</TabsTrigger>
              <TabsTrigger value="combo" className="font-semibold">🔀 Mixed</TabsTrigger>
            </TabsList>

            <TabsContent value="lab">
              <SoilInputForm onSubmit={handleLabSubmit} />
            </TabsContent>

            <TabsContent value="field" className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-display font-semibold flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-primary" /> District
                </Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select your district..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <div key={region}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{region} Region</div>
                        {MALAWI_DISTRICTS.filter(d => d.region === region).map(d => (
                          <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {district ? (
                <FieldAssessment onComplete={handleFieldComplete} />
              ) : (
                <p className="text-muted-foreground text-center py-8">Select a district first to begin field assessment.</p>
              )}
            </TabsContent>

            <TabsContent value="combo" className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-display font-semibold flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-primary" /> District
                </Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select your district..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <div key={region}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{region} Region</div>
                        {MALAWI_DISTRICTS.filter(d => d.region === region).map(d => (
                          <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {district ? (
                <ComboMode onSubmit={handleComboSubmit} />
              ) : (
                <p className="text-muted-foreground text-center py-8">Select a district first.</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
