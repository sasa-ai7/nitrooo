import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Copy, ExternalLink, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/context/LanguageContext";
import {
  ORDER_SUPPORT_URL,
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

const OrderNotificationCenter = () => {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const { orders, unreadCount, markAllAsRead, markAsRead } = useOrderCenter();
  const alignClass = language === "ar" ? "text-right" : "text-left";

  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllAsRead();
    }
  }, [markAllAsRead, open, unreadCount]);

  const copyOrderId = async (orderId: string) => {
    await navigator.clipboard.writeText(orderId);
    toast.success(t("toasts.orderCopied"), { description: orderId });
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-[linear-gradient(135deg,rgba(12,12,14,0.95),rgba(22,12,8,0.88))] text-foreground shadow-[0_0_18px_rgba(249,115,22,0.06)] transition-all duration-300 hover:border-primary/45 hover:orange-glow sm:h-10 sm:w-10"
        aria-label={t("header.notifications")}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-[0_0_12px_rgba(249,115,22,0.35)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed left-2 right-2 top-[4.25rem] z-[70] overflow-hidden rounded-[24px] border border-primary/20 bg-[linear-gradient(180deg,rgba(12,12,14,0.97),rgba(10,10,12,0.95))] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[25rem]"
          >
            <div className="border-b border-white/5 bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(255,255,255,0.02))] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_16px_rgba(249,115,22,0.1)]">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className={alignClass}>
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      {t("header.notifications")}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {t("header.recentUpdates")}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      {unreadCount}
                    </span>
                  )}

                  {orders.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground"
                    >
                      {t("header.markAllRead")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="premium-scrollbar max-h-[min(70svh,26rem)] overflow-y-auto p-3 sm:p-4">
              {orders.length === 0 ? (
                <div className={`rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 ${alignClass}`}>
                  <p className="text-sm font-medium text-foreground">{t("header.noNotifications")}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t("header.noNotificationsDesc")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 6).map((order) => {
                    const toneClass = getStatusTone(order.status, order.providerState);

                    return (
                      <div
                        key={order.id}
                        className={`rounded-[22px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${alignClass}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{order.statusTitle}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatOrderDate(order.submittedAt, language === "ar" ? "ar-EG" : "en-US")}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${toneClass}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {t("header.orderId")}
                          </p>
                          <p className="mt-1 font-mono text-[12px] text-primary">{order.id}</p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded-xl border border-white/5 bg-black/10 p-2.5">
                            <p className="text-[10px] text-muted-foreground">{t("header.platform")}</p>
                            <p className="mt-1 font-medium text-foreground">{order.platformName}</p>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-black/10 p-2.5">
                            <p className="text-[10px] text-muted-foreground">{t("header.package")}</p>
                            <p className="mt-1 font-medium text-foreground">{order.planName}</p>
                          </div>
                          <div className="col-span-2 rounded-xl border border-white/5 bg-black/10 p-2.5">
                            <p className="text-[10px] text-muted-foreground">{t("header.payment")}</p>
                            <p className="mt-1 font-medium text-foreground">
                              {getPaymentMethodLabel(order.paymentMethod, t)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => copyOrderId(order.id)}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-foreground transition-all hover:border-primary/35 hover:bg-primary/10 sm:flex-1"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {t("header.copyId")}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              markAsRead(order.id);
                              setOpen(false);
                              openSupportChat(order.id);
                            }}
                            className="btn-primary inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-primary-foreground sm:flex-1"
                          >
                            <LifeBuoy className="h-3.5 w-3.5" />
                            {t("header.getHelp")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-white/5 px-4 py-3">
              <a
                href={ORDER_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs font-medium text-primary transition-all hover:border-primary/35 hover:bg-primary/10"
              >
                {t("header.contactTelegram")}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotificationCenter;
