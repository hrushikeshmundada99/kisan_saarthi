import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { BellOff, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <Card hoverable={false} className="p-8 sm:p-12 text-center space-y-4 border-dashed border-2 border-[#E5DFD5]">
      <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#D97706] flex items-center justify-center mx-auto ring-8 ring-[#FFFFFF]">
        <BellOff className="w-8 h-8" />
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-xl font-bold text-[#2D5016]">{title}</h3>
        <p className="text-sm text-[#4B5563] leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" onClick={onAction}>
            <Plus className="w-4 h-4 text-[#D97706]" />
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}
    </Card>
  );
};
