import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Clock3,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ORDER_SUPPORT_URL } from "@/context/OrderCenterContext";
import { useLanguage } from "@/context/LanguageContext";

const footerCopy = {
  en: {
    title: "Nitro X for topping up all AI services at better prices with dependable processing",
    intro: [
      "Nitro X provides top-up and subscription access for AI services at special prices that are often lower than many other available methods, with a strong focus on speed, safety, and reliability in order handling.",
      "We work to provide users with a simple and clear way to obtain different AI subscriptions and services without unnecessary complexity, while keeping the process smooth, secure, and easy to follow.",
    ],
    pricingTitle: "We top up AI services at lower prices",
    pricingBody:
      "Through Nitro X, you can request top-ups for different AI tools and services at low and suitable prices while still receiving strong value for the cost. Our goal is to provide a cheaper, clearer, and more dependable way to get the service you need.",
    pricingPoints: [
      "Fair pricing",
      "Fast execution",
      "Safer processing",
      "Clear order steps",
      "Customer follow-up until completion",
    ],
    speedTitle: "Fast, safe, and reliable execution",
    speedBody:
      "We focus on combining speed, safety, and reliability so that orders are processed as quickly as possible while keeping every step clear, organized, and easy to follow.",
    speedPoints: ["Clear", "Organized", "Safe", "Easy to track", "Suitable for the user"],
    timingTitle: "Typical order timing",
    timingBody:
      "In most cases, orders are completed within 15 minutes after confirmation and the review begins. Some orders may need extra time depending on the order state or execution pressure, but the usual duration does not exceed one hour.",
    timingPoints: [
      "Fast handling often begins within minutes",
      "Most orders are processed within 15 minutes",
      "Some cases may take a little longer",
      "The usual duration does not exceed one hour",
    ],
    trustTitle: "Trusted and organized platform",
    trustBody:
      "Nitro X aims to provide a dependable and organized service for AI top-ups while keeping customer comfort, clarity, and ease of use in focus. The platform is designed to remain clear and every order easy to follow.",
    trustPoints: [
      "Cheaper prices",
      "Faster top-ups",
      "Dependable execution",
      "Clear support",
      "Simple follow-up",
      "Support available when needed",
    ],
    supportTitle: "Support and follow-up",
    supportBody:
      "If you need help or have any question about your order, you can contact our support through the available channels on the site. You can also use the direct Telegram button for faster communication.",
    supportTopics: [
      "Order status",
      "General questions",
      "Help during top-up",
      "Clarification about execution",
    ],
    emailLabel: "Support email",
    telegram: "Contact via Telegram",
    noteTitle: "Important note",
    noteBody:
      "We continue to focus on price, speed, safety, clarity, and easy communication so the service remains as fast, clear, secure, and cost-effective as possible.",
    bottomNote: "Premium AI subscriptions • clear order tracking • responsive support",
  },
  ar: {
    title: "منصة Nitro X لشحن جميع خدمات الذكاء الاصطناعي بأسعار أرخص وبشكل مضمون",
    intro: [
      "توفر لك منصة Nitro X خدمة شحن واشتراكات جميع خدمات الذكاء الاصطناعي بأسعار مميزة وأرخص من الكثير من الطرق الأخرى، مع التركيز على السرعة، الأمان، والاعتمادية في تنفيذ الطلبات.",
      "نحن نعمل على توفير أفضل حلول الشحن للمستخدمين الذين يبحثون عن طريقة سهلة وواضحة للحصول على اشتراكات وخدمات AI المختلفة بدون تعقيد، وبأفضل سعر ممكن، مع وجود دعم جاهز للمتابعة عند الحاجة.",
    ],
    pricingTitle: "نقوم بشحن جميع خدمات AI بأسعار منخفضة",
    pricingBody:
      "من خلال Nitro X يمكنك طلب شحن مختلف خدمات وأدوات الذكاء الاصطناعي بأسعار منخفضة ومناسبة، مع الحرص على تقديم قيمة قوية مقابل السعر. هدفنا هو أن نوفر للمستخدم أفضل وسيلة للحصول على الخدمة التي يحتاجها بسعر أرخص، وبطريقة مضمونة، مع دعم مستمر طوال مراحل الطلب.",
    pricingPoints: [
      "السعر المناسب",
      "السرعة في التنفيذ",
      "الأمان أثناء المعالجة",
      "وضوح خطوات الطلب",
      "متابعة العميل حتى انتهاء الطلب",
    ],
    speedTitle: "أفضل شحن وأسرع تنفيذ وأكثر أمانًا",
    speedBody:
      "نعمل في Nitro X على تقديم تجربة شحن تجمع بين السرعة والأمان والاعتمادية. نحن نهتم بأن تتم معالجة الطلبات في أسرع وقت ممكن، مع الحفاظ على تنظيم واضح لكل طلب حتى تصل الخدمة بشكل سليم.",
    speedPoints: ["واضحة", "منظمة", "آمنة", "سهلة المتابعة", "مناسبة للمستخدم"],
    timingTitle: "مدة تنفيذ الطلبات",
    timingBody:
      "في أغلب الحالات يتم تنفيذ الطلبات خلال 15 دقيقة من وقت تأكيد الطلب وبدء المراجعة. وقد تحتاج بعض الطلبات إلى وقت إضافي حسب حالة الطلب أو ضغط التنفيذ، ولكن في العادة لا تتجاوز المدة ساعة واحدة.",
    timingPoints: [
      "التنفيذ السريع يبدأ غالبًا خلال دقائق",
      "أغلب الطلبات يتم التعامل معها خلال 15 دقيقة",
      "في بعض الحالات قد تستغرق العملية وقتًا أطول قليلًا",
      "لكن المدة المعتادة لا تتجاوز ساعة واحدة",
    ],
    trustTitle: "منصة معتمدة وموثوقة",
    trustBody:
      "تسعى Nitro X لتقديم خدمة موثوقة ومنظمة في مجال شحن خدمات الذكاء الاصطناعي، مع التركيز على راحة العميل وسهولة الاستخدام. نحن نهتم أن تكون المنصة واضحة، وأن تكون المعلومات المعروضة مفهومة، وأن يكون كل طلب قابل للمتابعة بشكل بسيط ومباشر.",
    trustPoints: [
      "أسعار أرخص",
      "شحن أسرع",
      "تنفيذ مضمون",
      "دعم واضح",
      "متابعة سهلة",
      "دعم متاح عند الحاجة",
    ],
    supportTitle: "الدعم والمتابعة",
    supportBody:
      "إذا احتجت إلى أي مساعدة أو كان لديك أي استفسار بخصوص طلبك، يمكنك التواصل مع الدعم الخاص بنا من خلال القنوات المتاحة في الموقع. كما يمكنك استخدام زر التواصل المباشر عبر تيليجرام للوصول إلى الدعم بشكل أسرع.",
    supportTopics: [
      "حالة الطلب",
      "الاستفسارات العامة",
      "المساعدة أثناء الشحن",
      "توضيح أي نقطة متعلقة بالتنفيذ",
    ],
    emailLabel: "البريد الإلكتروني للدعم",
    telegram: "تواصل عبر تيليجرام",
    noteTitle: "ملاحظة مهمة",
    noteBody:
      "نحن نعمل على تقديم أفضل تجربة ممكنة في شحن خدمات الذكاء الاصطناعي من حيث السعر والسرعة والأمان والوضوح وسهولة التواصل، ولهذا نحرص دائمًا على أن تكون الخدمة أسرع ما يمكن وأوضح ما يمكن وأكثر أمانًا وبأفضل سعر ممكن.",
    bottomNote: "شحن AI منظم • متابعة واضحة للطلب • دعم سريع عند الحاجة",
  },
} as const;

