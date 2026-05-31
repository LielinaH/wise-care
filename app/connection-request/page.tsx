'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Provider, Referral, CarePacket } from '@/lib/types';
import { MOCK_PROVIDERS } from '@/lib/data/mockProviders';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Check, Send, AlertTriangle, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

function ConnectionRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');

  const [provider, setProvider] = useState<Provider | null>(null);
  const [packet, setPacket] = useState<CarePacket | null>(null);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cachedPacket = storage.getCarePacket();
    setPacket(cachedPacket);
    
    // Find provider
    const pId = providerId || storage.getSavedProviders()[0];
    if (pId) {
      const p = MOCK_PROVIDERS.find(item => item.id === pId);
      if (p) {
        setProvider(p);
      } else {
        setProvider(MOCK_PROVIDERS[0]); // Fallback
      }
    } else {
      setProvider(MOCK_PROVIDERS[0]); // Default fallback
    }

    if (cachedPacket) {
      setMessage(cachedPacket.suggestedOutreachMessage);
    }
  }, [providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || !provider || !packet) return;

    setSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      // 1. Add to sent connection requests
      storage.addSentRequest(provider.id);

      // 2. Add to mock provider inbox list in localStorage
      const existingReferrals = storage.getReferrals();
      // If empty, seed it with the default MOCK_REFERRALS
      const listToUpdate = existingReferrals.length > 0 ? existingReferrals : [...MOCK_REFERRALS];
      
      const newReferral: Referral = {
        id: `r-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Member (Self)',
        route: `Therapy · ${packet.mainConcerns.join(' / ')}`,
        risk: 'low',
        age: 'Adult',
        received: 'Just now',
        insurance: provider.insurance[0] || 'Self-pay',
        summary: packet.shareableSummary,
        status: 'pending',
      };

      storage.setReferrals([newReferral, ...listToUpdate]);

      setSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-wise-teal spin" />
        <p className="text-sm text-wise-muted">Locating provider details...</p>
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="max-w-[560px] mx-auto text-center py-12 space-y-6 enter">
        <div className="w-16 h-16 rounded-full bg-wise-success-soft text-wise-success flex items-center justify-center mx-auto shadow-sm">
          <Check className="w-8 h-8 text-wise-success-deep font-bold" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-semibold tracking-tight text-wise-fg">Connection Request Sent!</h2>
          <p className="text-sm text-wise-muted leading-relaxed max-w-[42ch] mx-auto">
            Your Care Packet has been structured and securely forwarded to <strong>{provider.name}</strong>. 
            The clinic intake coordinator will review details and follow up within 2–3 business days.
          </p>
        </div>
        
        <div className="p-4 bg-wise-surface border border-wise-hairline rounded-2xl text-left text-xs space-y-2 max-w-[440px] mx-auto shadow-sm">
          <span className="kicker text-[10px]">What happens next?</span>
          <p className="text-wise-fg-soft leading-relaxed">
            1. Toggle the demo role to <strong>Provider</strong> or <strong>Admin</strong> in the sidebar.
            <br />
            2. Visit the <strong>Referral Inbox</strong> or verification logs to inspect your request in the provider dashboard!
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Go to dashboard
          </Link>
          <Link href="/matching" className="btn btn-ghost btn-sm">
            Back to matching
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto space-y-6 enter">
      
      {/* Top Header info */}
      <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
        <span className="kicker">Connection Portal</span>
        <h2 className="text-lg font-semibold tracking-tight mt-1">Connect with {provider.name}</h2>
        <p className="text-xs text-wise-muted mt-1 leading-relaxed">
          Review the pre-drafted summary below before releasing details to the coordinator queue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Provider summary briefing block */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold">1. Clinic Information</h3>
          <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-wise-muted block">Provider Name</span>
              <span className="font-semibold text-wise-fg-soft">{provider.name}</span>
            </div>
            <div>
              <span className="text-wise-muted block">Care Modality</span>
              <span className="font-semibold text-wise-fg-soft">{provider.type}</span>
            </div>
            <div>
              <span className="text-wise-muted block">Accepting Availability</span>
              <span className="font-semibold text-wise-fg-soft">{provider.nextAvailable}</span>
            </div>
            <div>
              <span className="text-wise-muted block">Estimated Cost</span>
              <span className="font-semibold text-wise-fg-soft">{provider.sessionCost}</span>
            </div>
          </div>
        </div>

        {/* Edit Message block */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold">2. Customize Outreach Message</h3>
          <p className="text-xs text-wise-muted leading-relaxed">
            This message will be sent to the clinic coordinator. You can edit this text freely.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="textarea w-full p-4.5 bg-wise-surface-sunk border border-wise-border rounded-xl text-xs font-mono min-h-[140px] focus:ring-0 leading-relaxed cursor-text"
            required
          />
        </div>

        {/* Privacy Consent block */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold">3. Shared Information & Consent</h3>
          
          <div className="p-3.5 bg-wise-surface-2 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft leading-relaxed space-y-2">
            <span className="font-semibold text-wise-teal-deep text-[10px] uppercase tracking-wider block">Briefing Summary to be Shared:</span>
            <p className="italic font-mono">"{packet?.shareableSummary || 'Awaiting summary check-in...'}"</p>
          </div>

          <label className="flex items-start gap-3 p-3 bg-wise-teal-soft/10 border border-wise-teal/20 rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-4 h-4 rounded border-wise-border text-wise-teal-deep shrink-0 mt-0.5"
              required
            />
            <span className="text-xs text-wise-teal-deep font-semibold leading-relaxed">
              I consent to share my Wise Care Intake summary and shareable summary with {provider.name}.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-2">
          <Link href="/matching" className="btn btn-ghost btn-sm flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          
          <button
            type="submit"
            disabled={!consent || submitting}
            className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Send connection request</span>
              </>
            )}
          </button>
        </div>

      </form>
      
      {/* Disclaimer */}
      <div className="notice flex items-start gap-3 bg-wise-surface-2 border border-wise-hairline rounded-xl p-4 text-[13px]">
        <ShieldCheck className="w-5 h-5 text-wise-muted shrink-0 mt-0.5" />
        <div className="text-wise-fg-soft leading-normal">
          <strong>Security Notice:</strong> Releasing details forward is done over encrypted sessions. Your employer or university will never receive notice of this referral.
        </div>
      </div>

    </div>
  );
}

export default function ConnectionRequestPage() {
  return (
    <AppShell title="Request Connection" crumbs={['Care', 'Connect']}>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-wise-teal spin" />
          <p className="text-sm text-wise-muted">Loading connection portal...</p>
        </div>
      }>
        <ConnectionRequestContent />
      </Suspense>
    </AppShell>
  );
}
