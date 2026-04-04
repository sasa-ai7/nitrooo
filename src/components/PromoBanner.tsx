import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

const promoItems = [
  "50% OFF",
  "Limited Time Offer",
  "Special Deal",
  "More Offers",
  "Premium AI Access",
  "Choose Your Plan",
  "Click to Explore",
];

const marqueeItems = [...promoItems, ...promoItems, ...promoItems];

const PromoBanner = () => {
  const handleClick = () => {
    document.getElementById("platforms")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className="w-full cursor-pointer px-4 pt-2.5 sm:px-6 sm:pt-3"
      aria-label="Explore AI platform plans"
    >
      <div className="promo-marquee glass gradient-border orange-glow rounded-full border-primary/30 bg-[linear-gradient(90deg,rgba(8,8,10,0.96),rgba(20,10,8,0.94))] px-0 py-2.5 text-xs text-foreground/90 transition-all duration-300 hover:border-primary/50 hover:orange-glow-strong sm:py-3 sm:text-sm">
        <div className="promo-track font-heading text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.24em]">
          {marqueeItems.map((item, index) => {
            const isDiscountItem = item === "50% OFF";

            return (
              <div key={`${item}-${index}`} className="flex shrink-0 items-center">
                {isDiscountItem ? (
                  <Zap className="mx-2 h-3.5 w-3.5 text-red-400 sm:mx-3" />
                ) : index % 2 === 0 ? (
                  <Zap className="mx-2 h-3.5 w-3.5 text-primary orange-text-glow sm:mx-3" />
                ) : (
                  <Sparkles className="mx-2 h-3.5 w-3.5 text-primary/90 sm:mx-3" />
                )}

                <span
                  className={
                    isDiscountItem
                      ? "rounded-full border border-red-500/35 bg-red-950/50 px-2.5 py-1 text-red-300 shadow-[0_0_16px_rgba(190,24,93,0.22)]"
                      : "text-foreground/90"
                  }
                >
                  {item}
                </span>

                <span
                  className={`mx-2 h-1.5 w-1.5 rounded-full sm:mx-3 ${
                    isDiscountItem
                      ? "bg-red-400/90 shadow-[0_0_12px_rgba(248,113,113,0.8)]"
                      : "bg-primary/70 shadow-[0_0_12px_rgba(249,115,22,0.75)]"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </motion.button>
  );
};

export default PromoBanner;
