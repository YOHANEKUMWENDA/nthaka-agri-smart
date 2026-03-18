import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UserRound, Mail, Save, Sprout } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const email = user?.email ?? "";
  const initials = useMemo(() => {
    const source = fullName.trim() || email;
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NG";
  }, [email, fullName]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        toast({ title: "Error loading profile", description: error.message, variant: "destructive" });
      } else {
        setFullName(data?.full_name ?? user.user_metadata?.full_name ?? "");
      }

      setInitialLoading(false);
    };

    fetchProfile();
  }, [toast, user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);

    const trimmedName = fullName.trim();
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      setSaving(false);
      toast({ title: "Unable to save profile", description: fetchError.message, variant: "destructive" });
      return;
    }

    const query = existingProfile
      ? supabase.from("profiles").update({ full_name: trimmedName || null }).eq("user_id", user.id)
      : supabase.from("profiles").insert({ user_id: user.id, full_name: trimmedName || null });

    const { error } = await query;

    if (error) {
      toast({ title: "Unable to save profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your details have been saved." });
    }

    setSaving(false);
  };

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sprout className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
            <p className="mt-1 text-muted-foreground">Manage your account details for NthakaGuide.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card className="border-border">
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <Avatar className="h-20 w-20 border border-border bg-muted">
                  <AvatarFallback className="bg-primary/10 font-display text-xl font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="font-display text-xl font-bold text-foreground">{fullName.trim() || "NthakaGuide User"}</h2>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Update your personal information below.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-primary" />
                      Full name
                    </Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email address
                    </Label>
                    <Input id="email" type="email" value={email} disabled readOnly />
                  </div>

                  <Button type="submit" disabled={saving} className="bg-golden text-golden-foreground hover:bg-golden/90 font-semibold">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
