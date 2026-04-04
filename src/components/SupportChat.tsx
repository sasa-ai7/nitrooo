import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { ORDER_SUPPORT_URL } from "@/context/OrderCenterContext";

interface ChatMessage {
  from: "bot" | "user";
  text: string;
}

interface SupportChatProps {
  open: boolean;
  onClose: () => void;
  orderId?: string | null;
}

const SupportChat = ({ open, onClose, orderId = null }: SupportChatProps) => {
  const { isArabic, t } = useLanguage();
  const quickReplies = useMemo(
    () => [t("supportChat.q1"), t("supportChat.q2"), t("supportChat.q3")],
    [t],
  );
  const botResponses = useMemo<Record<string, string>>(
    () => ({
      [quickReplies[0]]: t("supportChat.a1"),
      [quickReplies[1]]: t("supportChat.a2"),
      [quickReplies[2]]: t("supportChat.a3"),
    }),
    [quickReplies, t],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([{ from: "bot", text: t("supportChat.welcome") }]);
  const [showChips, setShowChips] = useState(true);
  const [lastOrderPrompt, setLastOrderPrompt] = useState<string | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ from: "bot", text: t("supportChat.welcome") }];
      }

      const [first, ...rest] = prev;
      if (first?.from === "bot") {
        return [{ ...first, text: t("supportChat.welcome") }, ...rest];
      }

      return [{ from: "bot", text: t("supportChat.welcome") }, ...prev];
    });
  }, [t]);

  useEffect(() => {
    if (!open || !orderId || orderId === lastOrderPrompt) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: t("supportChat.orderPrompt", { orderId }),
      },
    ]);
    setLastOrderPrompt(orderId);
  }, [lastOrderPrompt, open, orderId, t]);

  const handleChip = (chip: string) => {
    const userMsg: ChatMessage = { from: "user", text: chip };
    const botMsg: ChatMessage = { from: "bot", text: botResponses[chip] };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setShowChips(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/60 p-2 backdrop-blur-sm sm:items-center sm:justify-end sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(event) => event.stopPropagation()}
            className="glass-strong flex h-[min(88svh,720px)] w-full max-w-[calc(100vw-0.5rem)] flex-col overflow-hidden rounded-2xl sm:h-[min(80vh,38rem)] sm:max-w-sm"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">{t("supportChat.title")}</h3>
                  <span className="text-[10px] text-green-400">{t("supportChat.online")}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="glass flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted/50"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={`${msg.from}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] sm:max-w-[85%] sm:px-4 sm:text-sm ${
                      msg.from === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "glass rounded-bl-md text-foreground"
                    } ${isArabic ? "text-right" : "text-left"}`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {showChips && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 pt-2"
                >
                  {quickReplies.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChip(chip)}
                      className={`block w-full rounded-xl border border-primary/30 px-3.5 py-2.5 text-[11px] text-primary transition-all hover:border-primary/60 hover:bg-primary/10 sm:px-4 sm:text-xs ${isArabic ? "text-right" : "text-left"}`}
                    >
                      {chip}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="border-t border-border p-3 sm:p-4">
              <a
                href={ORDER_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                <Send className="h-4 w-4" />
                {t("supportChat.human")}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportChat;
