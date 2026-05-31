import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'standard' | 'elevated' | 'bezel';
  title?: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
  kicker?: string;
  className?: string;
}

export default function PremiumCard({
  children,
  variant = 'standard',
  title,
  sub,
  action,
  kicker,
  className = '',
}: PremiumCardProps) {
  const isBezel = variant === 'bezel';
  const cardClass = variant === 'elevated' ? 'card elevated' : variant === 'bezel' ? 'card bezel' : 'card';

  const content = (
    <>
      {(title || sub || action || kicker) && (
        <div className="card-head">
          <div>
            {kicker && <span className="kicker mb-1 block">{kicker}</span>}
            {title && <h3>{title}</h3>}
            {sub && <div className="sub">{sub}</div>}
          </div>
          {action && <div className="card-action shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </>
  );

  return (
    <div className={`${cardClass} ${className}`}>
      {isBezel ? (
        <div className="inner">{content}</div>
      ) : (
        content
      )}
    </div>
  );
}
