import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, ExternalLink, Receipt, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/Header";
import SupportButton from "@/components/SupportButton";
import {
  formatOrderDate,
  ORDER_SUPPORT_URL,
  paymentMethodLabels,
  useOrderCenter,
} from "@/context/OrderCenterContext";
import { platformLogos } from "@/data/platformLogos";

const OrderResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const { getOrderById } = useOrderCenter();

  const order = useMemo(() => {
    if (orderId) {
      return getOrderById(orderId);
    }

    return location.state?.orderId ? getOrderById(location.state.orderId as string) : undefined;
  }, [getOrderById, location.state, orderId]);

  const copyOrderId = async () => {
    if (!order) return;
    await navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied", { description: order.id });
  };

  if (!order) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card/60 p-6 text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">Order not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not locate that order. Please return to the store or contact support.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-primary mt-5 rounded-xl px-5 py-2.5 text-sm text-primary-foreground"
            >
              Back to Store
            </button>
          </div>
        </main>
        <SupportButton />
      </div>
    );
  }

  const logoUrl = platformLogos[order.platformId];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </button>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong gradient-border rounded-3xl p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={`${order.platformName} logo`} className="h-12 w-12 object-contain" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary">Order received</p>
                <h1 className="break-all font-heading text-2xl font-bold text-foreground sm:text-3xl">{order.id}</h1>
                <p className="mt-1 text-sm text-muted-foreground">Your latest payment review update is shown below.</p>
              </div>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                order.providerState === "rejected"
                  ? "bg-red-500/10 text-red-300"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Platform</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{order.platformName}</p>
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
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Order Date & Time</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{formatOrderDate(order.submittedAt)}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Customer Email</p>
              <p className="mt-1 break-all text-sm font-semibold text-foreground">{order.customerEmail}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current Status</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{order.statusTitle}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Next steps</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{order.statusDescription}</p>
            <p className="mt-2 text-sm text-muted-foreground">{order.supportNote}</p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={copyOrderId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground sm:w-auto"
            >
              <Copy className="h-4 w-4" />
              Copy Order ID
            </button>
            <a
              href={ORDER_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-sm text-primary sm:w-auto"
            >
              <ExternalLink className="h-4 w-4" />
              Contact Support
            </a>
          </div>
        </motion.section>
      </main>

      <SupportButton />
    </div>
  );
};

export default OrderResult;
