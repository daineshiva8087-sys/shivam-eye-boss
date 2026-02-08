import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Banner } from "./types";

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const isBannerCurrentlyActive = useCallback((banner: Banner): boolean => {
    if (!banner.is_active) {
      console.log(`[Banner ${banner.id}] Inactive: is_active=false`);
      return false;
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    console.log(`[Banner ${banner.id}] Checking: currentDate=${currentDate}, currentTime=${currentTime}`);
    console.log(`[Banner ${banner.id}] Schedule: start_date=${banner.start_date}, end_date=${banner.end_date}, start_time=${banner.start_time}, end_time=${banner.end_time}`);

    // Check date range - if dates are set, enforce them
    if (banner.start_date && currentDate < banner.start_date) {
      console.log(`[Banner ${banner.id}] Inactive: before start_date`);
      return false;
    }
    if (banner.end_date && currentDate > banner.end_date) {
      console.log(`[Banner ${banner.id}] Inactive: after end_date`);
      return false;
    }
    
    // Check time range only if BOTH are set
    if (banner.start_time && banner.end_time) {
      if (currentTime < banner.start_time || currentTime > banner.end_time) {
        console.log(`[Banner ${banner.id}] Inactive: outside time window`);
        return false;
      }
    }

    console.log(`[Banner ${banner.id}] ACTIVE`);
    return true;
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      const activeBanners = (data || []).filter(isBannerCurrentlyActive);
      console.log("[BannerSlider] Loaded banners:", activeBanners.length, "active out of", data?.length || 0);
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

  return { banners, loading };
}
