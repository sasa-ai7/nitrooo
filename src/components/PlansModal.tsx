import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { useTelemetry } from "@/context/TelemetryContext";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { platformLogos } from "@/data/platformLogos";
import type { Product, Plan } from "@/data/products";

interface PlansModalProps {
  product: Product | null;
  onClose: () => void;
  onBuy: (product: Product, plan: Plan) => void;
}

const PlansModal = ({ product, onClose, onBuy }: PlansModalProps) => {
  const { isArabic, t } = useLanguage();
  const { trackEvent } = useTelemetry();

  useBodyScrollLock(Boolean(product));
  const logoUrl = product ? platformLogos[product.id] : undefined;
  const description = product ? (isArabic && product.descriptionAr ? product.descriptionAr : product.description) : "";

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 28 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="premium-scrollbar glass-strong max-h-[90svh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl p-4 sm:p-6 md:p-8"
          >
            <div className={`mb-5 flex items-start justify-between gap-3 sm:mb-6 ${isArabic ? "text-right" : "text-left"}`}>
              <div className="min-w-0 flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${product.name} logo`}
                    className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_8px_18px_rgba(249,115,22,0.16)]"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="shrink-0 text-sm font-bold text-foreground">{product.name.slice(0, 2)}</span>
                )}
                <div className="min-w-0">
                  <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted/50"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass gradient-border flex min-w-0 flex-col gap-3 rounded-xl p-4 transition-shadow duration-300 hover:orange-glow sm:p-5 ${isArabic ? "text-right" : "text-left"}`}
                >
                  <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                  <ul className="flex-1 space-y-1.5 break-words">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 flex-shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-0.5 pt-2">
                    <p className="text-sm text-muted-foreground line-through">
                      ${plan.originalPrice.toFixed(2)}/mo
                    </p>
                    <p className="font-heading text-2xl font-bold text-primary orange-text-glow">
                      ${plan.discountedPrice.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      trackEvent({
                        eventType: "product_click",
                        eventLabel: `Product Click: ${plan.name}`,
                        metadata: {
                          productId: product.id,
                          productName: product.name,
                          planName: plan.name,
                        },
                      });
                      onBuy(product, plan);
                    }}
                    className="btn-primary w-full rounded-lg px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    {t("cards.buyNow")}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlansModal;
