import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EGP_RATE = 50;
export function usdToEgp(usd: number): string {
  return (usd * EGP_RATE).toLocaleString("en", { maximumFractionDigits: 0 });
}
