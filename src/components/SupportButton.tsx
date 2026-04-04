import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { openSupportChat } from "@/context/OrderCenterContext";

const SupportButton = () => {
  const { t } = useLanguage();

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => openSupportChat()}
      className="btn-primary fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-2xl sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      title={t("supportChat.floatingTitle")}
    >
      <MessageCircle className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
    </motion.button>
  );
};

export default SupportButton;
