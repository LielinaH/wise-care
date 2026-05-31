'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import AppShell from '@/components/layout/AppShell';
import AgentStatusCard from '@/components/ui/AgentStatusCard';
import Notice from '@/components/ui/Notice';

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
          <Notice variant="danger" title="Process Blocked" className="text-left">
            <span className="text-xs block mt-1">{errorMsg}</span>
            <button 
              onClick={() => router.push('/intake')}
              className="btn btn-sm bg-wise-danger text-white text-xs font-semibold mt-3"
            >
              Return to Intake
            </button>
          </Notice>
        ) : (
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm text-left divide-y divide-wise-hairline">
            {steps.map((s, idx) => (
              <AgentStatusCard
                key={idx}
                name={s.name}
                desc={s.desc}
                status={s.status}
                stepNumber={idx + 1}
              />
            ))}
          </div>
        )}

        <Notice className="mt-8 text-left" title="Security & Privacy">
          For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request. No medical claims or diagnoses are generated.
        </Notice>

      </div>
    </AppShell>
  );
}
