import { AnimatePresence, motion } from "framer-motion";
import { Copy, LifeBuoy, X } from "lucide-react";
import { toast } from "sonner";

import {
  formatOrderDate,
  openSupportChat,
  paymentMethodLabels,
  useOrderCenter,
} from "@/context/OrderCenterContext";

const OrderNotificationStack = () => {
  const { orders, markAsRead } = useOrderCenter();

  const visibleOrders = orders.filter((order) => order.unread).slice(0, 2);

  const handleCopy = async (orderId: string) => {
    await navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied", { description: orderId });
  };

  if (visibleOrders.length === 0) {
    return null;
  }

  return (
    <div className="px-3 pt-2.5 sm:px-6 sm:pt-3">
      <div className="container mx-auto max-w-6xl space-y-3">
        <AnimatePresence>
          {visibleOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-strong gradient-border rounded-2xl px-4 py-3 sm:px-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      {order.statusTitle}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        order.providerState === "rejected"
                          ? "bg-red-500/10 text-red-300"
                          : "bg-white/5 text-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{order.statusDescription}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="break-all"><strong className="text-foreground">Order ID:</strong> {order.id}</span>
                    <span><strong className="text-foreground">Platform:</strong> {order.platformName}</span>
                    <span><strong className="text-foreground">Package:</strong> {order.planName}</span>
                    <span><strong className="text-foreground">Payment:</strong> {paymentMethodLabels[order.paymentMethod]}</span>
                    <span><strong className="text-foreground">Submitted At:</strong> {formatOrderDate(order.submittedAt)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopy(order.id)}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground hover:border-primary/40 sm:w-auto"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Order ID
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      markAsRead(order.id);
                      openSupportChat(order.id);
                    }}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground sm:w-auto"
                  >
                    <LifeBuoy className="h-3 w-3" />
                    Get Help
                  </button>
                  <button
                    type="button"
                    onClick={() => markAsRead(order.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderNotificationStack;
