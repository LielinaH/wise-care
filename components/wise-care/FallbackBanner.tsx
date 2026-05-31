'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FallbackBannerProps {
  isFallback?: boolean;
}

export default function FallbackBanner({ isFallback }: FallbackBannerProps) {
  if (!isFallback) return null;

  return (
    <div className="notice warn mb-6 flex items-start gap-3">
      <AlertCircle className="ico text-wise-warn w-5 h-5 shrink-0" />
      <div className="text-sm">
        <strong>Demo Mode:</strong> Using fallback AI response because Gemini is not configured. 
        Add your <code className="bg-wise-surface-sunk px-1.5 py-0.5 rounded text-xs font-mono">GEMINI_API_KEY</code> to <code className="bg-wise-surface-sunk px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> to enable live AI generations.
      </div>
    </div>
  );
}
