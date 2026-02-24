import { useState } from "react";
import { motion } from "framer-motion";
import SoilInputForm from "@/components/SoilInputForm";
import RecommendationResults from "@/components/RecommendationResults";
import { generateRecommendations, type SoilInput, type Recommendation } from "@/lib/recommendations";
import { Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Recommend() {
  const [result, setResult] = useState<Recommendation | null>(null);
  const [input, setInput] = useState<SoilInput | null>(null);

  const handleSubmit = (data: SoilInput) => {
    setInput(data);
    setResult(generateRecommendations(data));
  };

  const handleBack = () => {
    setResult(null);
    setInput(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-4xl flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 text-primary font-display font-bold text-lg">
            <Sprout className="h-5 w-5" /> NthakaGuide
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" /> Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {result ? "Your Recommendations" : "Soil Analysis"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {result
              ? `Results for ${input?.district.name} district`
              : "Enter your soil data below to receive crop and fertilizer recommendations."}
          </p>
        </motion.div>

        {result && input ? (
          <RecommendationResults result={result} input={input} onBack={handleBack} />
        ) : (
          <SoilInputForm onSubmit={handleSubmit} />
        )}
      </main>
    </div>
  );
}
