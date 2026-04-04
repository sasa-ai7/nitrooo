import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Zap } from "lucide-react";

import { type Language, useLanguage } from "@/context/LanguageContext";
import { ORDER_SUPPORT_EVENT } from "@/context/OrderCenterContext";
import OrderNotificationCenter from "./OrderNotificationCenter";
import OrderNotificationStack from "./OrderNotificationStack";
import SupportChat from "./SupportChat";

const languageOptions: Array<{ value: Language; flag: string; label: string }> = [
  { value: "en", flag: "🇺🇸", label: "Switch to English" },
  { value: "ar", flag: "🇪🇬", label: "التبديل إلى العربية" },
];

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);
  const [supportOrderId, setSupportOrderId] = useState<string | null>(null);
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);
  const switchTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOpenSupport = (event: Event) => {
      const detail = (event as CustomEvent<{ orderId?: string | null }>).detail;
      setSupportOrderId(detail?.orderId ?? null);
      setChatOpen(true);
    };

    window.addEventListener(ORDER_SUPPORT_EVENT, handleOpenSupport as EventListener);

    return () => {
      window.removeEventListener(ORDER_SUPPORT_EVENT, handleOpenSupport as EventListener);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
    };
  }, []);

  const handleLanguageChange = (nextLanguage: Language) => {
    if (nextLanguage === language) return;

    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);

    setPendingLanguage(nextLanguage);
    setIsLanguageSwitching(true);

    switchTimerRef.current = window.setTimeout(() => {
      setLanguage(nextLanguage);
    }, 120);

    finishTimerRef.current = window.setTimeout(() => {
      setIsLanguageSwitching(false);
      setPendingLanguage(null);
    }, 620);
  };

  const activeFlag = (pendingLanguage ?? language) === "ar" ? "🇪🇬" : "🇺🇸";

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-strong sticky top-0 z-50 px-4 py-3 sm:px-6 sm:py-4"
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex items-center gap-2">
            <Zap className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" />
            <span className="truncate font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
              NITRO <span className="text-primary orange-text-glow">X</span>
            </span>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <span className="hidden max-w-[18rem] font-body text-xs text-muted-foreground lg:inline">
              {t("header.promo")}
            </span>

            <div className="glass relative flex items-center gap-1 rounded-full border border-primary/20 bg-[linear-gradient(135deg,rgba(10,10,12,0.94),rgba(24,12,8,0.9))] px-1.5 py-1 shadow-[0_0_24px_rgba(249,115,22,0.08)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Globe2 className="h-3.5 w-3.5" />
              </div>

              <div className="relative flex items-center gap-1">
                {languageOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleLanguageChange(option.value)}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full text-base transition-transform hover:scale-[1.04]"
                    aria-label={option.label}
                    title={option.label}
                    aria-pressed={language === option.value}
                  >
                    {language === option.value && (
                      <motion.span
                        layoutId="language-switch-highlight"
                        className="absolute inset-0 rounded-full border border-primary/35 bg-primary/15 shadow-[0_0_16px_rgba(249,115,22,0.18)]"
                        transition={{ type: "spring", stiffness: 340, damping: 26 }}
                      />
                    )}
                    <span className="relative z-10">{option.flag}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <OrderNotificationCenter />
            <button
              type="button"
              onClick={() => {
                setSupportOrderId(null);
                setChatOpen(true);
              }}
              className="glass rounded-full px-2.5 py-2 text-[11px] font-medium text-primary transition-shadow hover:orange-glow sm:px-3 sm:text-xs"
            >
              {t("header.support")}
            </button>
          </div>
        </div>
      </motion.header>

      <OrderNotificationStack />
      <SupportChat open={chatOpen} onClose={() => setChatOpen(false)} orderId={supportOrderId} />

      <AnimatePresence>
        {isLanguageSwitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(10,10,12,0.78),rgba(4,4,6,0.9))] p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="glass-strong relative overflow-hidden rounded-[28px] border border-primary/20 px-6 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_52%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.03),transparent_40%)]" />

              <div className="relative flex flex-col items-center gap-4">
                <motion.div
                  animate={{ scale: [0.98, 1.04, 0.98], rotate: [0, 2, 0, -2, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-black/30 shadow-[0_0_25px_rgba(249,115,22,0.12)]"
                >
                  <span className="font-heading text-[10px] font-semibold tracking-[0.24em] text-foreground/90">
                    NITRO
                  </span>
                  <span className="absolute -bottom-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-sm shadow-[0_0_12px_rgba(249,115,22,0.16)]">
                    {activeFlag}
                  </span>
                </motion.div>

                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                  <motion.span
                    className="block h-full w-12 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30"
                    animate={{ x: [-48, 76] }}
                    transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
