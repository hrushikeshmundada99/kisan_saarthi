import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { BellOff, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = BellOff
}) => {
  return (
    <Card hoverable={false} className="p-8 sm:p-12 text-center space-y-4 border-dashed border-2 border-[#D8E6D8] rounded-3xl bg-[#FFFFFF]">
      <div className="w-16 h-16 rounded-full bg-[#F4F9F4] text-[#1B5E20] border border-[#D8E6D8] flex items-center justify-center mx-auto ring-8 ring-[#F4F9F4]/50">
        <Icon className="w-8 h-8" />
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-xl font-bold text-[#0F291E]">{title}</h3>
        <p className="text-sm text-[#526058] leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" onClick={onAction} className="rounded-2xl font-black min-h-[42px]">
            <Plus className="w-4 h-4 text-[#FFB300]" />
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}
    </Card>
  );
};
