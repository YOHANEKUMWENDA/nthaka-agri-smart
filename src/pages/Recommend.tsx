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
import { Mountain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Recommend() {
  const [result, setResult] = useState<Recommendation | null>(null);
  const [input, setInput] = useState<SoilInput | null>(null);
  const [district, setDistrict] = useState("");

  const handleLabSubmit = (data: SoilInput) => {
    setInput(data);
    setResult(generateRecommendations(data));
  };

  const handleFieldComplete = (answers: { [step: number]: string }) => {
    const d = getDistrictByName(district);
    if (!d) return;
    const vals = fieldAnswersToSoilValues(answers);
    const soilInput: SoilInput = { ...vals, district: d };
    setInput(soilInput);
    setResult(generateRecommendations(soilInput));
  };

  const handleComboSubmit = (vals: {
    nitrogen: number; phosphorus: number; potassium: number;
    ph: number; moisture: number; temperature: number; organicMatter: number;
  }) => {
    const d = getDistrictByName(district);
    if (!d) return;
    const soilInput: SoilInput = { ...vals, district: d };
    setInput(soilInput);
    setResult(generateRecommendations(soilInput));
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

        {result && input ? (
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
              {/* District selector for field/combo modes */}
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
