import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

export function getRiskColor(riskBand: 'Low' | 'Medium' | 'High'): string {
  switch (riskBand) {
    case 'Low': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
    case 'High': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
  }
}

export function getLTVTierColor(tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP'): string {
  switch (tier) {
    case 'Bronze': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950';
    case 'Silver': return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    case 'Gold': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
    case 'VIP': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'open':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
    case 'paused':
    case 'draft':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
    case 'closed':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    default:
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
