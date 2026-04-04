import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import HeroBanner from "@/components/HeroBanner";
import PlatformCard from "@/components/PlatformCard";
import PlansModal from "@/components/PlansModal";
import SiteFooter from "@/components/SiteFooter";
import SupportButton from "@/components/SupportButton";
import { useTelemetry } from "@/context/TelemetryContext";
import { products, type Product, type Plan } from "@/data/products";

const Index = () => {
  const navigate = useNavigate();
  const { trackEvent } = useTelemetry();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleBuy = (product: Product, plan: Plan) => {
    trackEvent({
      eventType: "checkout_started",
      eventLabel: "Checkout Started",
      metadata: {
        productId: product.id,
        productName: product.name,
        planName: plan.name,
      },
    });
    setSelectedProduct(null);
    navigate("/checkout", { state: { product, plan } });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <PromoBanner />
      <HeroBanner />

      <main id="platforms" className="container mx-auto scroll-mt-24 px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => (
            <PlatformCard
              key={product.id}
              product={product}
              index={i}
              onViewPlans={setSelectedProduct}
            />
          ))}
        </div>
      </main>

      <SiteFooter />

      <PlansModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuy={handleBuy}
      />

      <SupportButton />
    </div>
  );
};

export default Index;
