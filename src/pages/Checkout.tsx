import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Bitcoin,
  Check,
  CloudUpload,
  Copy,
  CreditCard,
  Package,
  Shield,
  Smartphone,
  User,
} from "lucide-react";

import CountryCombobox from "@/components/CountryCombobox";
import Header from "@/components/Header";
import OrderReceiptModal from "@/components/OrderReceiptModal";
import SecurityBadges from "@/components/SecurityBadges";
import SupportButton from "@/components/SupportButton";
import { useGeo } from "@/context/GeoContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTelemetry } from "@/context/TelemetryContext";
import {
  getPaymentMethodLabel,
  getPaymentReviewDelay,
  useOrderCenter,
  type OrderRecord,
} from "@/context/OrderCenterContext";
import { countries } from "@/data/countries";
import { platformLogos } from "@/data/platformLogos";
import type { Product, Plan } from "@/data/products";

type DeliveryMethod = "own-account" | "ready-made";
type PaymentMethod = "vodafone" | "crypto" | "card";

type CardBrand = "visa" | "mastercard" | null;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isFilled = (value: string) => value.trim().length > 0;
const isValidPhone = (value: string) => value.replace(/\D/g, "").length >= 7;

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

const formatCardExpiry = (value: string) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
};

const formatCardCvc = (value: string) => value.replace(/\D/g, "").slice(0, 4);

const luhnCheck = (value: string) => {
  const digits = value.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return digits.length >= 13 && sum % 10 === 0;
};

const detectCardBrand = (value: string): CardBrand => {
  if (/^4/.test(value)) return "visa";
  if (/^5[1-5]/.test(value)) return "mastercard";
  return null;
};

const VisaLogo = () => (
  <svg viewBox="0 0 48 16" className="h-4 w-10" aria-label="Visa">
    <rect x="0.5" y="0.5" width="47" height="15" rx="7.5" fill="#0A1F44" />
    <text x="24" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="Arial, sans-serif">
      VISA
    </text>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 40 24" className="h-4 w-8" aria-label="Mastercard">
    <rect width="40" height="24" rx="12" fill="#111827" />
    <circle cx="17" cy="12" r="6" fill="#EB001B" />
    <circle cx="23" cy="12" r="6" fill="#F79E1B" fillOpacity="0.92" />
  </svg>
);

const SecureVerificationSpinner = () => (
  <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
    <motion.div
      className="absolute inset-3 rounded-full border border-emerald-400/20 bg-emerald-400/10 blur-md"
      animate={{ scale: [0.94, 1.04, 0.94], opacity: [0.35, 0.75, 0.35] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      className="relative h-24 w-24"
    >
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 38;
        const y = Math.sin(angle) * 38;
        const opacity = 0.2 + ((index + 1) / 12) * 0.8;

        return (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 h-3.5 w-3.5 rounded-full bg-emerald-400"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              opacity,
              boxShadow: "0 0 18px rgba(74, 222, 128, 0.75)",
            }}
          />
        );
      })}
    </motion.div>

    <div className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-400/10 shadow-[0_0_35px_rgba(74,222,128,0.35)]">
      <div className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
    </div>
  </div>
);

