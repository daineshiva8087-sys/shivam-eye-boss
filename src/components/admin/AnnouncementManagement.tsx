import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Megaphone } from "lucide-react";

interface Settings {
  id: string;
  is_enabled: boolean;
  text: string;
  bg_color: string;
  text_color: string;
  scroll_speed: string;
}

export function AnnouncementManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("announcement_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) setSettings(data as Settings);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("announcement_settings")
      .update({
        is_enabled: settings.is_enabled,
        text: settings.text,
        bg_color: settings.bg_color,
        text_color: settings.text_color,
        scroll_speed: settings.scroll_speed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Announcement banner updated successfully" });
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!settings) return <p className="text-muted-foreground">No announcement settings found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">Announcement Banner</h2>
      </div>

      <div className="product-card rounded-xl p-6 space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled" className="text-base font-semibold">Enable Banner</Label>
          <Switch
            id="enabled"
            checked={settings.is_enabled}
            onCheckedChange={(v) => setSettings({ ...settings, is_enabled: v })}
          />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <Label htmlFor="text">Banner Text (Marathi supported)</Label>
          <Textarea
            id="text"
            value={settings.text}
            onChange={(e) => setSettings({ ...settings, text: e.target.value })}
            rows={3}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bg_color">Background Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="bg_color"
                value={settings.bg_color}
                onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                className="h-10 w-14 rounded border cursor-pointer"
              />
              <Input
                value={settings.bg_color}
                onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_color">Text Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="text_color"
                value={settings.text_color}
                onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                className="h-10 w-14 rounded border cursor-pointer"
              />
              <Input
                value={settings.text_color}
                onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="space-y-2">
          <Label>Scroll Speed</Label>
          <Select value={settings.scroll_speed} onValueChange={(v) => setSettings({ ...settings, scroll_speed: v })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">Slow</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="w-full overflow-hidden rounded-lg"
            style={{ backgroundColor: settings.bg_color, height: "40px" }}
          >
            <div
              className="marquee-track flex items-center h-full whitespace-nowrap font-bold text-base"
              style={{ color: settings.text_color, animationDuration: "18s" }}
            >
              <span className="px-8">{settings.text}</span>
              <span className="px-8">{settings.text}</span>
              <span className="px-8">{settings.text}</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
