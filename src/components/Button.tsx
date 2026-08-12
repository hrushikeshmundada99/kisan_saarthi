import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2.5 rounded-2xl font-extrabold transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/25 active:scale-95 disabled:opacity-60 disabled:pointer-events-none shadow-sm';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#2E7D32] via-[#388E3C] to-[#1B4332] text-[#FFFFFF] hover:from-[#1B4332] hover:via-[#2E7D32] hover:to-[#388E3C] shadow-md shadow-emerald-950/20 hover:shadow-xl hover:shadow-emerald-950/30 hover:scale-103 hover:-translate-y-0.5',
    secondary:
      'bg-[#FFFFFF] text-[#2E7D32] border-2 border-[#81C784] hover:border-[#2E7D32] hover:bg-[#F7FBF7] shadow-xs hover:shadow-md hover:scale-103 hover:-translate-y-0.5',
    accent:
      'bg-gradient-to-r from-[#FFC107] via-[#F59E0B] to-[#D97706] text-[#1B4332] hover:from-[#F59E0B] hover:to-[#FFC107] shadow-md shadow-amber-500/20 hover:shadow-xl hover:scale-103 hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-[#1B4332] hover:bg-[#E8F5E9] hover:text-[#2E7D32] shadow-none hover:scale-102'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs min-h-[42px] rounded-xl',
    md: 'px-6 py-3 text-sm sm:text-base min-h-[50px] rounded-2xl',
    lg: 'px-8 py-4 text-base sm:text-lg min-h-[56px] rounded-2xl'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-current shrink-0" />
          <span>लोड होत आहे...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
