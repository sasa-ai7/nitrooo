import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Copy, ExternalLink, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

import {
  ORDER_SUPPORT_URL,
  formatOrderDate,
  openSupportChat,
  paymentMethodLabels,
  useOrderCenter,
} from "@/context/OrderCenterContext";

const OrderNotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { orders, unreadCount, markAllAsRead, markAsRead } = useOrderCenter();

  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllAsRead();
    }
  }, [markAllAsRead, open, unreadCount]);

  const copyOrderId = async (orderId: string) => {
    await navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied", { description: orderId });
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-card/50 text-foreground transition-all duration-300 hover:border-primary/50 hover:orange-glow sm:h-10 sm:w-10"
        aria-label="Open order notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
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
            transition={{ duration: 0.2 }}
            className="fixed left-2 right-2 top-[4.25rem] z-[70] max-h-[min(72svh,32rem)] w-auto overflow-hidden rounded-2xl border border-primary/20 bg-card/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-[28rem] sm:w-full sm:min-w-[20rem] sm:max-w-sm"
          >
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">Order Notifications</h3>
                  <p className="text-[11px] text-muted-foreground">Recent payment and order updates</p>
                </div>
                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] text-primary hover:text-primary/80"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-3">
              {orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
                  <p className="text-sm text-foreground">No notifications yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Your latest order updates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 6).map((order) => (
                    <div key={order.id} className="rounded-xl border border-primary/15 bg-background/40 p-3 text-left">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-primary">{order.statusTitle}</p>
                          <p className="text-[11px] text-muted-foreground">{formatOrderDate(order.submittedAt)}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            order.providerState === "rejected"
                              ? "bg-red-500/10 text-red-300"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <p className="break-all"><span className="text-foreground">Order ID:</span> {order.id}</p>
                        <p><span className="text-foreground">Platform:</span> {order.platformName}</p>
                        <p><span className="text-foreground">Package:</span> {order.planName}</p>
                        <p><span className="text-foreground">Payment:</span> {paymentMethodLabels[order.paymentMethod]}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => copyOrderId(order.id)}
                          className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-foreground hover:border-primary/40 sm:w-auto"
                        >
                          <Copy className="h-3 w-3" />
                          Copy ID
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            markAsRead(order.id);
                            setOpen(false);
                            openSupportChat(order.id);
                          }}
                          className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground sm:w-auto"
                        >
                          <LifeBuoy className="h-3 w-3" />
                          Get Help
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border px-4 py-3">
              <a
                href={ORDER_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80"
              >
                Contact support on Telegram
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotificationCenter;
