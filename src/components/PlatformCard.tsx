import { motion } from "framer-motion";
import { platformLogos } from "@/data/platformLogos";
import type { Product } from "@/data/products";

interface PlatformCardProps {
  product: Product;
  index: number;
  onViewPlans: (product: Product) => void;
}

const PlatformCard = ({ product, index, onViewPlans }: PlatformCardProps) => {
  const logoUrl = platformLogos[product.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onViewPlans(product)}
      className="glass gradient-border group flex min-w-0 cursor-pointer flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-300 hover:orange-glow sm:gap-4 sm:p-6"
    >
      <div className="flex min-h-[72px] items-center justify-center sm:min-h-[88px]">
        {logoUrl ? (
          <motion.img
            src={logoUrl}
            alt={`${product.name} logo`}
            className="h-12 w-auto max-w-[72px] object-contain drop-shadow-[0_8px_18px_rgba(249,115,22,0.16)] sm:h-16 sm:max-w-[88px]"
            loading="lazy"
            decoding="async"
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <span className="text-lg font-bold text-foreground sm:text-xl">{product.name.slice(0, 2)}</span>
        )}
      </div>

      <div className="space-y-2 text-center">
        <h3 className="font-heading text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
          {product.name}
        </h3>
        <p className="max-w-full text-[13px] leading-5 text-muted-foreground sm:text-sm">
          {product.description}
        </p>
      </div>

      <span className="text-[11px] text-muted-foreground sm:text-xs">
        {product.plans.length} plan{product.plans.length > 1 ? "s" : ""} available
      </span>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="btn-primary mt-auto w-full rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground"
      >
        View Plans
      </motion.button>
    </motion.div>
  );
};

export default PlatformCard;
