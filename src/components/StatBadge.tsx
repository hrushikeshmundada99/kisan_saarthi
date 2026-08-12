import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatBadgeProps {
  change: number; // change in rupees
  changePct: number; // percentage change
  size?: 'sm' | 'md' | 'lg';
}

export const StatBadge: React.FC<StatBadgeProps> = ({ change, changePct, size = 'md' }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs sm:text-sm font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5'
  };

  if (isPositive) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 ${sizeClasses[size]}`}>
        <TrendingUp className={iconSizes[size]} />
        <span>+₹{change} (+{changePct.toFixed(1)}%)</span>
      </span>
    );
  }

  if (isNegative) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300/60 ${sizeClasses[size]}`}>
        <TrendingDown className={iconSizes[size]} />
        <span>₹{change} ({changePct.toFixed(1)}%)</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses[size]}`}>
      <Minus className={iconSizes[size]} />
      <span>₹0 (0%)</span>
    </span>
  );
};
