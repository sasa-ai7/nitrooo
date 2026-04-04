import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Copy, Printer, Receipt, X } from "lucide-react";
import { toast } from "sonner";

import {
  formatOrderDate,
  ORDER_SUPPORT_URL,
  paymentMethodLabels,
  type OrderRecord,
} from "@/context/OrderCenterContext";

interface OrderReceiptModalProps {
  order: OrderRecord | null;
  open: boolean;
  onClose: () => void;
  onViewDetails: (orderId: string) => void;
}

const OrderReceiptModal = ({ order, open, onClose, onViewDetails }: OrderReceiptModalProps) => {
  const handleCopy = async () => {
    if (!order) return;
    await navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied", { description: order.id });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {open && order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-primary/20 bg-card text-left shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Digital Receipt</h2>
                  <p className="text-xs text-muted-foreground">Order received and queued for review</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div className="rounded-2xl bg-background/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-primary">Order Submitted</p>
                    <h3 className="break-all font-heading text-xl font-bold text-foreground sm:text-2xl">{order.id}</h3>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Your order is being processed. We will contact you via the website or your email. A notification will appear here or in your inbox. Please monitor both carefully.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Order ID</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{order.id}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Package Name</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{order.planName}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Payment Method</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{paymentMethodLabels[order.paymentMethod]}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Platform</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{order.platformName}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-foreground">Next steps</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Your payment status is currently under review.</li>
                  <li>• We will contact you through the website or by email.</li>
                  <li>• Keep your Order ID ready for any support request.</li>
                </ul>
                <a
                  href={ORDER_SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-primary hover:text-primary/80"
                >
                  Contact support if needed
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground"
              >
                <Copy className="h-4 w-4" />
                Copy Order ID
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground"
              >
                <Printer className="h-4 w-4" />
                Save Receipt
              </button>
              <button
                type="button"
                onClick={() => onViewDetails(order.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <ArrowRight className="h-4 w-4" />
                View Order Details
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderReceiptModal;
