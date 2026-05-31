import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'blue' | 'success' | 'warn' | 'danger' | 'standard';
  showDot?: boolean;
  className?: string;
}

export default function Badge({ children, variant = 'standard', showDot = true, className = '' }: BadgeProps) {
  const variantClass = variant === 'standard' ? '' : variant;
  
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {showDot && <span className="dot" />}
      {children}
    </span>
  );
}
