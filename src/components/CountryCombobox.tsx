import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { CountryOption } from "@/data/countries";

interface CountryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  countries: CountryOption[];
  placeholder?: string;
  className?: string;
}

const CountryCombobox = ({
  value,
  onChange,
  countries,
  placeholder,
  className,
}: CountryComboboxProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const displayPlaceholder = placeholder ?? t("checkout.countryPlaceholder");

  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === value),
    [countries, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "min-h-12 w-full justify-between border-border bg-muted/50 px-4 py-3 text-left text-sm font-normal text-foreground hover:bg-muted/70 hover:text-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selectedCountry
              ? `${selectedCountry.flag} ${selectedCountry.name} (${selectedCountry.dialCode})`
              : displayPlaceholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(var(--radix-popover-trigger-width),calc(100vw-1rem))] border-border bg-card/95 p-0 backdrop-blur-xl" align="start">
        <Command>
          <CommandInput placeholder={t("country.search")} />
          <CommandList>
            <CommandEmpty>{t("country.none")}</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code} ${country.dialCode}`}
                  onSelect={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <span>{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                  <Check className={cn("ml-auto h-4 w-4", value === country.code ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryCombobox;
