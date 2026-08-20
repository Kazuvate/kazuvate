import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard-shadcn-Helfer: merged Tailwind-Klassen so, dass sich
// widersprechende Utilities (z. B. zwei "absolute"/"relative") nicht
// gegenseitig verdoppeln, sondern die letzte gewinnt.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
