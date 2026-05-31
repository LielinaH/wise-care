import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<any>;
  className?: string;
}

export default function EmptyState({ title, description, action, icon: Icon = HelpCircle, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-wise-border rounded-2xl bg-wise-surface-2 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-wise-surface-sunk flex items-center justify-center text-wise-muted mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-wise-fg mb-1">{title}</h4>
      <p className="text-sm text-wise-muted max-w-[42ch] mb-5 leading-normal">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
