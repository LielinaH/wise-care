import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ActionChecklistProps {
  items: string[];
  initialCheckedIndices?: number[];
  className?: string;
}

export default function ActionChecklist({ items, initialCheckedIndices = [], className = '' }: ActionChecklistProps) {
  const [checkedIndices, setCheckedIndices] = useState<number[]>(initialCheckedIndices);

  const toggleCheck = (idx: number) => {
    setCheckedIndices((prev) => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  return (
    <ul className={`check-list ${className}`}>
      {items.map((item, idx) => {
        const isDone = checkedIndices.includes(idx);
        return (
          <li key={idx} className={isDone ? 'done' : ''} onClick={() => toggleCheck(idx)} style={{ cursor: 'pointer' }}>
            <div className="box">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="label leading-normal">{item}</span>
          </li>
        );
      })}
    </ul>
  );
}
