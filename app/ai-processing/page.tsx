'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import AppShell from '@/components/layout/AppShell';
import AgentStatusCard from '@/components/ui/AgentStatusCard';
import Notice from '@/components/ui/Notice';

import { Info } from 'lucide-react';

interface AgentStep {
  name: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
}

export default function AIProcessingPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<AgentStep[]>([
    { name: 'Intake Agent', desc: 'Structuring your concerns into a private summary.', status: 'running', output: '<strong>Captured</strong>: anxiety + sleep disruption · 6 weeks · intensity 7/10 · impact on sleep, concentration, mood.' },
    { name: 'Safety Agent', desc: 'Checking for any indicators of urgent risk.', status: 'pending', output: '<strong>No immediate risk indicators.</strong> Care route can proceed normally. We will surface crisis support throughout the experience.' },
    { name: 'Care Route Agent', desc: 'Identifying a recommended support path.', status: 'pending', output: 'Suggested route: <strong>therapy with a sleep + anxiety focus</strong>, weekly. Optional psychiatric consultation if therapy alone is insufficient over 4-6 weeks.' },
    { name: 'Matching Agent', desc: 'Comparing options against your insurance, location, and preferences.', status: 'pending', output: 'Surfaced <strong>5 options</strong>: 3 telehealth therapists (Aetna / self-pay) · 1 community clinic (sliding scale) · 1 peer support group (free).' },
    { name: 'Care Packet Agent', desc: 'Preparing a provider-ready summary you can share with consent.', status: 'pending', output: 'Draft Care Packet ready: concerns, timeline, daily impact, care goals, questions to ask, and insurance notes, exactly what a clinician needs in 10 seconds.' }
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
    }, 1100);

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
    <AppShell title="AI agent review" crumbs={['Care', 'Intake', 'AI review']}>
      <div className="processing-wrap enter">
        <div className="processing-hero">
          <span className="kicker">AI agent review</span>
          <h2>Your intake is being reviewed by five specialized agents.</h2>
          <p>
            Each agent focuses on one part of your care route. You'll see the full result in a moment. 
            This is review work, not a diagnosis, not a clinical decision.
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span className="badge teal">
              <span className="dot"></span>Working privately on your data
            </span>
            <span className="badge">
              <span className="dot"></span>No data shared yet
            </span>
            <span className="badge">
              <span className="dot"></span>Crisis routing always available
            </span>
          </div>
        </div>

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
          <div className="agent-rail">
            {steps.map((s, idx) => (
              <AgentStatusCard
                key={idx}
                name={s.name}
                desc={s.desc}
                status={s.status}
                output={s.output}
                stepNumber={idx + 1}
              />
            ))}
          </div>
        )}

        <div className="notice" style={{ marginTop: '22px' }}>
          <Info className="w-4 h-4 shrink-0 text-wise-muted mt-0.5" />
          <div>
            <strong style={{ color: 'var(--fg)' }}>A note on AI in healthcare.</strong> These agents structure information and suggest options. They do not diagnose or prescribe. A licensed professional is the next step; Wise Care just helps you get to one faster.
          </div>
        </div>
        
        <Notice className="mt-8 text-left" title="Security & Privacy">
          For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request. No medical claims or diagnoses are generated.
        </Notice>
      </div>
    </AppShell>
  );
}
