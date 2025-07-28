'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'relative',
        sizeClasses[size]
      )}>
        {/* Outer ring */}
        <div className={cn(
          'absolute inset-0 rounded-full border-2 border-primary/20',
          sizeClasses[size]
        )} />
        
        {/* Spinning ring */}
        <div className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin',
          sizeClasses[size]
        )} />
        
        {/* Inner pulse */}
        <div className={cn(
          'absolute inset-2 rounded-full bg-primary/10 animate-pulse',
          size === 'sm' ? 'inset-1' : size === 'lg' ? 'inset-3' : 'inset-2'
        )} />
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton loader for cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-lg p-4 theme-transition', className)}>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded loading-skeleton" style={{ width: '75%' }} />
        <div className="h-4 bg-muted rounded loading-skeleton" style={{ width: '50%' }} />
        <div className="h-4 bg-muted rounded loading-skeleton" style={{ width: '60%' }} />
      </div>
    </div>
  );
}

// Floating elements animation
export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/10 rounded-full animate-pulse" 
           style={{ animation: 'float 6s ease-in-out infinite' }} />
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-secondary/10 rounded-full animate-pulse" 
           style={{ animation: 'float 8s ease-in-out infinite reverse' }} />
      <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-accent/10 rounded-full animate-pulse" 
           style={{ animation: 'float 4s ease-in-out infinite' }} />
    </div>
  );
} 