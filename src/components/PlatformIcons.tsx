import { MousePointer2, Sparkles, Zap, Heart, Moon } from "lucide-react";

// SVG icon components for each AI platform
export const ChatGPTIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CursorIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <MousePointer2 className={className} strokeWidth={1.5} />
);

export const GeminiIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <Sparkles className={className} strokeWidth={1.5} />
);

export const GrokIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const BoltIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <Zap className={className} strokeWidth={1.5} />
);

export const LovableIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <Heart className={className} strokeWidth={1.5} />
);

export const KimiIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <Moon className={className} strokeWidth={1.5} />
);

export const platformIcons: Record<string, React.FC<{ className?: string }>> = {
  chatgpt: ChatGPTIcon,
  cursor: CursorIcon,
  gemini: GeminiIcon,
  grok: GrokIcon,
  bolt: BoltIcon,
  lovable: LovableIcon,
  kimi: KimiIcon,
};
