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
import { ComboSection } from "@/components/ComboSection";
import { Loader2, Camera, Wrench, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
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

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const handleRequestQuote = (product: Product) => {
    setSelectedProduct(product);
    setQuotationModalOpen(true);
  };

  const handleOpenServiceModal = () => {
    setServiceModalOpen(true);
  };

  const services = [
    {
      icon: Camera,
      title: "CCTV Installation",
      description: "Professional installation for homes and businesses",
    },
    {
      icon: Wrench,
      title: "Maintenance & Repair",
      description: "Regular maintenance and quick repair services",
    },
    {
      icon: Shield,
      title: "24/7 Monitoring",
      description: "Round-the-clock surveillance support",
    },
    {
      icon: CheckCircle,
      title: "Free Site Survey",
      description: "Complimentary security assessment",
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

        {/* Services Section */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Services
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Complete security solutions tailored to your needs
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
                Book a Service
              </Button>
            </div>
          </div>
        </section>

        {/* Combo Offers Section */}
        <ComboSection />

        {/* Products Section */}
        <section className="py-16" id="products">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Products
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Browse our wide range of CCTV cameras and security equipment
              </p>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
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
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
                <p>No products available in this category.</p>
                <p className="text-sm mt-2">Check back soon for new products!</p>
              </div>
            )}
          </div>
        </section>
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
    </div>
  );
};

export default Index;
