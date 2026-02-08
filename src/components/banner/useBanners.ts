import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Banner } from "./types";

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const isBannerCurrentlyActive = useCallback((banner: Banner): boolean => {
    // Check is_active toggle first
    if (!banner.is_active) {
      return false;
    }

    // Get current LOCAL date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Check date range - if dates are set, enforce them
    if (banner.start_date && currentDate < banner.start_date) {
      console.log(`[Banner "${banner.title}"] Scheduled for future: starts ${banner.start_date}`);
      return false;
    }
    if (banner.end_date && currentDate > banner.end_date) {
      console.log(`[Banner "${banner.title}"] Expired: ended ${banner.end_date}`);
      return false;
    }
    
    // Check time range only if BOTH start and end times are set
    if (banner.start_time && banner.end_time) {
      const startTime = banner.start_time.substring(0, 5);
      const endTime = banner.end_time.substring(0, 5);
      
      if (currentTime < startTime || currentTime > endTime) {
        console.log(`[Banner "${banner.title}"] Outside time window: ${startTime}-${endTime}, current: ${currentTime}`);
        return false;
      }
    }

    console.log(`[Banner] ✓ Active: "${banner.title}" | Date: ${currentDate}, Time: ${currentTime}`);
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

      // Filter banners based on schedule
      const activeBanners = (data || []).filter(isBannerCurrentlyActive);
      console.log(`[BannerSlider] ${activeBanners.length} active out of ${data?.length || 0} banners`);
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

  // Periodic refresh to handle time-based visibility changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBanners();
    }, 60000); // Refresh every minute for time-based scheduling

    return () => clearInterval(interval);
  }, [fetchBanners]);

  return { banners, loading };
}
