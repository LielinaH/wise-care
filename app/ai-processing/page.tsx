'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Loader2, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

interface AgentStep {
  name: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export default function AIProcessingPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<AgentStep[]>([
    { name: 'Intake Agent', desc: 'Structuring your responses...', status: 'running' },
    { name: 'Safety Agent', desc: 'Scanning for crisis signals and risk levels...', status: 'pending' },
    { name: 'Care Route Agent', desc: 'Formulating clinical pathways and disclaimers...', status: 'pending' },
    { name: 'Matching Agent', desc: 'Filtering providers based on location and insurance...', status: 'pending' },
    { name: 'Care Packet Agent', desc: 'Pre-drafting shareable summary briefs...', status: 'pending' },
  ]);

  useEffect(() => {
    let currentStep = 0;
    const intakeAnswers = storage.getIntake();

    if (!intakeAnswers || !intakeAnswers.concerns || intakeAnswers.concerns.length === 0) {
      setErrorMsg('No intake answers found. Please complete the intake form.');
      return;
    }

    const interval = setInterval(() => {
      setSteps((prev) => {
        const next = [...prev];
        
        // Complete current step
        if (currentStep < next.length) {
          next[currentStep].status = 'completed';
        }
        
        currentStep += 1;
        
        // Run next step
        if (currentStep < next.length) {
          next[currentStep].status = 'running';
        } else {
          clearInterval(interval);
          // Launch final routing fetch
          fetchCareRoute();
        }
        
        return next;
      });
    }, 1000);

    const fetchCareRoute = async () => {
      try {
        const res = await fetch('/api/ai/care-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(intakeAnswers),
        });

        if (!res.ok) {
          throw new Error('API route failed to generate pathway');
        }

        const data = await res.json();
        storage.setCareRoute(data);
        
        // Pre-fetch Care Packet details automatically in background so matching/packet pages are super fast
        try {
          const packetRes = await fetch('/api/ai/care-packet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intake: intakeAnswers, careRoute: data }),
          });
          if (packetRes.ok) {
            const packetData = await packetRes.json();
            storage.setCarePacket(packetData);
          }
        } catch (e) {
          console.warn('Pre-fetching care packet failed, will retry on packet page:', e);
        }

        // Navigate to care route
        router.push('/care-route');
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Something went wrong during AI analysis. Please try again.');
      }
    };

    return () => {
      clearInterval(interval);
    };
  }, [router]);

  return (
    <AppShell title="Analyzing Intake" crumbs={['Care', 'Processing']}>
      <div className="max-w-[560px] mx-auto text-center py-8">
        <span className="kicker">Care Navigation Pipeline</span>
        <h2 className="text-2xl font-display font-semibold tracking-tight text-wise-fg mt-3 mb-2">
          AI agents are organizing your options
        </h2>
        <p className="text-xs text-wise-muted mb-8 max-w-[48ch] mx-auto leading-relaxed">
          Our automated workflow checks for safety, identifies cost barriers, and translates symptoms into professional categories. 
          <em> This is an administrative routing process, not a clinical review.</em>
        </p>

        {errorMsg ? (
          <div className="p-5 bg-wise-danger-soft border border-wise-danger/20 rounded-2xl text-left flex gap-3 text-wise-danger">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-semibold mb-1">Process Blocked</strong>
              <span className="text-xs">{errorMsg}</span>
              <button 
                onClick={() => router.push('/intake')}
                className="btn btn-sm bg-wise-danger text-white text-xs font-semibold mt-3"
              >
                Return to Intake
              </button>
            </div>
          </div>
        ) : (
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm text-left divide-y divide-wise-hairline">
            {steps.map((s, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  {s.status === 'completed' && (
                    <span className="w-5 h-5 rounded-full bg-wise-success-soft text-wise-success flex items-center justify-center font-bold text-[10px]">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {s.status === 'running' && (
                    <Loader2 className="w-5 h-5 text-wise-teal spin" />
                  )}
                  {s.status === 'pending' && (
                    <span className="w-5 h-5 rounded-full bg-wise-surface-sunk text-wise-muted-2 flex items-center justify-center font-mono text-[9.5px]">
                      {idx + 1}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${s.status === 'running' ? 'text-wise-teal-deep' : s.status === 'completed' ? 'text-wise-fg-soft' : 'text-wise-muted'}`}>
                    {s.name}
                  </div>
                  <div className="text-xs text-wise-muted mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="notice mt-8 flex items-start gap-3 bg-wise-surface-2 border border-wise-hairline rounded-xl p-4 text-[13px] text-left">
          <ShieldCheck className="w-5 h-5 text-wise-muted shrink-0 mt-0.5" />
          <div className="text-wise-fg-soft leading-normal">
            <strong>Security Notice:</strong> Your information is handled securely within this local browser session. No medical claims or diagnoses are generated.
          </div>
        </div>

      </div>
    </AppShell>
  );
}
