'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'fade' | 'slide' | 'scale' | 'flip';
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true,
  onClick,
  variant = 'fade'
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1, rootMargin: "-100px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0 translate-y-4';
    
    switch (variant) {
      case 'slide':
        return 'animate-slide-up';
      case 'scale':
        return 'animate-scale-in';
      case 'flip':
        return 'animate-fade-in';
      default:
        return 'animate-fade-in';
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={ref}
      className={`theme-transition ${getAnimationClass()} ${hover ? 'hover-lift' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card className="relative overflow-hidden theme-transition">
        {/* Gradient overlay on hover */}
        {isHovered && hover && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none z-10 animate-fade-in" />
        )}

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none animate-shimmer opacity-30" />

        <CardContent className="relative z-20">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton with animation
export function AnimatedSkeleton({ className = '', lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded-md loading-skeleton animate-pulse"
          style={{ 
            width: `${100 - i * 10}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}

// Staggered animation container
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1 
}: { 
  children: React.ReactNode; 
  staggerDelay?: number; 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${staggerDelay}s` }}
    >
      {children}
    </div>
  );
}

// Floating action button with pulse animation
export function FloatingButton({ 
  children, 
  onClick, 
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  className?: string; 
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg z-50 
        transition-all duration-200 hover:scale-110 active:scale-95 focus-ring ${className}`}
      style={{ transform: isPressed ? 'scale(0.95)' : undefined }}
    >
      <div className="absolute inset-0 bg-primary rounded-full opacity-30 animate-pulse-slow" />
      <div className="relative z-10">
        {children}
      </div>
    </button>
  );
} 