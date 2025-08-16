import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export default function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-2',
      className
    )}>
      <Loader2 className={cn(
        'animate-spin text-primary',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Convenience components for common use cases
export const SmallSpinner: React.FC<{ className?: string; text?: string }> = ({ className, text }) => (
  <LoadingSpinner size="sm" className={className} text={text} />
);

export const MediumSpinner: React.FC<{ className?: string; text?: string }> = ({ className, text }) => (
  <LoadingSpinner size="md" className={className} text={text} />
);

export const LargeSpinner: React.FC<{ className?: string; text?: string }> = ({ className, text }) => (
  <LoadingSpinner size="lg" className={className} text={text} />
);

export const FullScreenSpinner: React.FC<{ text?: string }> = ({ text }) => (
  <LoadingSpinner size="xl" text={text} fullScreen />
);