type SectionCard = {
  icon: LucideIcon;
  title: string;
  body: string;
  points: readonly string[];
};

const SiteFooter = () => {
  const { language } = useLanguage();
  const copy = footerCopy[language];
  const alignClass = language === "ar" ? "text-right" : "text-left";

  const cards: SectionCard[] = [
    {
      icon: BadgeDollarSign,
      title: copy.pricingTitle,
      body: copy.pricingBody,
      points: copy.pricingPoints,
    },
    {
      icon: ShieldCheck,
      title: copy.speedTitle,
      body: copy.speedBody,
      points: copy.speedPoints,
    },
    {
      icon: Clock3,
      title: copy.timingTitle,
      body: copy.timingBody,
      points: copy.timingPoints,
    },
    {
      icon: Sparkles,
      title: copy.trustTitle,
      body: copy.trustBody,
      points: copy.trustPoints,
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
      className="relative px-4 pb-10 pt-2 sm:px-6 sm:pb-12"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="glass-strong gradient-border relative overflow-hidden rounded-[28px] p-4 sm:p-6 md:p-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-8 top-6 select-none text-[4.5rem] font-black tracking-[0.38em] text-white/[0.03] sm:text-[7rem]">
              NITRO X
            </div>
            <div className="absolute -bottom-12 left-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -top-8 right-10 h-28 w-28 rounded-full bg-primary/6 blur-3xl" />
          </div>

          <div className={`relative z-10 ${alignClass}`}>
            <div className="mb-4 rounded-2xl border border-white/5 bg-black/20 p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary/90">Nitro X</p>
              <h2 className="mt-2 font-heading text-xl font-bold leading-snug text-foreground sm:text-2xl">
                {copy.title}
              </h2>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {copy.intro.map((paragraph, index) => (
                  <p key={`intro-${index}`} className="text-sm leading-6 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {cards.map(({ icon: Icon, title, body, points }) => (
                <div
                  key={title}
                  className="glass relative overflow-hidden rounded-[22px] border border-white/5 p-4 sm:p-5"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">{body}</p>

                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="glass relative overflow-hidden rounded-[22px] border border-primary/15 p-4 sm:p-5 xl:col-span-2">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {copy.supportTitle}
                  </h3>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">{copy.supportBody}</p>

                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {copy.supportTopics.map((topic) => (
                    <li
                      key={topic}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.emailLabel}
                    </p>
                    <a
                      href="mailto:nitro124@gmail.com"
                      className="mt-1 block text-sm font-medium text-primary hover:text-primary/80"
                    >
                      nitro124@gmail.com
                    </a>
                  </div>

                  <a
                    href={ORDER_SUPPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    <Send className="h-4 w-4" />
                    {copy.telegram}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 xl:col-span-2">
                <p className="font-heading text-sm font-semibold text-foreground">{copy.noteTitle}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.noteBody}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Nitro X</p>
              <p>{copy.bottomNote}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default SiteFooter;
