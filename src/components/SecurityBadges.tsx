import { Shield, Lock } from "lucide-react";

const SecurityBadges = () => (
  <div className="flex flex-wrap justify-center gap-2 py-3 sm:gap-4 sm:py-4">
    {[
      { icon: Shield, label: "SSL Secured" },
      { icon: Lock, label: "End-to-End Encrypted" },
    ].map(({ icon: Icon, label }) => (
      <div key={label} className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] text-muted-foreground sm:px-3 sm:text-xs">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
    ))}
  </div>
);

export default SecurityBadges;
