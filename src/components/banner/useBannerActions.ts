import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Banner } from "./types";

const WHATSAPP_NUMBER = "917972698618";

export function useBannerActions() {
  const navigate = useNavigate();

  const handleBannerClick = useCallback((banner: Banner) => {
    switch (banner.click_action_type) {
      case "product":
        if (banner.click_action_value) {
          // Scroll to products and dispatch event for product detail
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
          }
          // Dispatch event to open product detail modal
          window.dispatchEvent(new CustomEvent("openProductDetail", { 
            detail: { productId: banner.click_action_value } 
          }));
        }
        break;
      case "category":
        if (banner.click_action_value) {
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
          }
          window.dispatchEvent(new CustomEvent("selectCategory", { 
            detail: { category: banner.click_action_value } 
          }));
        }
        break;
      case "offers":
        navigate("/");
        setTimeout(() => {
          document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        break;
      case "services":
        navigate("/services");
        break;
      case "whatsapp":
        const message = banner.click_action_value || "Hi, I'm interested in your products";
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        break;
      case "external":
        if (banner.click_action_value) {
          window.open(banner.click_action_value, "_blank");
        }
        break;
      default:
        break;
    }
  }, [navigate]);

  return { handleBannerClick };
}
