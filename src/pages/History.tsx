import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, MapPin, Sprout, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HistoryItem {
  id: string;
  district: string;
  input_mode: string;
  recommended_crop: string;
  crop_score: number | null;
  fertilizer_type: string | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  ph: number | null;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("analysis_history")
      .select("id, district, input_mode, recommended_crop, crop_score, fertilizer_type, nitrogen, phosphorus, potassium, ph, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading history", description: error.message, variant: "destructive" });
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analysis_history").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setHistory(prev => prev.filter(h => h.id !== id));
      toast({ title: "Deleted", description: "Analysis record removed." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Analysis History</h1>
          <p className="text-muted-foreground mb-8">Your previous soil analyses and recommendations</p>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No analyses yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Go to the Analyze page to run your first soil analysis.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" /> {item.district}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.input_mode} mode
                            </Badge>
                            {item.crop_score && (
                              <Badge className="bg-primary/10 text-primary text-xs">
                                {item.crop_score.toFixed(0)}% match
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Sprout className="h-4 w-4 text-primary" />
                            <span className="font-display font-bold text-foreground">{item.recommended_crop}</span>
                          </div>
                          {item.fertilizer_type && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FlaskConical className="h-3.5 w-3.5" />
                              {item.fertilizer_type}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString("en-MW", {
                              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </div>
                          {item.nitrogen !== null && (
                            <div className="text-xs text-muted-foreground">
                              N: {item.nitrogen} · P: {item.phosphorus} · K: {item.potassium} · pH: {item.ph}
                            </div>
                          )}
                        </div>
                        <div className="flex sm:flex-col items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
