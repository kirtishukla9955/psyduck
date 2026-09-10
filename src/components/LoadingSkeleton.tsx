import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'detail' | 'list' | 'metrics';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
  className = '',
}) => {
  const renderItem = (key: number) => {
    switch (type) {
      case 'metrics':
        return (
          <div key={key} className="bg-white p-5 rounded-card border border-neutral-200 animate-pulse space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
            <div className="h-8 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/3" />
          </div>
        );

      case 'table':
        return (
          <tr key={key} className="animate-pulse border-b border-neutral-200">
            <td className="py-4 px-4"><div className="h-4 bg-neutral-200 rounded w-24" /></td>
            <td className="py-4 px-4"><div className="h-4 bg-neutral-200 rounded w-32" /></td>
            <td className="py-4 px-4"><div className="h-4 bg-neutral-200 rounded w-20" /></td>
            <td className="py-4 px-4"><div className="h-4 bg-neutral-200 rounded w-16" /></td>
            <td className="py-4 px-4"><div className="h-4 bg-neutral-200 rounded w-28" /></td>
            <td className="py-4 px-4 text-right"><div className="h-4 bg-neutral-200 rounded w-12 ml-auto" /></td>
          </tr>
        );

      case 'detail':
        return (
          <div key={key} className="bg-white p-6 rounded-card border border-neutral-200 animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-neutral-100 rounded" />
              <div className="h-10 bg-neutral-100 rounded" />
            </div>
            <div className="h-48 bg-neutral-200 rounded" />
          </div>
        );

      case 'list':
        return (
          <div key={key} className="p-4 bg-white rounded border border-neutral-200 animate-pulse flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-200 rounded w-1/3" />
              <div className="h-3 bg-neutral-100 rounded w-2/3" />
            </div>
            <div className="h-6 bg-neutral-200 rounded w-20 ml-4" />
          </div>
        );

      case 'card':
      default:
        return (
          <div key={key} className="bg-white p-5 rounded-card border border-neutral-200 animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-neutral-200 rounded w-32" />
              <div className="h-5 bg-neutral-200 rounded-full w-20" />
            </div>
            <div className="h-4 bg-neutral-100 rounded w-48" />
            <div className="h-3 bg-neutral-100 rounded w-24" />
            <div className="pt-2 border-t border-neutral-100 flex justify-between">
              <div className="h-4 bg-neutral-100 rounded w-16" />
              <div className="h-4 bg-neutral-200 rounded w-20" />
            </div>
          </div>
        );
    }
  };

  if (type === 'table') {
    return (
      <tbody className={className}>
        {Array.from({ length: count }).map((_, i) => renderItem(i))}
      </tbody>
    );
  }

  return (
    <div
      className={
        type === 'metrics'
          ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`
          : type === 'card'
          ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`
          : `space-y-3 ${className}`
      }
    >
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </div>
  );
};
