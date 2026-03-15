import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function getVisitorId(): string {
  const key = "shivam_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useVisitorTracking() {
  useEffect(() => {
    const sessionKey = "shivam_visited_today";
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = sessionStorage.getItem(sessionKey);

    if (lastVisit === today) return;

    const visitorId = getVisitorId();
    sessionStorage.setItem(sessionKey, today);

    supabase
      .from("site_visits")
      .insert({ visitor_id: visitorId, page_path: window.location.pathname })
      .then(({ error }) => {
        if (error) console.error("Visit tracking error:", error);
      });
  }, []);
}