const Checkout = () => {
  const { isArabic, t } = useLanguage();
  const { countryCode: detectedCountryCode, countryName: detectedCountryName, status: geoStatus } = useGeo();
  const { trackEvent } = useTelemetry();
  const location = useLocation();
  const navigate = useNavigate();
  const { createOrder } = useOrderCenter();
  const { product, plan } = (location.state as { product: Product; plan: Plan }) || {};

  const [delivery, setDelivery] = useState<DeliveryMethod>("ready-made");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [txid, setTxid] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [confirmedTransfer, setConfirmedTransfer] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderRecord | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [processingCardOrderId, setProcessingCardOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingTimerRef = useRef<number | null>(null);
  const interactedFieldsRef = useRef(new Set<string>());
  const hasManualCountrySelectionRef = useRef(false);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === countryCode),
    [countryCode],
  );

  const cleanedCardNumber = cardNumber.replace(/\s/g, "");
  const cardBrand = detectCardBrand(cleanedCardNumber);
  const isCardNumberValid = cleanedCardNumber.length < 13 ? true : luhnCheck(cleanedCardNumber);
  const isCardExpiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry);
  const isCardCvcValid = /^[0-9]{3,4}$/.test(cardCvc);
  const cardProcessingDuration = getPaymentReviewDelay("card");
  const isProcessingCheckout = submitting || Boolean(processingCardOrderId);
  const effectiveCountryCode = countryCode || (detectedCountryCode !== "INTL" ? detectedCountryCode : "");
  const paymentOptions = useMemo(
    () => [
      { key: "vodafone" as PaymentMethod, icon: Smartphone, label: t("payments.vodafone") },
      { key: "crypto" as PaymentMethod, icon: Bitcoin, label: t("payments.crypto") },
      { key: "card" as PaymentMethod, icon: CreditCard, label: t("payments.card") },
    ],
    [t],
  );
  const isEgyptSelected = countryCode === "EG";
  const showAllPaymentsFallback = !hasManualCountrySelectionRef.current && (geoStatus !== "success" || !countryCode);
  const allowVodafone = showAllPaymentsFallback || isEgyptSelected;
  const availablePayments = useMemo(
    () => paymentOptions.filter(({ key }) => key !== "vodafone" || allowVodafone),
    [allowVodafone, paymentOptions],
  );
  const availablePaymentKeys = availablePayments.map(({ key }) => key);

  useEffect(() => {
    return () => {
      if (processingTimerRef.current) {
        window.clearTimeout(processingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!availablePaymentKeys.includes(payment)) {
      setPayment("card");
    }
  }, [availablePaymentKeys, payment]);

  useEffect(() => {
    if (!product || !plan) {
      return;
    }

    trackEvent({
      eventType: "checkout_started",
      eventLabel: "Checkout Started",
      metadata: {
        productId: product.id,
        productName: product.name,
        planName: plan.name,
      },
    });
  }, [plan, product, trackEvent]);

  useEffect(() => {
    if (hasManualCountrySelectionRef.current) {
      return;
    }

    if (
      detectedCountryCode &&
      detectedCountryCode !== "INTL" &&
      countries.some((country) => country.code === detectedCountryCode)
    ) {
      setCountryCode(detectedCountryCode);
    }
  }, [detectedCountryCode]);

  const isFormValid = useMemo(() => {
    if (!product || !plan) return false;
    if (!agreedTerms) return false;
    if (!isValidEmail(email)) return false;
    if (delivery === "own-account" && !isFilled(password)) return false;

    if (payment === "vodafone") {
      return confirmedTransfer && !!screenshot && isValidPhone(senderPhone);
    }

    if (payment === "crypto") {
      return confirmedTransfer && isFilled(txid);
    }

    return (
      isFilled(cardName) &&
      !!effectiveCountryCode &&
      cleanedCardNumber.length > 0 &&
      cardExpiry.trim().length > 0 &&
      cardCvc.trim().length > 0
    );
  }, [
    agreedTerms,
    cardCvc,
    cardExpiry,
    cardName,
    cleanedCardNumber,
    confirmedTransfer,
    effectiveCountryCode,
    delivery,
    email,
    isCardCvcValid,
    password,
    payment,
    plan,
    product,
    screenshot,
    senderPhone,
    txid,
  ]);

  if (!product || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("checkout.noProduct")}</p>
          <button onClick={() => navigate("/")} className="btn-primary text-primary-foreground px-6 py-2 rounded-lg">
            {t("checkout.backToStore")}
          </button>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(t("checkout.copied"), { description: text });
    setTimeout(() => setCopied(null), 2000);
  };

  const trackFieldInteraction = (fieldName: string) => {
    if (interactedFieldsRef.current.has(fieldName)) {
      return;
    }

    interactedFieldsRef.current.add(fieldName);
    trackEvent({
      eventType: "form_interaction",
      eventLabel: `Form Interaction: ${fieldName} started`,
      metadata: {
        fieldName,
        page: "checkout",
      },
    });
  };

  const handlePaymentChange = (nextPayment: PaymentMethod) => {
    if (isProcessingCheckout) {
      return;
    }

    setPayment(nextPayment);
    trackEvent({
      eventType: "payment_method_selected",
      eventLabel: `Payment Method Selected: ${getPaymentMethodLabel(nextPayment, t)}`,
      metadata: {
        paymentMethod: nextPayment,
      },
    });
  };

  const handleCountryChange = (nextCountryCode: string) => {
    if (isProcessingCheckout) {
      return;
    }

    hasManualCountrySelectionRef.current = true;
    setCountryCode(nextCountryCode);

    const nextCountry = countries.find((country) => country.code === nextCountryCode);

    trackEvent({
      eventType: "country_selected",
      eventLabel: `Country Selected: ${nextCountry?.name ?? nextCountryCode}`,
      metadata: {
        countryCode: nextCountryCode,
        countryName: nextCountry?.name ?? null,
      },
    });
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <button
      type="button"
      onClick={() => copyToClipboard(text, label)}
      className={`${isArabic ? "mr-2" : "ml-2"} text-primary hover:text-primary/80 transition-colors`}
      title={t("header.copyId")}
    >
      {copied === label ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );

  const handleSubmit = async () => {
    if (!isFormValid || submitting) {
      toast.error(t("checkout.requiredFields"));
      return;
    }

    try {
      setSubmitting(true);

      trackEvent({
        eventType: "checkout_attempted",
        eventLabel: "Checkout Attempted",
        metadata: {
          productId: product.id,
          productName: product.name,
          planName: plan.name,
          paymentMethod: payment,
          selectedCountry: effectiveCountryCode || null,
        },
      });

      const order = await createOrder({
        platformId: product.id,
        platformName: product.name,
        planName: plan.name,
        amount: plan.discountedPrice,
        paymentMethod: payment,
        deliveryMethod: delivery,
        customerEmail: email,
        countryCode: effectiveCountryCode,
        countryName: selectedCountry?.name ?? detectedCountryName,
      });

      setSubmittedOrder(order);

      if (payment === "card") {
        setReceiptOpen(false);
        setProcessingCardOrderId(order.id);
        toast.message(t("checkout.processingStarted"), {
          description: t("checkout.processingDesc"),
        });

        if (processingTimerRef.current) {
          window.clearTimeout(processingTimerRef.current);
        }

        processingTimerRef.current = window.setTimeout(() => {
          setProcessingCardOrderId(null);
          setReceiptOpen(true);
        }, cardProcessingDuration);
      } else {
        setReceiptOpen(true);
      }

      if (payment !== "card") {
        setPassword("");
        setSenderPhone("");
        setScreenshot(null);
        setTxid("");
        setConfirmedTransfer(false);
      }
    } catch {
      toast.error(isArabic ? "تعذر بدء محاولة الدفع الآن. حاول مرة أخرى." : "Unable to start the payment attempt right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "min-h-12 w-full rounded-lg border border-border bg-muted/50 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:px-4";
  const logoUrl = platformLogos[product.id];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t("checkout.backToStore")}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong mb-6 rounded-xl p-4 sm:p-6"
        >
          <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${product.name} logo`}
                className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_8px_18px_rgba(249,115,22,0.16)]"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="text-sm font-bold text-foreground shrink-0">{product.name.slice(0, 2)}</span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">{product.name} — {plan.name}</h2>
              <p className="text-sm text-muted-foreground line-through">${plan.originalPrice.toFixed(2)}/mo</p>
            </div>
            <span className="font-heading text-2xl font-bold text-primary orange-text-glow sm:ml-auto">
              ${plan.discountedPrice.toFixed(2)}
            </span>
          </div>
          <SecurityBadges emphasize showThreeDSecure />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass mb-6 rounded-xl border-primary/40 p-4 sm:p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-1">{t("checkout.reviewNotice")}</h3>
              <p className="text-sm text-muted-foreground">{t("checkout.reviewDesc")}</p>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${agreedTerms ? "bg-primary border-primary" : "border-border group-hover:border-muted-foreground"}`}>
              {agreedTerms && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <input type="checkbox" className="hidden" checked={agreedTerms} disabled={isProcessingCheckout} onChange={(event) => setAgreedTerms(event.target.checked)} />
            <span className="text-sm text-muted-foreground">{t("checkout.reviewAgree")}</span>
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass mb-6 rounded-xl p-4 sm:p-6"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> {t("checkout.step1")}
          </h3>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { key: "own-account" as DeliveryMethod, icon: User, label: t("checkout.upgrade") },
              { key: "ready-made" as DeliveryMethod, icon: Package, label: t("checkout.readyMade") },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDelivery(key)}
                disabled={isProcessingCheckout}
                className={`rounded-lg border p-4 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${isArabic ? "text-right" : "text-left"} ${
                  delivery === key
                    ? "border-primary bg-primary/10 orange-glow"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${delivery === key ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`font-medium ${delivery === key ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {delivery === "own-account" ? (
              <motion.div
                key="own"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <input type="email" placeholder={t("checkout.ownEmail")} value={email} disabled={isProcessingCheckout} onFocus={() => trackFieldInteraction("Account Email")} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
                <input type="password" placeholder={t("checkout.platformPassword")} value={password} disabled={isProcessingCheckout} onFocus={() => trackFieldInteraction("Platform Password")} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
                <p className="text-xs text-muted-foreground">{t("checkout.ownAccountHelp")}</p>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <input type="email" placeholder={t("checkout.readyEmail")} value={email} disabled={isProcessingCheckout} onFocus={() => trackFieldInteraction("Ready-Made Email")} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
                <p className="text-xs text-muted-foreground">{t("checkout.readyHelp")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass mb-6 rounded-xl p-4 sm:p-6"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> {t("checkout.step2")}
          </h3>

          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  allowVodafone
                    ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                    : "border-primary/30 bg-primary/10 text-foreground"
                }`}
              >
                {showAllPaymentsFallback
                  ? geoStatus === "loading"
                    ? t("checkout.detectingRegion")
                    : t("checkout.fallbackMethodsBadge")
                  : isEgyptSelected
                    ? t("checkout.localMethodsBadge")
                    : t("checkout.globalMethodsBadge")}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {selectedCountry
                  ? `${selectedCountry.flag} ${selectedCountry.name} (${selectedCountry.dialCode})`
                  : detectedCountryCode !== "INTL" && detectedCountryCode
                    ? `${detectedCountryName} (${detectedCountryCode})`
                    : t("checkout.countryControlHint")}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">{t("checkout.countryPaymentHint")}</p>

            <CountryCombobox
              value={countryCode}
              onChange={handleCountryChange}
              countries={countries}
              disabled={isProcessingCheckout}
              className="premium-scrollbar"
            />
          </div>

          {!showAllPaymentsFallback && !isEgyptSelected && (
            <p className="mb-4 text-xs text-muted-foreground">{t("checkout.globalMethodsNotice")}</p>
          )}

          <motion.div layout className={`mb-5 grid grid-cols-1 gap-2 ${availablePayments.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {availablePayments.map(({ key, icon: Icon, label }) => (
                <motion.button
                  layout
                  key={key}
                  type="button"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  onClick={() => handlePaymentChange(key)}
                  disabled={isProcessingCheckout}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-0 ${
                    payment === key
                      ? "border-primary bg-primary/10 text-foreground orange-glow"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{t("checkout.paymentMethod")}</span> {getPaymentMethodLabel(payment, t)} • {t("checkout.paymentMeta")}
          </div>

          <AnimatePresence mode="wait">
            {payment === "vodafone" && (
              <motion.div key="vf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="glass rounded-lg p-4 text-sm">
                  <p className="mb-2 text-foreground">{t("checkout.transferUsd")}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-lg font-bold text-primary">01004067162</span>
                    <CopyButton text="01004067162" label="vodafone" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{t("checkout.screenshotHelp")}</p>
                </div>

                <input
                  type="tel"
                  placeholder={t("checkout.senderPhone")}
                  value={senderPhone}
                  disabled={isProcessingCheckout}
                  onFocus={() => trackFieldInteraction("Vodafone Cash Number")}
                  onChange={(event) => setSenderPhone(event.target.value)}
                  className={`${inputClass} ${!isValidPhone(senderPhone) && senderPhone.length > 0 ? "border-red-500/70 focus:ring-red-500" : ""}`}
                />

                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">{t("checkout.uploadScreenshot")}</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm transition-all ${
                      screenshot
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/20"
                    }`}
                  >
                    <CloudUpload className={`h-8 w-8 ${screenshot ? "text-primary" : "text-muted-foreground"}`} />
                    {screenshot ? (
                      <span className="text-xs font-medium text-primary">{screenshot.name}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("checkout.clickToUpload")}</span>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isProcessingCheckout}
                      onChange={(event) => setScreenshot(event.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {payment === "crypto" && (
              <motion.div key="crypto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-foreground">{t("checkout.cryptoIntro")}</p>
                {[
                  { label: "BTC", address: "0x2c36f6613812ae3602a4e7665549f280c041f9b2" },
                  { label: "USDT (TRC20)", address: "TMgBGB6skUQTwQ79HSip7jgat3pbtAQiNi" },
                ].map(({ label, address }) => (
                  <div key={label} className="glass rounded-lg p-4">
                    <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 break-all text-xs text-primary">{address}</code>
                      <CopyButton text={address} label={label} />
                    </div>
                  </div>
                ))}
                <input type="text" placeholder={t("checkout.txid")} value={txid} disabled={isProcessingCheckout} onFocus={() => trackFieldInteraction("Crypto Transaction ID")} onChange={(event) => setTxid(event.target.value)} className={inputClass} />
                <p className="text-xs text-muted-foreground">{t("checkout.cryptoHelp")}</p>
              </motion.div>
            )}

            {payment === "card" && (
              <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(15,23,42,0.92))] p-4 text-xs text-muted-foreground">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-primary">{t("checkout.premiumCard")}</p>
                      <h4 className="font-heading text-lg font-bold text-foreground">{t("checkout.cardDetails")}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <VisaLogo />
                      <MastercardLogo />
                    </div>
                  </div>
                  <p>
                    {t("checkout.cardIntro")}
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-border bg-background/40 p-4">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t("checkout.cardNumber")}
                      value={cardNumber}
                      disabled={isProcessingCheckout}
                      onFocus={() => trackFieldInteraction("Card Number")}
                      onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                      className={`${inputClass} pr-28 font-mono tracking-[0.2em] ${
                        !isCardNumberValid && cleanedCardNumber.length === 16 ? "border-red-500/70 focus:ring-red-500" : ""
                      }`}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      {cardBrand === "visa" ? (
                        <VisaLogo />
                      ) : cardBrand === "mastercard" ? (
                        <MastercardLogo />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Visa / Mastercard</span>
                      )}
                    </div>
                  </div>

                  {!isCardNumberValid && cleanedCardNumber.length === 16 && (
                    <p className="text-xs text-red-400">{t("checkout.cardInvalid")}</p>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      disabled={isProcessingCheckout}
                      onFocus={() => trackFieldInteraction("Card Expiry")}
                      onChange={(event) => setCardExpiry(formatCardExpiry(event.target.value))}
                      className={`${inputClass} ${!isCardExpiryValid && cardExpiry.length === 5 ? "border-red-500/70 focus:ring-red-500" : ""}`}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="CVC"
                      value={cardCvc}
                      disabled={isProcessingCheckout}
                      onFocus={() => trackFieldInteraction("Card CVC")}
                      onChange={(event) => setCardCvc(formatCardCvc(event.target.value))}
                      className={`${inputClass} ${!isCardCvcValid && cardCvc.length > 0 ? "border-red-500/70 focus:ring-red-500" : ""}`}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder={t("checkout.cardholder")}
                    value={cardName}
                    disabled={isProcessingCheckout}
                    onFocus={() => trackFieldInteraction("Cardholder Name")}
                    onChange={(event) => setCardName(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    {t("checkout.reviewWindow")}
                  </span>
                  <div className="flex items-center gap-2">
                    <VisaLogo />
                    <MastercardLogo />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {payment !== "card" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass mb-6 rounded-xl p-4 sm:p-5"
          >
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${confirmedTransfer ? "bg-primary border-primary" : "border-border group-hover:border-muted-foreground"}`}>
                {confirmedTransfer && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <input type="checkbox" className="hidden" checked={confirmedTransfer} onChange={(event) => setConfirmedTransfer(event.target.checked)} />
              <span className="text-sm text-muted-foreground">
                {t("checkout.confirmTransfer")}
              </span>
            </label>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={isFormValid && !isProcessingCheckout ? { scale: 1.02 } : {}}
          whileTap={isFormValid && !isProcessingCheckout ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={!isFormValid || isProcessingCheckout}
          className={`w-full rounded-xl py-4 font-heading text-base font-bold transition-all sm:text-lg ${
            isFormValid && !isProcessingCheckout
              ? "btn-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {submitting ? t("checkout.secureProcessing") : `${t("checkout.completeOrder")} — $${plan.discountedPrice.toFixed(2)}`}
        </motion.button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t("checkout.afterSubmit")} <span className="text-foreground font-medium">{t("checkout.getHelp")}</span> {t("checkout.afterSubmitTail")}
        </p>

        <div className="mt-6">
          <SecurityBadges emphasize showThreeDSecure />
        </div>
      </main>

      <OrderReceiptModal
        open={receiptOpen}
        order={submittedOrder}
        onClose={() => setReceiptOpen(false)}
        onViewDetails={(orderId) => {
          setReceiptOpen(false);
          navigate(`/orders/${orderId}`, { state: { orderId } });
        }}
      />

      <AnimatePresence>
        {payment === "card" && (submitting || Boolean(processingCardOrderId)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[linear-gradient(180deg,rgba(3,10,17,0.92),rgba(3,10,17,0.97))] p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-emerald-400/15 bg-[linear-gradient(145deg,rgba(7,18,14,0.96),rgba(8,16,26,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.14),transparent_48%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.08),transparent_40%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

              <div className="relative space-y-6 p-6 sm:p-8">
                <SecureVerificationSpinner />

                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/90">{t("checkout.secureProcessing")}</p>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-foreground sm:text-[30px]">{t("checkout.processingPayment")}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t("checkout.bankVerification")}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t("checkout.orderId")}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{submittedOrder?.id ?? "Generating..."}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t("checkout.packageName")}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{submittedOrder?.planName ?? plan.name}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t("checkout.paymentMethodLabel")}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{getPaymentMethodLabel("card", t)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SupportButton />
    </div>
  );
};

export default Checkout;
