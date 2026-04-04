import { Lock, Shield } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

interface SecurityBadgesProps {
  emphasize?: boolean;
  showThreeDSecure?: boolean;
}

const SecurityBadges = ({ emphasize = false, showThreeDSecure = false }: SecurityBadgesProps) => {
  const { t } = useLanguage();

  const badges = [
    ...(showThreeDSecure ? [{ icon: Shield, label: t("security.threeDSecure") }] : []),
    { icon: Shield, label: t("security.ssl") },
    { icon: Lock, label: t("security.encrypted") },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 py-3 sm:gap-4 sm:py-4">
      {badges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className={`glass flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs ${
            emphasize
              ? "border-primary/25 bg-primary/5 font-medium text-foreground shadow-[0_0_16px_rgba(249,115,22,0.08)]"
              : "text-muted-foreground"
          }`}
        >
          <Icon className="h-3.5 w-3.5 text-primary" />
          {label}
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;
