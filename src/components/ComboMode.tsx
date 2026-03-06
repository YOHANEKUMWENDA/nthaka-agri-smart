import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  onSubmit: (values: {
    nitrogen: number; phosphorus: number; potassium: number;
    ph: number; moisture: number; temperature: number; organicMatter: number;
  }) => void;
}

export default function ComboMode({ onSubmit }: Props) {
  const [ph, setPh] = useState(6.5);
  const [nitrogen, setNitrogen] = useState(80);
  const [texture, setTexture] = useState("loam");
  const [colour, setColour] = useState("medium_brown");

  const handleSubmit = () => {
    let P = 50, K = 60, moisture = 40;
    if (texture === "clay") { moisture = 70; K += 10; }
    else if (texture === "sandy_loam") { moisture = 38; K -= 15; P -= 10; }
    else if (texture === "sand") { moisture = 25; K -= 25; P -= 20; }

    if (colour === "light_brown") P = Math.max(P - 10, 15);
    else if (colour === "pale") { P = Math.max(P - 20, 10); K = Math.max(K - 20, 10); }

    const organicMatter = nitrogen > 80 ? 4.0 : nitrogen > 60 ? 2.5 : 1.5;

    onSubmit({
      nitrogen,
      phosphorus: Math.round(P),
      potassium: Math.round(K),
      ph,
      moisture: Math.round(moisture),
      temperature: 25,
      organicMatter,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">pH (from test strips)</Label>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">3.0</span>
            <span className="text-sm font-semibold text-foreground">{ph}</span>
            <span className="text-xs text-muted-foreground">9.0</span>
          </div>
          <Slider value={[ph]} onValueChange={([v]) => setPh(v)} min={3} max={9} step={0.1}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">N (kg/ha)</Label>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">0</span>
            <span className="text-sm font-semibold text-foreground">{nitrogen}</span>
            <span className="text-xs text-muted-foreground">200</span>
          </div>
          <Slider value={[nitrogen]} onValueChange={([v]) => setNitrogen(v)} min={0} max={200} step={1}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Soil texture (feel)</Label>
          <Select value={texture} onValueChange={setTexture}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="clay">Sticky, smooth when wet (Clay)</SelectItem>
              <SelectItem value="loam">Soft and workable (Loam)</SelectItem>
              <SelectItem value="sandy_loam">Slightly gritty (Sandy Loam)</SelectItem>
              <SelectItem value="sand">Very gritty (Sandy)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Soil colour</Label>
          <Select value={colour} onValueChange={setColour}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dark_black">Very dark/black</SelectItem>
              <SelectItem value="medium_brown">Medium brown</SelectItem>
              <SelectItem value="light_brown">Light brown</SelectItem>
              <SelectItem value="red">Reddish</SelectItem>
              <SelectItem value="pale">Pale/grey</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg py-6 shadow-golden" size="lg">
        🔬 Analyze Soil
      </Button>
    </div>
  );
}
