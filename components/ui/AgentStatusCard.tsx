import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface AgentStatusCardProps {
  name: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  stepNumber: number;
}

export default function AgentStatusCard({ name, desc, status, stepNumber }: AgentStatusCardProps) {
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  
  return (
    <div className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 transition-all duration-200 ${isCompleted ? 'opacity-85' : ''}`}>
      <div className="shrink-0 mt-0.5 relative">
        {isCompleted && (
          <span className="w-5 h-5 rounded-full bg-wise-success-soft text-wise-success flex items-center justify-center font-bold">
            <Check className="w-3.5 h-3.5" />
          </span>
        )}
        {isRunning && (
          <span className="w-5 h-5 rounded-full bg-wise-teal text-white flex items-center justify-center pulse-ring">
            <Loader2 className="w-3 h-3 spin" />
          </span>
        )}
        {isFailed && (
          <span className="w-5 h-5 rounded-full bg-wise-danger-soft text-wise-danger flex items-center justify-center font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
          </span>
        )}
        {status === 'pending' && (
          <span className="w-5 h-5 rounded-full bg-wise-surface-sunk text-wise-muted-2 flex items-center justify-center font-mono text-[9.5px]">
            {stepNumber}
          </span>
        )}
      </div>
      <div>
        <div className={`text-sm font-semibold ${isRunning ? 'text-wise-teal-deep' : isCompleted ? 'text-wise-fg-soft font-medium' : 'text-wise-muted'}`}>
          {name}
        </div>
        <div className="text-xs text-wise-muted mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
