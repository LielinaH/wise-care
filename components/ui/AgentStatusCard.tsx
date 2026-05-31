import React from 'react';
import { Check, Settings, Sparkles } from 'lucide-react';

interface AgentStatusCardProps {
  name: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  stepNumber: number;
}

export default function AgentStatusCard({ name, desc, status, output, stepNumber }: AgentStatusCardProps) {
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  
  const klass = isCompleted ? 'done' : isRunning ? 'running' : 'pending';
  const statusText = isCompleted ? 'COMPLETE' : isRunning ? 'WORKING…' : 'WAITING';
  
  return (
    <div className={`agent-card ${klass}`}>
      <div className="agent-avatar">
        {isCompleted ? (
          <Check className="w-[18px] h-[18px]" />
        ) : isRunning ? (
          <Settings className="w-[18px] h-[18px] animate-spin" />
        ) : (
          <Sparkles className="w-[18px] h-[18px]" />
        )}
      </div>
      <div>
        <div className="agent-name">{name}</div>
        <div className="agent-desc">{desc}</div>
      </div>
      <div className="agent-status">
        <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
        {statusText}
      </div>
      
      {isRunning && (
        <div className="running-bar">
          <div></div>
        </div>
      )}
      
      {isCompleted && output && (
        <div className="agent-output" dangerouslySetInnerHTML={{ __html: output }}></div>
      )}
    </div>
  );
}
