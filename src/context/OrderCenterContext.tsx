import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { submitSecureOrder } from "@/lib/securityApi";

import { useLanguage } from "./LanguageContext";

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

type PaymentReviewRule = {
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
};

const paymentReviewDelayMs: Record<PaymentMethodKey, number> = {
  vodafone: 180000,
  crypto: 60000,
  card: 60000,
};

const getPaymentReviewRules = (t: (key: string) => string): Record<PaymentMethodKey, PaymentReviewRule> => ({
  vodafone: {
    delayMs: paymentReviewDelayMs.vodafone,
    pendingStatus: t("statuses.awaitingReview"),
    pendingTitle: t("statuses.vodafoneSubmitted"),
    pendingDescription: t("statuses.vodafonePending"),
    supportNote: t("statuses.vodafoneSupport"),
    finalStatus: t("statuses.rejected"),
    finalTitle: t("statuses.screenshotNotClear"),
    finalDescription: t("statuses.screenshotNotClearDesc"),
    finalSupportNote: t("statuses.screenshotSupport"),
    toastTitle: t("toasts.vodafoneFailed"),
    toastDescription: t("toasts.vodafoneScreenshot"),
  },
  crypto: {
    delayMs: paymentReviewDelayMs.crypto,
    pendingStatus: t("statuses.awaitingConfirmation"),
    pendingTitle: t("statuses.cryptoPendingTitle"),
    pendingDescription: t("statuses.cryptoPending"),
    supportNote: t("statuses.cryptoSupport"),
    finalStatus: t("statuses.failed"),
    finalTitle: t("statuses.walletIssue"),
    finalDescription: t("statuses.walletIssueDesc"),
    finalSupportNote: t("statuses.walletSupport"),
    toastTitle: t("toasts.cryptoFailed"),
    toastDescription: t("toasts.cryptoIssue"),
  },
  card: {
    delayMs: paymentReviewDelayMs.card,
    pendingStatus: t("statuses.processing"),
    pendingTitle: t("statuses.cardProcessing"),
    pendingDescription: t("statuses.cardPending"),
    supportNote: t("statuses.cardSupport"),
    finalStatus: t("statuses.declined"),
    finalTitle: t("statuses.cardDeclinedTitle"),
    finalDescription: t("statuses.cardDeclinedDesc"),
    finalSupportNote: t("statuses.cardSupportFinal"),
    toastTitle: t("toasts.cardDeclined"),
    toastDescription: t("toasts.cardIssue"),
  },
});

export const getPaymentMethodLabel = (
  paymentMethod: PaymentMethodKey,
  t?: (key: string) => string,
) => {
  if (!t) {
    return paymentMethodLabels[paymentMethod];
  }

  return {
    vodafone: t("payments.vodafone"),
    crypto: t("payments.crypto"),
    card: t("payments.card"),
  }[paymentMethod];
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
  countryCode?: string;
  countryName?: string;
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
  countryCode?: string;
  countryName?: string;
}

interface OrderCenterContextValue {
  orders: OrderRecord[];
  unreadCount: number;
  latestOrder: OrderRecord | null;
  createOrder: (input: CreateOrderInput) => Promise<OrderRecord>;
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

export const formatOrderDate = (isoDate: string, locale = "en-US") =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));

export const getPaymentReviewDelay = (paymentMethod: PaymentMethodKey) => paymentReviewDelayMs[paymentMethod];

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

export const OrderCenterProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const paymentReviewRules = useMemo(() => getPaymentReviewRules(t), [t]);

  const getLocalizedOrderState = useCallback(
    (order: OrderRecord) => {
      const rule = paymentReviewRules[order.paymentMethod];

      if (order.providerState === "pending") {
        return {
          status: rule.pendingStatus,
          statusTitle: rule.pendingTitle,
          statusDescription: rule.pendingDescription,
          supportNote: rule.supportNote,
        };
      }

      return {
        status: rule.finalStatus,
        statusTitle: rule.finalTitle,
        statusDescription: rule.finalDescription,
        supportNote: rule.finalSupportNote,
      };
    },
    [paymentReviewRules],
  );

  const markAsRead = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, unread: false } : order)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setOrders((prev) => prev.map((order) => ({ ...order, unread: false })));
  }, []);


  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      const validatedOrder = await submitSecureOrder({
        platformId: input.platformId,
        planName: input.planName,
        paymentMethod: input.paymentMethod,
        deliveryMethod: input.deliveryMethod,
        customerEmail: input.customerEmail,
        countryCode: input.countryCode,
        countryName: input.countryName,
      });

      const rule = paymentReviewRules[validatedOrder.paymentMethod];
      const order: OrderRecord = {
        id: validatedOrder.id,
        platformId: validatedOrder.platformId,
        platformName: validatedOrder.platformName,
        planName: validatedOrder.planName,
        amount: validatedOrder.amount,
        paymentMethod: validatedOrder.paymentMethod,
        deliveryMethod: validatedOrder.deliveryMethod,
        customerEmail: validatedOrder.customerEmail,
        countryCode: validatedOrder.countryCode,
        countryName: validatedOrder.countryName,
        submittedAt: validatedOrder.submittedAt,
        updatedAt: validatedOrder.updatedAt,
        status: rule.pendingStatus,
        statusTitle: rule.pendingTitle,
        statusDescription: rule.pendingDescription,
        supportNote: rule.supportNote,
        providerState: "pending",
        unread: true,
      };

      setOrders((prev) => [order, ...prev].slice(0, 12));

      toast.success(t("toasts.orderSubmitted"), {
        description: `${order.id} • ${getPaymentMethodLabel(order.paymentMethod, t)} • ${rule.pendingStatus}`,
      });

      return order;
    },
    [paymentReviewRules, t],
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
    setOrders((prev) =>
      prev.map((order) => {
        const localizedState = getLocalizedOrderState(order);

        if (
          order.status === localizedState.status &&
          order.statusTitle === localizedState.statusTitle &&
          order.statusDescription === localizedState.statusDescription &&
          order.supportNote === localizedState.supportNote
        ) {
          return order;
        }

        return {
          ...order,
          ...localizedState,
        };
      }),
    );
  }, [getLocalizedOrderState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

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
