import React from 'react';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
  narrow?: boolean;
}

export default function SectionHeader({ kicker, title, description, className = '', narrow = false }: SectionHeaderProps) {
  return (
    <div className={`section-head ${narrow ? 'max-w-[720px]' : ''} ${className}`}>
      {kicker && <span className="kicker mb-2.5 block">{kicker}</span>}
      <h2 className="h2 text-3xl font-display font-semibold tracking-tight text-wise-fg my-2">{title}</h2>
      {description && <p className="lede mt-2 text-wise-fg-soft">{description}</p>}
    </div>
  );
}
