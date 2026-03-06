import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FieldAnswers {
  [step: number]: string;
}

interface Props {
  onComplete: (answers: FieldAnswers) => void;
}

const QUESTIONS = [
  {
    question: "What colour is your soil?",
    options: [
      { value: "dark_black", icon: "⬛", main: "Very dark black / deep brown", sub: "High organic matter ~4–5.5%" },
      { value: "medium_brown", icon: "🟫", main: "Medium brown", sub: "Moderate fertility ~1.5–3%" },
      { value: "light_brown", icon: "🏜️", main: "Light brown / yellowish", sub: "Lower fertility ~0.8–1.5%" },
      { value: "red", icon: "🔴", main: "Reddish / orange-red", sub: "Iron-rich laterite — acidic" },
      { value: "pale", icon: "⬜", main: "Pale grey / whitish", sub: "Sandy, very low nutrients" },
    ],
  },
  {
    question: "Roll moist soil between fingers. What forms?",
    options: [
      { value: "clay", icon: "🏺", main: "Long smooth ribbon (5cm+)", sub: "Clay — retains water and nutrients" },
      { value: "loam", icon: "🌱", main: "Short crumbly ribbon (2–4cm)", sub: "Loam — ideal for most crops" },
      { value: "sandy_loam", icon: "🏖️", main: "Barely forms, feels gritty", sub: "Sandy loam — drains quickly" },
      { value: "sand", icon: "🏝️", main: "Falls apart completely", sub: "Sandy — poor water retention" },
    ],
  },
  {
    question: "Pour water on bare soil. What happens in 30 seconds?",
    options: [
      { value: "fast", icon: "💨", main: "Soaks in under 10 seconds", sub: "Very good drainage" },
      { value: "moderate", icon: "✅", main: "Soaks in over 10–30 seconds", sub: "Good — ideal moisture balance" },
      { value: "slow", icon: "🐌", main: "Sits on surface for 1+ minute", sub: "Poor drainage — waterlogging risk" },
      { value: "runoff", icon: "🌊", main: "Mostly runs off, hard crust", sub: "Compaction — erosion risk" },
    ],
  },
  {
    question: "What signs did you see in your last crop?",
    options: [
      { value: "yellow_leaves", icon: "🍂", main: "Yellowing leaves", sub: "Nitrogen deficiency" },
      { value: "purple_stems", icon: "🟣", main: "Purple or reddish stems", sub: "Phosphorus deficiency" },
      { value: "brown_edges", icon: "🍁", main: "Brown leaf edges", sub: "Potassium deficiency" },
      { value: "stunted", icon: "🌿", main: "Stunted despite good rain", sub: "pH problem likely" },
      { value: "healthy", icon: "💚", main: "Crops looked healthy", sub: "Soil in reasonably good condition" },
    ],
  },
  {
    question: "Smell a handful of moist soil. What do you notice?",
    options: [
      { value: "earthy", icon: "🌍", main: "Fresh earthy smell", sub: "Excellent — active biological life" },
      { value: "mild", icon: "😐", main: "Mild, not distinctive", sub: "Moderate soil health" },
      { value: "sour", icon: "😷", main: "Sour or fermented smell", sub: "Waterlogging or acidity" },
      { value: "none", icon: "🫙", main: "No smell at all", sub: "Low biological activity" },
    ],
  },
  {
    question: "What is the history of this land?",
    options: [
      { value: "virgin", icon: "🌳", main: "Newly cleared forest or bush", sub: "High organic matter, possibly acidic" },
      { value: "rotated", icon: "🔄", main: "Rotated with legumes recently", sub: "Good N from biological fixation" },
      { value: "continuous", icon: "🌽", main: "Continuous maize 3+ seasons", sub: "Likely N-depleted and acidic" },
      { value: "fallow", icon: "🍃", main: "Left fallow 1–2 seasons", sub: "Recovering — moderate fertility" },
      { value: "degraded", icon: "⛰️", main: "Eroded or degraded land", sub: "Severely depleted soil" },
    ],
  },
];

export default function FieldAssessment({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FieldAnswers>({});

  const q = QUESTIONS[step];

  const select = (value: string) => {
    setAnswers(prev => ({ ...prev, [step + 1]: value }));
  };

  const next = () => {
    if (step < QUESTIONS.length - 1) setStep(s => s + 1);
  };
  const back = () => setStep(s => Math.max(0, s - 1));
  const submit = () => onComplete(answers);

  const isLast = step === QUESTIONS.length - 1;
  const hasAnswer = !!answers[step + 1];

  return (
    <div className="space-y-6">
      <Progress value={((step + 1) / QUESTIONS.length) * 100} className="h-1.5" />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Step {step + 1} of {QUESTIONS.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  answers[step + 1] === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-2xl shrink-0">{opt.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${answers[step + 1] === opt.value ? "text-primary" : "text-foreground"}`}>{opt.main}</p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={back} className="border-border">← Back</Button>
        )}
        {isLast ? (
          <Button onClick={submit} disabled={!hasAnswer} className="flex-1 bg-primary text-primary-foreground">
            🔬 Analyze
          </Button>
        ) : (
          <Button onClick={next} disabled={!hasAnswer} className="flex-1 bg-primary text-primary-foreground">
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}

/** Convert field assessment answers to soil input values */
export function fieldAnswersToSoilValues(answers: { [step: number]: string }) {
  let N = 80, P = 45, K = 55, ph = 6.2, moisture = 40;

  // Q1: Colour → organic matter, N
  if (answers[1] === "dark_black") N = 95;
  else if (answers[1] === "medium_brown") N = 75;
  else if (answers[1] === "light_brown") N = 55;
  else if (answers[1] === "red") { ph = 5.4; N = 60; }
  else if (answers[1] === "pale") { N = 35; P = 25; K = 30; }

  // Q2: Texture → moisture, K, P
  if (answers[2] === "clay") { moisture = 65; K += 15; P += 10; }
  else if (answers[2] === "sandy_loam") { moisture = 35; K -= 15; P -= 10; }
  else if (answers[2] === "sand") { moisture = 25; K -= 25; P -= 20; N -= 20; }

  // Q3: Drainage → moisture
  if (answers[3] === "fast") moisture = 25;
  else if (answers[3] === "moderate") moisture = 42;
  else if (answers[3] === "slow") moisture = 65;

  // Q4: Symptoms
  if (answers[4] === "yellow_leaves") N = Math.max(15, N - 35);
  else if (answers[4] === "purple_stems") P = Math.max(10, P - 25);
  else if (answers[4] === "brown_edges") K = Math.max(10, K - 25);
  else if (answers[4] === "stunted") ph = Math.min(5.2, ph);
  else if (answers[4] === "healthy") N = Math.min(N + 10, 130);

  // Q5: Smell
  if (answers[5] === "sour") ph = Math.min(ph - 0.5, 5.0);

  // Q6: History
  if (answers[6] === "rotated") N = Math.min(N + 20, 130);
  else if (answers[6] === "continuous") N = Math.max(N - 30, 20);
  else if (answers[6] === "degraded") { N = Math.max(N - 40, 10); P = Math.max(P - 20, 10); }

  const organicMatter = N > 80 ? 4.5 : N > 60 ? 3.0 : N > 40 ? 1.8 : 1.0;

  return {
    nitrogen: Math.round(N),
    phosphorus: Math.round(P),
    potassium: Math.round(K),
    ph: Math.round(ph * 10) / 10,
    moisture: Math.round(moisture),
    temperature: 25,
    organicMatter,
  };
}
