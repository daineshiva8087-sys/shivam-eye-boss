import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Banner } from "./types";
import { isBannerVisible, getISTDateString, getISTTimeString12 } from "@/lib/timezone";

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const isBannerCurrentlyActive = useCallback((banner: Banner): boolean => {
    const visible = isBannerVisible(
      banner.is_active,
      banner.start_date,
      banner.end_date,
      banner.start_time,
      banner.end_time
    );

    if (visible) {
      console.log(`[Banner] ✓ LIVE: "${banner.title}" | IST Date: ${getISTDateString()}, Time: ${getISTTimeString12()}`);
    } else {
      console.log(`[Banner] ✗ Hidden: "${banner.title}" | IST Date: ${getISTDateString()}, Time: ${getISTTimeString12()}`);
    }

    return visible;
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Filter banners based on IST schedule
      const activeBanners = (data || []).filter(isBannerCurrentlyActive);
      console.log(`[BannerSlider] ${activeBanners.length} active out of ${data?.length || 0} banners (IST: ${getISTTimeString12()})`);
      setBanners(activeBanners);
    } catch (error) {
      console.error("[BannerSlider] Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  }, [isBannerCurrentlyActive]);

  // Initial fetch
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('banners-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banners',
        },
        (payload) => {
          console.log("[BannerSlider] Real-time update:", payload.eventType);
          fetchBanners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBanners]);

  // Periodic refresh every 30 seconds for time-based visibility changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBanners();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchBanners]);

  return { banners, loading };
}
