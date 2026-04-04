export interface Plan {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  descriptionAr?: string;
  plans: Plan[];
}

export const products: Product[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Advanced AI assistant powered by OpenAI's GPT models",
    descriptionAr: "مساعد ذكاء اصطناعي متقدم يعمل بنماذج OpenAI الحديثة.",
    plans: [
      { name: "Plus", originalPrice: 20.0, discountedPrice: 9.99, features: ["GPT-4o access", "Faster responses", "Image generation", "Advanced analysis"] },
      { name: "Pro", originalPrice: 200.0, discountedPrice: 99.99, features: ["Unlimited GPT-4o", "o1 pro mode", "Priority access", "Extended context"] },
      { name: "Business", originalPrice: 30.0, discountedPrice: 14.99, features: ["Team workspace", "Admin controls", "Data privacy", "Priority support"] },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Google's premium multimodal AI for research, writing, and productivity",
    descriptionAr: "ذكاء Google المميز للبحث والكتابة والإنتاجية متعددة الوسائط.",
    plans: [
      { name: "Advanced", originalPrice: 19.99, discountedPrice: 9.99, features: ["Gemini Advanced", "2 TB storage", "Long context help", "Priority access"] },
      { name: "AI Pro", originalPrice: 29.99, discountedPrice: 14.99, features: ["Advanced reasoning", "Workspace AI tools", "Premium speed", "Extra limits"] },
      { name: "Business", originalPrice: 39.99, discountedPrice: 19.99, features: ["Team collaboration", "Admin controls", "Enhanced privacy", "Priority support"] },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-first code editor for lightning-fast development",
    descriptionAr: "محرر برمجة يعتمد على الذكاء الاصطناعي لتطوير أسرع بكثير.",
    plans: [
      { name: "Pro", originalPrice: 20.0, discountedPrice: 9.99, features: ["500 fast requests", "Unlimited slow", "GPT-4 & Claude"] },
      { name: "Pro+", originalPrice: 60.0, discountedPrice: 29.99, features: ["3x fast requests", "Priority queue", "Advanced models"] },
      { name: "Ultra", originalPrice: 200.0, discountedPrice: 99.99, features: ["Unlimited fast", "All models", "Team features", "Priority support"] },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "GitHub Copilot for faster coding, reviews, and developer workflows",
    descriptionAr: "GitHub Copilot لكتابة الكود والمراجعات وسير العمل البرمجي بشكل أسرع.",
    plans: [
      { name: "Copilot Individual", originalPrice: 10.0, discountedPrice: 4.99, features: ["Code completions", "Chat in editor", "Multi-file suggestions"] },
      { name: "Copilot Pro", originalPrice: 20.0, discountedPrice: 9.99, features: ["Premium model access", "Priority features", "Advanced coding help"] },
      { name: "Copilot Business", originalPrice: 39.0, discountedPrice: 18.99, features: ["Team policy controls", "Org management", "Enterprise-ready security"] },
    ],
  },
  {
    id: "grok",
    name: "Grok",
    description: "xAI's witty and powerful conversational AI",
    descriptionAr: "مساعد xAI الحواري الذكي والقوي بأسلوب سريع ومرن.",
    plans: [
      { name: "Lite", originalPrice: 10.0, discountedPrice: 4.99, features: ["Grok-2 access", "Real-time data", "Basic analysis"] },
      { name: "SuperGrok", originalPrice: 30.0, discountedPrice: 14.99, features: ["Unlimited Grok-2", "Priority speed", "Image understanding", "DeepSearch"] },
    ],
  },
  {
    id: "lovable",
    name: "Lovable",
    description: "Build production-ready apps with AI assistance",
    descriptionAr: "أنشئ تطبيقات جاهزة للإنتاج بمساعدة الذكاء الاصطناعي.",
    plans: [
      { name: "Pro", originalPrice: 25.0, discountedPrice: 12.49, features: ["Unlimited projects", "AI full-stack", "Custom domains"] },
      { name: "Business", originalPrice: 50.0, discountedPrice: 24.99, features: ["All Pro features", "Team seats", "Priority builds", "Advanced integrations"] },
    ],
  },
  {
    id: "kimi",
    name: "Kimi",
    description: "Advanced AI with ultra-long context and deep analysis",
    descriptionAr: "ذكاء اصطناعي متقدم بسياق طويل جدًا وقدرات تحليل عميقة.",
    plans: [
      { name: "Moderato", originalPrice: 19.0, discountedPrice: 9.49, features: ["Extended context", "Document analysis", "Basic features"] },
      { name: "Allegretto", originalPrice: 39.0, discountedPrice: 19.49, features: ["Faster responses", "Priority queue", "Advanced analysis"] },
      { name: "Allegro", originalPrice: 99.0, discountedPrice: 49.49, features: ["All features", "Max speed", "API access", "Extended limits"] },
      { name: "Vivace", originalPrice: 199.0, discountedPrice: 99.49, features: ["Unlimited everything", "Enterprise support", "Custom integrations", "Dedicated resources"] },
    ],
  },
];
