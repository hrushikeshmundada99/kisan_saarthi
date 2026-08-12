import React from 'react';
import { Card } from './Card';
import { Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
  type?: 'card' | 'chart' | 'table' | 'metrics';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3
}) => {
  if (type === 'metrics') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} hoverable={false} className="animate-pulse space-y-3 p-6 border border-[#E1EBE1] rounded-2xl bg-[#FFFFFF]">
            <div className="h-4 bg-[#E1EBE1] rounded-xl w-1/2"></div>
            <div className="h-8 bg-[#E1EBE1] rounded-xl w-3/4"></div>
            <div className="h-3 bg-[#E1EBE1] rounded-xl w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <Card hoverable={false} className="animate-pulse p-6 space-y-4 border border-[#E1EBE1] rounded-2xl bg-[#FFFFFF]">
        <div className="flex justify-between items-center pb-3 border-b border-[#E1EBE1]">
          <div className="h-6 bg-[#E1EBE1] rounded-xl w-1/3"></div>
          <div className="h-8 bg-[#E1EBE1] rounded-2xl w-32"></div>
        </div>
        <div className="h-80 bg-[#F7FBF7] rounded-2xl flex flex-col items-center justify-center gap-3 border border-[#E1EBE1]">
          <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
          <div className="text-xs font-extrabold text-[#6B7280]">डेटा लोड होत आहे... (Loading Chart...)</div>
        </div>
      </Card>
    );
  }

  if (type === 'table') {
    return (
      <Card hoverable={false} className="animate-pulse p-6 space-y-4 border border-[#E1EBE1] rounded-2xl bg-[#FFFFFF]">
        <div className="h-6 bg-[#E1EBE1] rounded-xl w-1/4"></div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1]"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} hoverable={false} className="animate-pulse p-6 space-y-4 border border-[#E1EBE1] rounded-2xl bg-[#FFFFFF]">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-[#E1EBE1] rounded-xl w-2/3"></div>
            <div className="h-6 bg-[#E1EBE1] rounded-full w-16"></div>
          </div>
          <div className="h-20 bg-[#F7FBF7] rounded-2xl border border-[#E1EBE1]"></div>
          <div className="h-10 bg-[#E1EBE1] rounded-2xl"></div>
        </Card>
      ))}
    </div>
  );
};
