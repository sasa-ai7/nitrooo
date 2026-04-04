import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

import { ORDER_SUPPORT_EVENT } from "@/context/OrderCenterContext";
import OrderNotificationCenter from "./OrderNotificationCenter";
import OrderNotificationStack from "./OrderNotificationStack";
import SupportChat from "./SupportChat";

const Header = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [supportOrderId, setSupportOrderId] = useState<string | null>(null);

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

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-strong sticky top-0 z-50 px-4 py-3 sm:px-6 sm:py-4"
      >
        <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex items-center gap-2">
            <Zap className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" />
            <span className="truncate font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
              NITRO <span className="text-primary orange-text-glow">X</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden font-body text-xs text-muted-foreground lg:inline">
              Premium AI Subscriptions at <span className="font-semibold text-primary">50% OFF</span>
            </span>
            <OrderNotificationCenter />
            <button
              type="button"
              onClick={() => {
                setSupportOrderId(null);
                setChatOpen(true);
              }}
              className="glass rounded-full px-2.5 py-2 text-[11px] font-medium text-primary transition-shadow hover:orange-glow sm:px-3 sm:text-xs"
            >
              Support
            </button>
          </div>
        </div>
      </motion.header>

      <OrderNotificationStack />
      <SupportChat open={chatOpen} onClose={() => setChatOpen(false)} orderId={supportOrderId} />
    </>
  );
};

export default Header;
