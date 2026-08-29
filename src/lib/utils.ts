import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('uz-UZ').format(amount).replace(/,/g, ' ') + " so'm";
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('uz-UZ');
}

export function getMonthName(month: number): string {
  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  return months[month - 1] || '';
}

export function getInitials(fullName: string): string {
  if (!fullName) return '';
  return fullName.substring(0, 2).toUpperCase();
}

export function formatDateTimeUz(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
  
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  
  return `${d}-${m}, ${y} ${hh}:${mm}:${ss}`;
}
