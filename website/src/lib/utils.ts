import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn-Helfer cn(): fasst Tailwind-Klassen zusammen. Eingefuegte Bauteile erwarten ihn hier.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
