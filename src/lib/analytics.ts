// Google Analytics conversion tracking
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function initConversionTracking() {
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest("a, button");
    if (!target) return;

    const href =
      target.getAttribute("href") ||
      target.getAttribute("data-href") ||
      "";

    // Check onclick/window.open patterns via the element's click handler
    const isWhatsApp =
      href.includes("wa.me") || href.includes("api.whatsapp.com");
    const isCall = href.startsWith("tel:");

    if (isWhatsApp) {
      window.gtag?.("event", "whatsapp_click", {
        event_category: "engagement",
        event_label: href,
      });
    } else if (isCall) {
      window.gtag?.("event", "call_click", {
        event_category: "engagement",
        event_label: href,
      });
    }
  });

  // Also intercept window.open calls for WhatsApp/tel links
  const originalOpen = window.open;
  window.open = function (...args) {
    const url = String(args[0] || "");
    if (url.includes("wa.me") || url.includes("api.whatsapp.com")) {
      window.gtag?.("event", "whatsapp_click", {
        event_category: "engagement",
        event_label: url,
      });
    } else if (url.startsWith("tel:")) {
      window.gtag?.("event", "call_click", {
        event_category: "engagement",
        event_label: url,
      });
    }
    return originalOpen.apply(this, args);
  };
}
