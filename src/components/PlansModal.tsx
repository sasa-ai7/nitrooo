import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { platformLogos } from "@/data/platformLogos";
import type { Product, Plan } from "@/data/products";

interface PlansModalProps {
  product: Product | null;
  onClose: () => void;
  onBuy: (product: Product, plan: Plan) => void;
}

const PlansModal = ({ product, onClose, onBuy }: PlansModalProps) => {
  const logoUrl = product ? platformLogos[product.id] : undefined;

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
            className="glass-strong max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-2xl p-4 sm:p-6 md:p-8"
          >
            <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
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
                  <span className="text-sm font-bold text-foreground shrink-0">{product.name.slice(0, 2)}</span>
                )}
                <div className="min-w-0">
                  <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted/50"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass gradient-border flex min-w-0 flex-col gap-3 rounded-xl p-4 transition-shadow duration-300 hover:orange-glow sm:p-5"
                >
                  <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                  <ul className="flex-1 space-y-1.5 break-words">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-0.5 pt-2">
                    <p className="text-muted-foreground text-sm line-through">
                      ${plan.originalPrice.toFixed(2)}/mo
                    </p>
                    <p className="font-heading font-bold text-2xl text-primary orange-text-glow">
                      ${plan.discountedPrice.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onBuy(product, plan)}
                    className="btn-primary text-primary-foreground py-2.5 px-6 rounded-lg text-sm font-semibold w-full"
                  >
                    Buy Now
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
