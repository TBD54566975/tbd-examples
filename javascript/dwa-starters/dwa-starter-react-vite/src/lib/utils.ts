import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function toastError(message: string, error?: unknown) {
  console.error("Toast Error >>>", { message, error });
  const errorMessage = error
    ? (error as Error)?.message || "Unknown error"
    : undefined;
  toast.error(message, { description: errorMessage });
}
