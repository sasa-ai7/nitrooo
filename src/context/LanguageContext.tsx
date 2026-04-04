import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "ar";

type TranslationValue = string | string[];
type TranslationTree = { [key: string]: TranslationValue | TranslationTree };

const STORAGE_KEY = "nitro-x-language";

const translations = {
  en: {
    language: { english: "EN", arabic: "العربية", switchLabel: "Language" },
    header: {
      promo: "Premium AI Subscriptions at 50% OFF",
      support: "Support",
      notifications: "Order Notifications",
      recentUpdates: "Recent payment and order updates",
      markAllRead: "Mark all read",
      noNotifications: "No notifications yet",
      noNotificationsDesc: "Your latest order updates will appear here.",
      orderId: "Order ID",
      platform: "Platform",
      package: "Package",
      payment: "Payment",
      copyId: "Copy ID",
      getHelp: "Get Help",
      contactTelegram: "Contact support on Telegram",
    },
    promoBanner: {
      exploreLabel: "Explore AI platform plans",
      items: [
        "50% OFF",
        "Limited Time Offer",
        "Special Deal",
        "More Offers",
        "Premium AI Access",
        "Choose Your Plan",
        "Click to Explore",
      ],
    },
    hero: {
      badge: "Limited Time — 50% Off All AI Platforms",
      titleLine1: "Premium AI Access",
      titleLine2: "Half the Price",
      subtitle:
        "Get legitimate subscriptions to the world's top AI platforms — ChatGPT, Gemini, GitHub, Cursor, Grok, Kimi, and more — at an unbeatable 50% discount.",
      secure: "100% Secure",
      delivery: "Instant Delivery",
      support: "24/7 Support",
    },
    cards: {
      plansAvailable: "plans available",
      planAvailable: "plan available",
      viewPlans: "View Plans",
      buyNow: "Buy Now",
    },
    security: {
      ssl: "SSL Encrypted",
      encrypted: "End-to-End Encrypted",
      threeDSecure: "3D Secure",
    },
    checkout: {
      noProduct: "No product selected",
      backToStore: "Back to Store",
      reviewNotice: "Order Review Notice",
      reviewDesc:
        "Vodafone Cash reviews can take up to 3 minutes, while crypto and card updates usually appear in about 1 minute. If a review fails, use support with your Order ID.",
      reviewAgree: "I understand that payment verification may require manual review.",
      step1: "Step 1: Choose Delivery Method",
      upgrade: "Upgrade My Account",
      readyMade: "Ready-Made Account",
      ownEmail: "Your account email",
      platformPassword: "Your platform password",
      ownAccountHelp:
        "Only provide the login for the AI platform account you want upgraded. We will never ask for your personal email password.",
      readyEmail: "Your email (to receive account details)",
      readyHelp: "A ready-made account will be delivered to this email after your order is reviewed.",
      step2: "Step 2: Choose Payment Method",
      paymentMethod: "Payment method:",
      paymentMeta: "Only safe order metadata is retained, and pricing plus payment eligibility are verified securely server-side.",
      detectingRegion: "Checking the best payment setup for your location...",
      localMethodsBadge: "Local payment methods available 🇪🇬",
      fallbackMethodsBadge: "All payment methods currently available",
      globalMethodsBadge: "Global secure checkout active",
      globalMethodsNotice: "For your selected country, Nitro X currently supports secure card and crypto payments only.",
      countryPaymentHint: "Payment methods vary based on the selected country.",
      countryControlHint: "Select your country to update payment methods",
      transferUsd: "Transfer the exact amount in USD to:",
      screenshotHelp:
        "Add the sender phone number and upload a clear screenshot. If the image is unclear after 3 minutes, the payment will be rejected and routed to support.",
      senderPhone: "Sender Phone Number",
      uploadScreenshot: "Upload transfer screenshot",
      clickToUpload: "Click to upload transfer screenshot",
      cryptoIntro: "Transfer the exact amount to one of the wallets below:",
      txid: "Paste your Transaction Hash (TXID)",
      cryptoHelp:
        "If confirmation is not received within about 1 minute, the order will be marked as failed because of a wallet provider issue.",
      premiumCard: "Premium Secure Checkout",
      cardDetails: "Card details",
      cardIntro:
        "This Stripe-style layout is provider-ready. In production, a PCI-compliant processor should handle authentication and return only the payment result to Nitro X.",
      cardNumber: "Card Number",
      cardholder: "Name on Card",
      reviewWindow: "Secure processor review window: about 1 minute.",
      confirmTransfer: "I confirm that the transfer reference I submitted is correct and ready for review.",
      completeOrder: "Complete Order",
      afterSubmit: "After submission, updates appear in the notification bell. If a review fails, use",
      getHelp: "Get Help",
      afterSubmitTail: "to open support with your Order ID.",
      requiredFields: "Please fill in all required fields correctly.",
      copied: "Copied",
      processingStarted: "3D Secure verification started",
      processingDesc: "Please wait about 1 minute while the secure payment processor returns the final result.",
      secureProcessing: "Secure Processing",
      processingPayment: "Processing your payment",
      bankVerification:
        "Please wait while your bank completes 3D Secure verification. This secure screen will update automatically in about 1 minute.",
      packageName: "Package Name",
      orderId: "Order ID",
      paymentMethodLabel: "Payment Method",
      countryPlaceholder: "Select country",
      cardInvalid: "Please enter a valid Visa or Mastercard number.",
    },
    payments: {
      vodafone: "Vodafone Cash",
      crypto: "Crypto",
      card: "Credit Card",
    },
    supportChat: {
      title: "Nitro X Support",
      online: "● Online",
      welcome: "Welcome to Nitro X Support! 👋 How can I help you today? Please choose a topic below.",
      q1: "How does the payment and delivery work?",
      q2: "When will I receive my account?",
      q3: "What if I choose 'Upgrade My Account'?",
      a1: "1. Choose your plan.\n2. Transfer the exact amount.\n3. Upload the receipt/TXID.\n4. Our team reviews the payment and delivers your account!",
      a2: "Delivery usually takes 5 to 15 minutes after we verify your payment transfer. We will contact you via the email you provided.",
      a3: "⚠️ IMPORTANT: If you choose 'Upgrade My Account', you only need to provide the login details for the AI Platform itself (e.g., your ChatGPT login). DO NOT send us your personal Google/Gmail password. Your privacy is our top priority.",
      orderPrompt: "I’m ready to help with Order ID {{orderId}}. Please describe the issue here, then open Telegram below if you need a human agent.",
      human: "Talk to Human Support",
      floatingTitle: "Contact Support",
    },
    notifications: {
      submittedAt: "Submitted At",
      copyOrderId: "Copy Order ID",
      dismiss: "Dismiss notification",
    },
    receipt: {
      title: "Digital Receipt",
      subtitle: "Order received and queued for review",
      submitted: "Order Submitted",
      nextSteps: "Next steps",
      step1: "Your payment status is currently under review.",
      step2: "We will contact you through the website or by email.",
      step3: "Keep your Order ID ready for any support request.",
      contactSupport: "Contact support if needed",
      saveReceipt: "Save Receipt",
      viewDetails: "View Order Details",
      submittedDesc:
        "Your order is being processed. We will contact you via the website or your email. A notification will appear here or in your inbox. Please monitor both carefully.",
      platform: "Platform",
      packageName: "Package Name",
      paymentMethod: "Payment Method",
    },
    orderResult: {
      notFound: "Order not found",
      notFoundDesc: "We could not locate that order. Please return to the store or contact support.",
      received: "Order received",
      updateShown: "Your latest payment review update is shown below.",
      orderDate: "Order Date & Time",
      customerEmail: "Customer Email",
      currentStatus: "Current Status",
      nextSteps: "Next steps",
      contactSupport: "Contact Support",
    },
    notFound: {
      title: "Oops! Page not found",
      backHome: "Return to Home",
    },
    country: {
      search: "Search country...",
      none: "No country found.",
    },
    toasts: {
      orderSubmitted: "Order submitted successfully",
      orderCopied: "Order ID copied",
      vodafoneFailed: "❌ Order Rejected",
      cryptoFailed: "❌ Transaction Failed",
      cardDeclined: "❌ Payment Declined",
      vodafoneScreenshot: "The transfer screenshot is not clear enough. Please re-upload a high-quality image or contact support.",
      cryptoIssue: "We are experiencing issues with this wallet provider. Please try a different payment method.",
      cardIssue: "There is an issue with your card details. Please verify your information or try another card.",
    },
    statuses: {
      awaitingReview: "Awaiting Review",
      vodafoneSubmitted: "Vodafone Cash Submitted",
      vodafonePending:
        "Your Vodafone Cash transfer is under review. Please keep your sender number and screenshot ready while we verify the payment.",
      vodafoneSupport: "If verification fails, support may ask you to resend a clearer screenshot.",
      rejected: "Rejected",
      screenshotNotClear: "Order rejected",
      screenshotNotClearDesc:
        "The transfer screenshot is not clear enough. Please re-upload a high-quality image or contact support.",
      screenshotSupport: "Open support and share your Order ID together with a clearer Vodafone Cash screenshot.",
      awaitingConfirmation: "Awaiting Confirmation",
      cryptoPendingTitle: "Crypto Payment Pending",
      cryptoPending:
        "Your crypto payment is being checked with the wallet provider. This usually updates within about 1 minute.",
      cryptoSupport: "Keep your TXID ready in case support asks for it.",
      failed: "Failed",
      walletIssue: "Transaction failed",
      walletIssueDesc:
        "We are experiencing issues with this wallet provider. Please try a different payment method.",
      walletSupport: "Open support and share your Order ID and TXID for faster assistance.",
      processing: "Processing",
      cardProcessing: "Card Payment Processing",
      cardPending:
        "Your card payment is being securely processed. Please keep this page open while the provider returns the final result.",
      cardSupport: "If the payment does not complete, contact support with your Order ID.",
      declined: "Declined",
      cardDeclinedTitle: "Payment declined",
      cardDeclinedDesc:
        "There is an issue with your card details. Please verify your information or try another card.",
      cardSupportFinal: "Open support if you need help with another payment option.",
    },
  },
  ar: {
    language: { english: "EN", arabic: "العربية", switchLabel: "اللغة" },
    header: {
      promo: "اشتراكات AI مميزة بخصم 50%",
      support: "الدعم",
      notifications: "إشعارات الطلبات",
      recentUpdates: "آخر تحديثات الدفع والطلبات",
      markAllRead: "تحديد الكل كمقروء",
      noNotifications: "لا توجد إشعارات بعد",
      noNotificationsDesc: "ستظهر هنا أحدث تحديثات طلباتك.",
      orderId: "رقم الطلب",
      platform: "المنصة",
      package: "الباقة",
      payment: "طريقة الدفع",
      copyId: "نسخ الرقم",
      getHelp: "الحصول على مساعدة",
      contactTelegram: "تواصل مع الدعم عبر تيليجرام",
    },
    promoBanner: {
      exploreLabel: "استعرض خطط منصات الذكاء الاصطناعي",
      items: [
        "خصم 50%",
        "عرض لفترة محدودة",
        "صفقة مميزة",
        "عروض أكثر",
        "وصول AI مميز",
        "اختر خطتك",
        "اضغط للاستكشاف",
      ],
    },
    hero: {
      badge: "لفترة محدودة — خصم 50% على جميع المنصات",
      titleLine1: "وصول مميز إلى AI",
      titleLine2: "بنصف السعر",
      subtitle:
        "احصل على اشتراكات أصلية لأفضل منصات الذكاء الاصطناعي — ChatGPT وGemini وGitHub وCursor وGrok وKimi وغير ذلك — بخصم يصل إلى 50%.",
      secure: "أمان 100%",
      delivery: "تسليم فوري",
      support: "دعم 24/7",
    },
    cards: {
      plansAvailable: "خطط متاحة",
      planAvailable: "خطة متاحة",
      viewPlans: "عرض الخطط",
      buyNow: "اشتر الآن",
    },
    security: {
      ssl: "تشفير SSL",
      encrypted: "تشفير من الطرف إلى الطرف",
      threeDSecure: "حماية 3D Secure",
    },
    checkout: {
      noProduct: "لم يتم اختيار أي منتج",
      backToStore: "العودة إلى المتجر",
      reviewNotice: "ملاحظة مراجعة الطلب",
      reviewDesc:
        "قد تستغرق مراجعة فودافون كاش حتى 3 دقائق، بينما تظهر تحديثات الكريبتو والبطاقات غالبًا خلال دقيقة واحدة. إذا فشلت المراجعة، استخدم الدعم مع رقم الطلب.",
      reviewAgree: "أفهم أن التحقق من الدفع قد يتطلب مراجعة يدوية.",
      step1: "الخطوة 1: اختر طريقة التسليم",
      upgrade: "ترقية حسابي",
      readyMade: "حساب جاهز",
      ownEmail: "بريد حسابك",
      platformPassword: "كلمة مرور المنصة",
      ownAccountHelp:
        "أدخل فقط بيانات تسجيل الدخول الخاصة بمنصة الذكاء الاصطناعي التي تريد ترقيتها. لن نطلب منك أبدًا كلمة مرور بريدك الشخصي.",
      readyEmail: "بريدك الإلكتروني (لاستلام بيانات الحساب)",
      readyHelp: "سيتم إرسال الحساب الجاهز إلى هذا البريد بعد مراجعة الطلب.",
      step2: "الخطوة 2: اختر طريقة الدفع",
      paymentMethod: "طريقة الدفع:",
      paymentMeta: "يتم الاحتفاظ فقط ببيانات الطلب الآمنة، ويتم التحقق من السعر وأهلية الدفع بأمان على الخادم.",
      detectingRegion: "جارٍ التحقق من أفضل إعدادات الدفع لموقعك...",
      localMethodsBadge: "وسائل دفع محلية متاحة 🇪🇬",
      fallbackMethodsBadge: "جميع وسائل الدفع متاحة حاليًا",
      globalMethodsBadge: "دفع عالمي آمن مفعل",
      globalMethodsNotice: "بالنسبة للدولة المحددة، يدعم Nitro X حاليًا فقط الدفع الآمن بالبطاقة والعملات الرقمية.",
      countryPaymentHint: "وسائل الدفع تتغير حسب الدولة المحددة.",
      countryControlHint: "اختر دولتك لتحديث وسائل الدفع",
      transferUsd: "حوّل المبلغ المطلوب بالدولار الأمريكي إلى:",
      screenshotHelp:
        "أدخل رقم هاتف المُرسل وارفع لقطة شاشة واضحة. إذا لم تكن الصورة واضحة بعد 3 دقائق فسيتم رفض الدفع وتحويلك إلى الدعم.",
      senderPhone: "رقم هاتف المُرسل",
      uploadScreenshot: "ارفع لقطة شاشة التحويل",
      clickToUpload: "اضغط لرفع لقطة شاشة التحويل",
      cryptoIntro: "حوّل المبلغ المطلوب إلى إحدى المحافظ التالية:",
      txid: "ألصق Transaction Hash (TXID)",
      cryptoHelp:
        "إذا لم يصل التأكيد خلال دقيقة تقريبًا، سيتم اعتبار الطلب فاشلًا بسبب مشكلة لدى مزود المحفظة.",
      premiumCard: "دفع آمن مميز",
      cardDetails: "بيانات البطاقة",
      cardIntro:
        "هذا النموذج جاهز للدمج مع مزود دفع احترافي. في بيئة الإنتاج، يجب أن يتولى مزود متوافق مع PCI التحقق وإعادة نتيجة الدفع فقط إلى Nitro X.",
      cardNumber: "رقم البطاقة",
      cardholder: "الاسم على البطاقة",
      reviewWindow: "مدة مراجعة المعالج الآمن: حوالي دقيقة واحدة.",
      confirmTransfer: "أؤكد أن بيانات التحويل التي أرسلتها صحيحة وجاهزة للمراجعة.",
      completeOrder: "إتمام الطلب",
      afterSubmit: "بعد الإرسال، ستظهر التحديثات في جرس الإشعارات. إذا فشلت المراجعة، استخدم",
      getHelp: "الحصول على مساعدة",
      afterSubmitTail: "لفتح الدعم باستخدام رقم الطلب.",
      requiredFields: "يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.",
      copied: "تم النسخ",
      processingStarted: "بدأ التحقق الآمن 3D Secure",
      processingDesc: "يرجى الانتظار حوالي دقيقة واحدة حتى يعيد مزود الدفع النتيجة النهائية.",
      secureProcessing: "معالجة آمنة",
      processingPayment: "جارٍ معالجة الدفع",
      bankVerification:
        "يرجى الانتظار بينما يكمل البنك التحقق الآمن 3D Secure. سيتم تحديث هذه الشاشة تلقائيًا خلال حوالي دقيقة واحدة.",
      packageName: "اسم الباقة",
      orderId: "رقم الطلب",
      paymentMethodLabel: "طريقة الدفع",
      countryPlaceholder: "اختر الدولة",
      cardInvalid: "يرجى إدخال رقم Visa أو Mastercard صحيح.",
    },
    payments: {
      vodafone: "فودافون كاش",
      crypto: "العملات الرقمية",
      card: "بطاقة ائتمان",
    },
    supportChat: {
      title: "دعم Nitro X",
      online: "● متصل الآن",
      welcome: "مرحبًا بك في دعم Nitro X! 👋 كيف يمكنني مساعدتك اليوم؟ اختر موضوعًا من الأسفل.",
      q1: "كيف تتم عملية الدفع والتسليم؟",
      q2: "متى سأستلم الحساب؟",
      q3: "ماذا لو اخترت ترقية حسابي؟",
      a1: "1. اختر خطتك.\n2. حوّل المبلغ المطلوب.\n3. ارفع الإيصال أو TXID.\n4. يراجع فريقنا الدفع ثم يسلّمك الحساب!",
      a2: "يستغرق التسليم عادةً من 5 إلى 15 دقيقة بعد التحقق من التحويل. سنتواصل معك عبر البريد الذي أدخلته.",
      a3: "⚠️ مهم: إذا اخترت ترقية حسابك، فأنت تحتاج فقط إلى بيانات تسجيل الدخول الخاصة بمنصة الذكاء الاصطناعي نفسها (مثل ChatGPT). لا ترسل كلمة مرور Gmail أو بريدك الشخصي. خصوصيتك أولوية قصوى لدينا.",
      orderPrompt: "أنا جاهز لمساعدتك بخصوص رقم الطلب {{orderId}}. صف المشكلة هنا، ثم افتح تيليجرام في الأسفل إذا كنت بحاجة إلى دعم بشري.",
      human: "التحدث مع الدعم البشري",
      floatingTitle: "تواصل مع الدعم",
    },
    notifications: {
      submittedAt: "وقت الإرسال",
      copyOrderId: "نسخ رقم الطلب",
      dismiss: "إخفاء الإشعار",
    },
    receipt: {
      title: "إيصال رقمي",
      subtitle: "تم استلام الطلب ووضعه في قائمة المراجعة",
      submitted: "تم إرسال الطلب",
      nextSteps: "الخطوات التالية",
      step1: "حالة الدفع لديك الآن قيد المراجعة.",
      step2: "سنتواصل معك عبر الموقع أو البريد الإلكتروني.",
      step3: "احتفظ برقم الطلب لأي تواصل مع الدعم.",
      contactSupport: "تواصل مع الدعم عند الحاجة",
      saveReceipt: "حفظ الإيصال",
      viewDetails: "عرض تفاصيل الطلب",
      submittedDesc:
        "طلبك قيد المعالجة الآن. سنتواصل معك عبر الموقع أو البريد الإلكتروني، كما ستظهر الإشعارات هنا أو في صندوق البريد. يرجى المتابعة جيدًا.",
      platform: "المنصة",
      packageName: "اسم الباقة",
      paymentMethod: "طريقة الدفع",
    },
    orderResult: {
      notFound: "الطلب غير موجود",
      notFoundDesc: "تعذر العثور على هذا الطلب. يرجى العودة إلى المتجر أو التواصل مع الدعم.",
      received: "تم استلام الطلب",
      updateShown: "يظهر آخر تحديث لمراجعة الدفع أدناه.",
      orderDate: "تاريخ ووقت الطلب",
      customerEmail: "البريد الإلكتروني",
      currentStatus: "الحالة الحالية",
      nextSteps: "الخطوات التالية",
      contactSupport: "تواصل مع الدعم",
    },
    notFound: {
      title: "عذرًا! الصفحة غير موجودة",
      backHome: "العودة إلى الرئيسية",
    },
    country: {
      search: "ابحث عن دولة...",
      none: "لم يتم العثور على دولة.",
    },
    toasts: {
      orderSubmitted: "تم إرسال الطلب بنجاح",
      orderCopied: "تم نسخ رقم الطلب",
      vodafoneFailed: "❌ تم رفض الطلب",
      cryptoFailed: "❌ فشلت المعاملة",
      cardDeclined: "❌ تم رفض الدفع",
      vodafoneScreenshot: "صورة التحويل غير واضحة بما يكفي. يرجى إعادة رفع صورة عالية الجودة أو التواصل مع الدعم.",
      cryptoIssue: "نواجه حاليًا مشكلة مع مزود هذه المحفظة. يرجى تجربة وسيلة دفع أخرى.",
      cardIssue: "توجد مشكلة في بيانات البطاقة. يرجى التحقق من معلوماتك أو تجربة بطاقة أخرى.",
    },
    statuses: {
      awaitingReview: "بانتظار المراجعة",
      vodafoneSubmitted: "تم إرسال فودافون كاش",
      vodafonePending:
        "تحويل فودافون كاش الخاص بك قيد المراجعة. احتفظ برقم المُرسل ولقطة الشاشة إلى حين اكتمال التحقق.",
      vodafoneSupport: "إذا فشل التحقق، قد يطلب منك الدعم إعادة إرسال لقطة شاشة أوضح.",
      rejected: "مرفوض",
      screenshotNotClear: "لقطة الشاشة غير واضحة",
      screenshotNotClearDesc:
        "تعذر علينا التحقق من تحويل فودافون كاش لأن لقطة الشاشة المرفوعة لم تكن واضحة بما يكفي. يرجى التواصل مع الدعم وإعادة إرسال صورة أوضح.",
      screenshotSupport: "افتح الدعم وشارك رقم الطلب مع لقطة شاشة واضحة لفودافون كاش.",
      awaitingConfirmation: "بانتظار التأكيد",
      cryptoPendingTitle: "دفع العملات الرقمية قيد الانتظار",
      cryptoPending:
        "يتم الآن التحقق من عملية الدفع عبر مزود المحفظة. عادةً ما يظهر التحديث خلال دقيقة تقريبًا.",
      cryptoSupport: "احتفظ بـ TXID في حال طلبه منك الدعم.",
      failed: "فشل",
      walletIssue: "فشلت المعاملة",
      walletIssueDesc:
        "نواجه حاليًا مشكلة مع مزود هذه المحفظة. يرجى تجربة وسيلة دفع أخرى.",
      walletSupport: "افتح الدعم وشارك رقم الطلب وTXID لتسريع المساعدة.",
      processing: "قيد المعالجة",
      cardProcessing: "معالجة الدفع بالبطاقة",
      cardPending:
        "يتم الآن معالجة الدفع بالبطاقة بشكل آمن. يرجى إبقاء هذه الصفحة مفتوحة حتى تظهر النتيجة النهائية.",
      cardSupport: "إذا لم يكتمل الدفع، تواصل مع الدعم باستخدام رقم الطلب.",
      declined: "مرفوض",
      cardDeclinedTitle: "تم رفض الدفع",
      cardDeclinedDesc:
        "توجد مشكلة في بيانات البطاقة. يرجى التحقق من معلوماتك أو تجربة بطاقة أخرى.",
      cardSupportFinal: "افتح الدعم إذا كنت بحاجة إلى مساعدة في اختيار طريقة دفع أخرى.",
    },
  },
} as const satisfies Record<Language, TranslationTree>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  dir: "ltr" | "rtl";
  isArabic: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tList: (key: string) => string[];
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getNestedValue = (tree: TranslationTree, key: string): TranslationValue | TranslationTree | undefined =>
  key.split(".").reduce<TranslationValue | TranslationTree | undefined>((acc, part) => {
    if (!acc || typeof acc === "string" || Array.isArray(acc)) {
      return undefined;
    }

    return acc[part];
  }, tree);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "en" || saved === "ar") {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    document.body.classList.toggle("font-arabic", language === "ar");

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getNestedValue(translations[language], key);
      const fallback = getNestedValue(translations.en, key);
      const text = typeof value === "string" ? value : typeof fallback === "string" ? fallback : key;

      if (!vars) return text;

      return Object.entries(vars).reduce(
        (result, [varKey, varValue]) => result.split(`{{${varKey}}}`).join(String(varValue)),
        text,
      );
    },
    [language],
  );

  const tList = useCallback(
    (key: string) => {
      const value = getNestedValue(translations[language], key);
      const fallback = getNestedValue(translations.en, key);
      if (Array.isArray(value)) return value;
      if (Array.isArray(fallback)) return fallback;
      return [];
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      dir: language === "ar" ? "rtl" : "ltr",
      isArabic: language === "ar",
      t,
      tList,
    }),
    [language, setLanguage, t, tList, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
