'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import AppShell from '@/components/layout/AppShell';
import AgentStatusCard from '@/components/ui/AgentStatusCard';
import Notice from '@/components/ui/Notice';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';

import { Info } from 'lucide-react';

interface AgentStep {
  name: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
}

function AIProcessingPageContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode } = useAuth();
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
    let intakeAnswers: any = null;
    let isMounted = true;

    const runStepsAndFetch = async () => {
      if (isFirebaseMode) {
        if (!currentUser) return;
        try {
          const profile = await firestoreHelpers.getPatientProfile(currentUser.uid);
          if (profile && profile.intakeAnswers) {
            intakeAnswers = profile.intakeAnswers;
          }
        } catch (e) {
          console.error("Error fetching patient intake from Firestore:", e);
        }
      } else {
        intakeAnswers = storage.getIntake();
      }

      if (!intakeAnswers || !intakeAnswers.concerns || intakeAnswers.concerns.length === 0) {
        if (isMounted) {
          setErrorMsg('No intake answers found. Please complete the intake form.');
        }
        return;
      }

      const interval = setInterval(() => {
        if (!isMounted) {
          clearInterval(interval);
          return;
        }

        setSteps((prev) => {
          const next = [...prev];
          if (currentStep < next.length) {
            next[currentStep].status = 'completed';
          }
          currentStep += 1;
          if (currentStep < next.length) {
            next[currentStep].status = 'running';
          } else {
            clearInterval(interval);
            fetchCareRoute(intakeAnswers);
          }
          return next;
        });
      }, 1100);
    };

    const fetchCareRoute = async (answers: any) => {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (isFirebaseMode && currentUser) {
          const token = await currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/ai/care-route', {
          method: 'POST',
          headers,
          body: JSON.stringify(answers),
        });

        if (!res.ok) {
          throw new Error('API route failed to generate pathway');
        }

        const data = await res.json();

        if (isFirebaseMode && currentUser) {
          // Save generated care route to Cloud Firestore
          const routeId = await firestoreHelpers.createCareRoute({
            patientId: currentUser.uid,
            riskLevel: data.riskLevel,
            recommendedRoute: data.recommendedRoute,
            recommendedSupportTypes: data.recommendedSupportTypes,
            reasoningSummary: data.reasoningSummary,
            detectedBarriers: data.detectedBarriers,
            careGoals: data.careGoals,
            nextSteps: data.nextSteps,
            matchingCriteria: data.matchingCriteria,
            safetyMessage: data.safetyMessage,
            isFallback: !!data.isFallback,
            createdAt: null,
            updatedAt: null,
          });

          let packetId = '';
          try {
            const packetRes = await fetch('/api/ai/care-packet', {
              method: 'POST',
              headers,
              body: JSON.stringify({ intake: answers, careRoute: data }),
            });
            if (packetRes.ok) {
              const packetData = await packetRes.json();
              packetId = await firestoreHelpers.createCarePacket({
                patientId: currentUser.uid,
                careRouteId: routeId,
                mainConcerns: packetData.mainConcerns,
                timeline: packetData.timeline,
                dailyLifeImpact: packetData.dailyLifeImpact,
                careGoals: packetData.careGoals,
                questionsToAskProvider: packetData.questionsToAskProvider,
                materialsToPrepare: packetData.materialsToPrepare,
                insurancePaymentNotes: packetData.insurancePaymentNotes,
                suggestedOutreachMessage: packetData.suggestedOutreachMessage,
                shareableSummary: packetData.shareableSummary,
                nextStepChecklist: packetData.nextStepChecklist || [],
                selectedFields: packetData.selectedFields || {},
                createdAt: null,
                updatedAt: null,
              });
            }
          } catch (e) {
            console.warn('Pre-fetching care packet failed, will retry on packet page:', e);
          }

          // Update active routes/packets in the patient's profile
          await firestoreHelpers.setPatientProfile(currentUser.uid, {
            activeCareRouteId: routeId,
            activeCarePacketId: packetId || null,
          });
        } else {
          storage.setCareRoute(data);
          try {
            const packetRes = await fetch('/api/ai/care-packet', {
              method: 'POST',
              headers,
              body: JSON.stringify({ intake: answers, careRoute: data }),
            });
            if (packetRes.ok) {
              const packetData = await packetRes.json();
              storage.setCarePacket(packetData);
            }
          } catch (e) {
            console.warn('Pre-fetching care packet failed, will retry on packet page:', e);
          }
        }

        if (isMounted) {
          router.push('/care-route');
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) {
          setErrorMsg('Something went wrong during AI analysis. Please try again.');
        }
      }
    };

    runStepsAndFetch();

    return () => {
      isMounted = false;
    };
  }, [router, currentUser, isFirebaseMode]);

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
          This is a demo prototype. Do not enter real medical or personal health information. Wise Care does not diagnose, provide therapy, prescribe medication, or replace a licensed professional.
        </Notice>
      </div>
    </AppShell>
  );
}

export default function AIProcessingPage() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <AIProcessingPageContent />
    </ProtectedRoute>
  );
}
