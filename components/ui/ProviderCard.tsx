import React from 'react';
import Link from 'next/link';
import { Star, Send } from 'lucide-react';
import { Provider } from '@/lib/types';
import Badge from './Badge';
import PremiumCard from './PremiumCard';

interface ProviderCardProps {
  provider: Provider;
  isSaved: boolean;
  hasIntake: boolean;
  onSaveToggle: () => void;
  connectUrl: string;
}

export default function ProviderCard({
  provider,
  isSaved,
  hasIntake,
  onSaveToggle,
  connectUrl,
}: ProviderCardProps) {
  return (
    <PremiumCard
      variant="standard"
      className={`transition-all duration-200 ${
        isSaved ? 'border-wise-teal/30 bg-gradient-to-b from-wise-surface to-wise-teal-soft/10' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        {/* Provider Details */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="standard" showDot={false} className="uppercase font-semibold">
              {provider.type}
            </Badge>
            <Badge variant="teal" showDot={false} className="uppercase font-semibold">
              {provider.licensure}
            </Badge>
            {provider.slidingScale && (
              <Badge variant="success" showDot={false} className="font-semibold">
                Sliding Scale
              </Badge>
            )}
            
            {hasIntake && (
              <Badge variant="blue" showDot={true} className="ml-auto md:ml-0 font-bold">
                {provider.matchScore}% Match
              </Badge>
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold tracking-tight text-wise-fg">{provider.name}</h3>
            <p className="text-[12.5px] text-wise-muted mt-1 leading-normal">
              <strong>Focus areas:</strong> {provider.specialty.join(', ')}
            </p>
          </div>

          {/* Why Matched explanation */}
          {hasIntake && (
            <div className="p-3 bg-wise-surface-sunk border border-wise-hairline rounded-xl text-xs text-wise-fg-soft leading-relaxed flex gap-2">
              <span className="font-semibold text-wise-teal-deep text-[11px] uppercase tracking-wider shrink-0 mt-0.5">Match logic:</span>
              <span className="flex-1">{provider.matchReason}</span>
            </div>
          )}

          {/* Extra metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2.5 border-t border-wise-hairline">
            <div>
              <span className="text-wise-muted block text-[11px]">Availability</span>
              <span className="font-semibold text-wise-fg-soft">{provider.nextAvailable}</span>
            </div>
            <div>
              <span className="text-wise-muted block text-[11px]">Session Cost</span>
              <span className="font-semibold text-wise-fg-soft">{provider.sessionCost}</span>
            </div>
            <div>
              <span className="text-wise-muted block text-[11px]">Modalities</span>
              <span className="font-semibold text-wise-fg-soft">{provider.modality.join(', ')}</span>
            </div>
            <div>
              <span className="text-wise-muted block text-[11px]">Accepted Insurance</span>
              <span className="font-semibold text-wise-fg-soft truncate block max-w-[130px]" title={provider.insurance.join(', ')}>
                {provider.insurance.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions column */}
        <div className="shrink-0 flex md:flex-col justify-end md:justify-start gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-wise-border md:w-44">
          <button
            onClick={onSaveToggle}
            type="button"
            className={`btn btn-sm w-full flex items-center justify-center gap-1.5 ${
              isSaved ? 'btn-soft' : 'btn-ghost'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-wise-teal-deep text-wise-teal-deep' : ''}`} />
            <span>{isSaved ? 'Saved to plan' : 'Save to plan'}</span>
          </button>

          <Link 
            href={connectUrl}
            className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            Connect →
          </Link>
        </div>
      </div>
    </PremiumCard>
  );
}
