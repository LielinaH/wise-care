import React from 'react';
import Link from 'next/link';
import { Star, Send, Info, ArrowRight } from 'lucide-react';
import { Provider } from '@/lib/types';

interface ProviderCardProps {
  provider: Provider;
  isSaved: boolean;
  hasIntake: boolean;
  isFeatured?: boolean;
  onSaveToggle: () => void;
  connectUrl: string;
}

export default function ProviderCard({
  provider,
  isSaved,
  hasIntake,
  isFeatured = false,
  onSaveToggle,
  connectUrl,
}: ProviderCardProps) {
  // Helper to generate initials or codes for the avatar
  const avatarTextFor = (p: Provider) => {
    const parts = p.name.split(/[ \-\u2014]+/).filter(Boolean);
    const t = p.type;
    if (t === 'Crisis support') return '988';
    if (t === 'Support group') return 'SG';
    if (t === 'Community clinic') return 'CC';
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  };

  const isCommunity = provider.type === 'Community clinic' || provider.type === 'Support group';
  const avatarClass = provider.type === 'Crisis support' ? 'crisis' : isCommunity ? 'community' : '';

  return (
    <div className={`match-card ${isFeatured ? 'featured' : ''}`}>
      <div className="inner">
        <div className="match-head">
          <div className={`match-avatar ${avatarClass}`}>{avatarTextFor(provider)}</div>
          <div>
            <div className="match-name">{provider.name}</div>
            <div className="match-meta">{provider.type} · {provider.licensure}</div>
            {isFeatured && <span className="badge teal" style={{ marginTop: '6px' }}>⭑ Best match</span>}
          </div>
          {hasIntake && provider.matchScore > 0 && (
            <div className="match-score">
              <span className="score">
                {provider.matchScore}
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>%</span>
              </span>
              <span className="pct">FIT SCORE</span>
            </div>
          )}
        </div>

        <div className="match-body">
          <div className="match-field">
            <div className="k">Specialty</div>
            <div className="v">{provider.specialty.join(' · ')}</div>
          </div>
          <div className="match-field">
            <div className="k">Modality</div>
            <div className="v">{provider.modality.join(' · ')}</div>
          </div>
          <div className="match-field">
            <div className="k">Next availability</div>
            <div className="v">{provider.nextAvailable}</div>
          </div>
          <div className="match-field">
            <div className="k">Cost / payment</div>
            <div className="v">{provider.sessionCost}</div>
          </div>
        </div>

        {hasIntake && provider.matchReason && (
          <div className="match-reason">
            <Info className="w-3.5 h-3.5 shrink-0 text-wise-teal-deep mt-0.5" />
            <span><strong>Why this match:</strong> {provider.matchReason}</span>
          </div>
        )}

        <div className="match-foot">
          <div className="match-tags">
            {provider.insurance.slice(0, 3).map((ins, idx) => (
              <span key={idx} className="badge">{ins}</span>
            ))}
            {provider.slidingScale && <span className="badge teal">Sliding scale</span>}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={onSaveToggle}>
              {isSaved ? '✓ Saved' : '+ Save to plan'}
            </button>
            <Link className="btn btn-primary btn-sm" href={connectUrl}>
              Request connection<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
