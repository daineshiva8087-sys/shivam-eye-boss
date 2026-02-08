import { useState, useEffect, useMemo } from "react";
import { Product, supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { QuotationModal } from "@/components/QuotationModal";
import { ServiceModal } from "@/components/ServiceModal";
import { FloatingButtons } from "@/components/FloatingButtons";
import { OfferBanner } from "@/components/OfferBanner";
import { OfferPopup } from "@/components/OfferPopup";
import { ComboSection } from "@/components/ComboSection";
import { ServiceChargesSection } from "@/components/ServiceChargesSection";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { AboutSection } from "@/components/AboutSection";
import { BannerSlider } from "@/components/BannerSlider";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2, Camera, Wrench, Shield, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();

    // Listen for category selection from banner clicks
    const handleCategorySelect = (e: CustomEvent<{ category: string }>) => {
      setSelectedCategory(e.detail.category);
      setSearchQuery("");
    };

    window.addEventListener("selectCategory", handleCategorySelect as EventListener);
    return () => {
      window.removeEventListener("selectCategory", handleCategorySelect as EventListener);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedProducts = (data || []).map(item => ({
        ...item,
        category: item.category as string,
        price: Number(item.price),
        discount_percentage: Number(item.discount_percentage || 0),
        discounted_price: Number(item.discounted_price || item.price),
      }));

      setProducts(typedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically derive categories from products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    let filtered = selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // Parse price keywords like "under 2000", "below 3000"
      const priceMatch = query.match(/(?:under|below|less than)\s*(\d+)/i);
      const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;
      
      filtered = filtered.filter((product) => {
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        const description = (product.description || "").toLowerCase();
        const price = product.discounted_price || product.price;
        
        // Check if query matches name, category, or description
        const textMatch = 
          name.includes(query) ||
          category.includes(query) ||
          description.includes(query) ||
          // Common search terms mapping
          (query.includes("bullet") && category.includes("bullet")) ||
          (query.includes("dome") && category.includes("dome")) ||
          (query.includes("ip") && category.includes("ip")) ||
          (query.includes("wifi") && (category.includes("wifi") || name.includes("wifi"))) ||
          (query.includes("solar") && (category.includes("solar") || name.includes("solar"))) ||
          (query.includes("indoor") && description.includes("indoor")) ||
          (query.includes("outdoor") && description.includes("outdoor")) ||
          // Resolution searches
          (query.includes("2mp") && (name.includes("2mp") || description.includes("2mp"))) ||
          (query.includes("4mp") && (name.includes("4mp") || description.includes("4mp"))) ||
          (query.includes("5mp") && (name.includes("5mp") || description.includes("5mp"))) ||
          (query.includes("8mp") && (name.includes("8mp") || description.includes("8mp"))) ||
          // Brand searches
          (query.includes("cp plus") && name.includes("cp plus")) ||
          (query.includes("hikvision") && name.includes("hikvision")) ||
          (query.includes("dahua") && name.includes("dahua"));
        
        // Check price filter
        const priceFilterMatch = maxPrice ? price <= maxPrice : true;
        
        return textMatch || (maxPrice && priceFilterMatch);
      });
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleRequestQuote = (product: Product) => {
    setSelectedProduct(product);
    setQuotationModalOpen(true);
    setDetailModalOpen(false);
  };

  const handleOpenServiceModal = () => {
    setServiceModalOpen(true);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  const services = [
    {
      icon: Camera,
      title: t('cctvInstallation'),
      description: t('cctvInstallationDesc'),
    },
    {
      icon: Wrench,
      title: t('maintenanceRepair'),
      description: t('maintenanceRepairDesc'),
    },
    {
      icon: Shield,
      title: t('monitoring24x7'),
      description: t('monitoring24x7Desc'),
    },
    {
      icon: CheckCircle,
      title: t('freeSiteSurveyService'),
      description: t('freeSiteSurveyServiceDesc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Offer Banner */}
        <OfferBanner />

        {/* Hero Section */}
        <HeroSection onBookService={handleOpenServiceModal} />

        {/* Search Bar Section */}
        <section className="py-6 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-base rounded-xl border-border bg-background shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Banner Slider - After Search, Before Products */}
        <BannerSlider />

        {/* Products Section */}
        <section className="py-16" id="products">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('ourProducts')}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t('ourProductsDescription')}
              </p>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={(cat) => {
                  setSelectedCategory(cat);
                  setSearchQuery(""); // Clear search when changing category
                }}
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductCard
                      product={product}
                      onRequestQuote={handleRequestQuote}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{searchQuery ? t('noProductsFound') : t('noProductsAvailable')}</p>
                {!searchQuery && <p className="text-sm mt-2">{t('checkBackSoon')}</p>}
              </div>
            )}
          </div>
        </section>

        {/* Combo Offers Section */}
        <ComboSection />

        {/* Service Charges Section */}
        <ServiceChargesSection />

        {/* Services Section */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('ourServices')}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t('ourServicesDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="product-card rounded-xl p-6 text-center space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={handleOpenServiceModal}
                className="bg-primary hover:bg-primary/90"
              >
                {t('bookAService')}
              </Button>
            </div>
          </div>
        </section>

        {/* About Section - Now at Bottom */}
        <AboutSection />
      </main>

      <Footer />
      <FloatingButtons />

      {/* Modals */}
      <QuotationModal
        product={selectedProduct}
        open={quotationModalOpen}
        onOpenChange={setQuotationModalOpen}
      />
      <ServiceModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
      />
      <ProductDetailModal
        product={selectedProduct}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onRequestQuote={() => handleRequestQuote(selectedProduct!)}
      />
      <OfferPopup />
    </div>
  );
};

export default Index;
