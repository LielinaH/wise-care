import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info } from 'lucide-react';

interface NoticeProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'warn' | 'danger' | 'success' | 'brand' | 'standard';
  className?: string;
}

export default function Notice({ title, children, variant = 'standard', className = '' }: NoticeProps) {
  const variantClass = variant === 'standard' ? '' : variant;
  
  const renderIcon = () => {
    switch (variant) {
      case 'warn':
      case 'danger':
        return <AlertTriangle className="ico w-5 h-5 shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle2 className="ico w-5 h-5 shrink-0 mt-0.5" />;
      case 'brand':
        return <HelpCircle className="ico w-5 h-5 shrink-0 mt-0.5" />;
      default:
        return <Info className="ico w-5 h-5 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className={`notice ${variantClass} ${className}`}>
      {renderIcon()}
      <div className="flex-1">
        {title && <strong className="font-semibold block mb-0.5">{title}</strong>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
