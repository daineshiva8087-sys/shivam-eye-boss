import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementSettings {
  is_enabled: boolean;
  text: string;
  bg_color: string;
  text_color: string;
  scroll_speed: string;
}

const speedMap: Record<string, string> = {
  slow: "30s",
  normal: "18s",
  fast: "10s",
};

export function AnnouncementMarquee() {
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("announcement_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) setSettings(data as AnnouncementSettings);
    };
    fetch();

    const channel = supabase
      .channel("announcement_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcement_settings" }, (payload) => {
        if (payload.new) setSettings(payload.new as AnnouncementSettings);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!settings || !settings.is_enabled) return null;

  const duration = speedMap[settings.scroll_speed] || speedMap.normal;

  return (
    <div
      className="w-full overflow-hidden select-none"
      style={{
        backgroundColor: settings.bg_color,
        height: "40px",
      }}
    >
      <div
        className="marquee-track flex items-center h-full whitespace-nowrap font-bold text-base md:text-lg"
        style={{
          color: settings.text_color,
          animationDuration: duration,
        }}
      >
        <span className="px-8">{settings.text}</span>
        <span className="px-8">{settings.text}</span>
        <span className="px-8">{settings.text}</span>
        <span className="px-8">{settings.text}</span>
      </div>
    </div>
  );
}
