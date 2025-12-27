import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export function formatEuro(euros: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros)
}

export function generateReservationId(): string {
  const timePart = Date.now().toString(36).toUpperCase().slice(-4)
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RES-${timePart}${randomPart}`
}
