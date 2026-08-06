import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  ...props
}) => {
  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E1EBE1] rounded-2xl p-6 shadow-sm shadow-emerald-950/5 transition-all duration-300 ${
        hoverable ? 'hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/10 hover:border-[#81C784]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`space-y-1 mb-4 pb-3 border-b border-[#E1EBE1] ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <h3 className={`text-lg font-extrabold text-[#1B4332] ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <p className={`text-sm text-[#6B7280] font-medium ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <div className={`space-y-3 ${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`mt-4 pt-3 border-t border-[#E1EBE1] flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);
