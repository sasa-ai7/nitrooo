import { motion } from "framer-motion";
import { Shield, Clock, Sparkles } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
      <div className="absolute left-1/4 top-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-primary/5 blur-3xl sm:h-64 sm:w-64" />

      <div className="container relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="glass mb-5 inline-flex rounded-full px-3 py-1.5 text-[11px] font-medium text-primary sm:mb-6 sm:px-4 sm:text-xs">
            Limited Time — 50% Off All AI Platforms
          </span>
          <h1 className="mb-4 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-6xl md:leading-none">
            Premium AI Access
            <br />
            <span className="text-primary orange-text-glow">Half the Price</span>
          </h1>
          <p className="mx-auto mb-7 max-w-2xl px-1 text-sm text-muted-foreground sm:mb-8 sm:text-base">
            Get legitimate subscriptions to the world&apos;s top AI platforms — ChatGPT, GitHub, Cursor, Grok, Kimi, and more — at an unbeatable 50% discount.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="flex flex-wrap justify-center gap-2.5 text-xs text-muted-foreground sm:gap-4 sm:text-sm"
        >
          <div className="glass flex items-center gap-2 rounded-full px-3 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>100% Secure</span>
          </div>
          <div className="glass flex items-center gap-2 rounded-full px-3 py-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Instant Delivery</span>
          </div>
          <div className="glass flex items-center gap-2 rounded-full px-3 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>24/7 Support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
