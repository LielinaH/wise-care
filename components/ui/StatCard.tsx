import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaDirection?: 'up' | 'down';
  className?: string;
}

export default function StatCard({ label, value, delta, deltaDirection = 'up', className = '' }: StatCardProps) {
  const isDown = deltaDirection === 'down';
  
  return (
    <div className={`kpi ${className}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {delta && (
        <span className={`kpi-delta ${isDown ? 'down' : ''}`}>
          {isDown ? '↓' : '↑'} {delta}
        </span>
      )}
    </div>
  );
}
