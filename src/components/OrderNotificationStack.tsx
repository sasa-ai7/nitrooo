import { AnimatePresence, motion } from "framer-motion";
import { Copy, LifeBuoy, X } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/context/LanguageContext";
import {
  formatOrderDate,
  getPaymentMethodLabel,
  openSupportChat,
  useOrderCenter,
} from "@/context/OrderCenterContext";

const getStatusTone = (status: string, providerState: string) => {
  const value = status.toLowerCase();

  if (providerState === "rejected" || /(declin|fail|reject|مرفوض|فشل|رفض)/i.test(value)) {
    return "border-red-400/25 bg-red-500/10 text-red-200";
  }

  if (/(await|pending|process|بانتظار|انتظار|معالج|قيد)/i.test(value)) {
    return "border-amber-400/25 bg-amber-500/10 text-amber-100";
  }

  return "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";
};

const OrderNotificationStack = () => {
  const { language, t } = useLanguage();
  const { orders, markAsRead } = useOrderCenter();
  const visibleOrders = orders.filter((order) => order.unread).slice(0, 2);
  const alignClass = language === "ar" ? "text-right" : "text-left";

  const handleCopy = async (orderId: string) => {
    await navigator.clipboard.writeText(orderId);
    toast.success(t("toasts.orderCopied"), { description: orderId });
  };

  if (visibleOrders.length === 0) {
    return null;
  }

  return (
    <div className="px-3 pt-2.5 sm:px-6 sm:pt-3">
      <div className="container mx-auto max-w-6xl space-y-3">
        <AnimatePresence>
          {visibleOrders.map((order) => {
            const toneClass = getStatusTone(order.status, order.providerState);

            return (
              <motion.article
                key={order.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass-strong gradient-border overflow-hidden rounded-[24px] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className={`min-w-0 space-y-3 ${alignClass}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${toneClass}`}
                      >
                        {order.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-muted-foreground">
                        {formatOrderDate(order.submittedAt, language === "ar" ? "ar-EG" : "en-US")}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.statusTitle}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {order.statusDescription}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-muted-foreground">
                        <strong className="text-foreground">{t("header.orderId")}:</strong> {order.id}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-muted-foreground">
                        <strong className="text-foreground">{t("header.platform")}:</strong> {order.platformName}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-muted-foreground">
                        <strong className="text-foreground">{t("header.package")}:</strong> {order.planName}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-muted-foreground">
                        <strong className="text-foreground">{t("header.payment")}:</strong>{" "}
                        {getPaymentMethodLabel(order.paymentMethod, t)}
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[11rem]">
                    <button
                      type="button"
                      onClick={() => handleCopy(order.id)}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-foreground transition-all hover:border-primary/35 hover:bg-primary/10"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {t("notifications.copyOrderId")}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        markAsRead(order.id);
                        openSupportChat(order.id);
                      }}
                      className="btn-primary inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-primary-foreground"
                    >
                      <LifeBuoy className="h-3.5 w-3.5" />
                      {t("header.getHelp")}
                    </button>

                    <button
                      type="button"
                      onClick={() => markAsRead(order.id)}
                      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                      aria-label={t("notifications.dismiss")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderNotificationStack;
