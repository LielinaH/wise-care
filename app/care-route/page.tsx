'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import PremiumCard from '@/components/ui/PremiumCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';
import { storage } from '@/lib/storage';
import { CareRouteResult, IntakeAnswers } from '@/lib/types';
import { 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  FileText,
  Heart,
  Users,
  Building,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function CareRoutePage() {
  const router = useRouter();
  const [careRoute, setCareRoute] = useState<CareRouteResult | null>(null);
  const [intake, setIntake] = useState<Partial<IntakeAnswers>>({});

  useEffect(() => {
    const route = storage.getCareRoute();
    const answers = storage.getIntake();
    setCareRoute(route);
    setIntake(answers);

    if (!route) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!careRoute) return null;

  const isCrisis = careRoute.riskLevel === 'crisis';

  const riskBadgeVariant = (risk: string) => {
    if (risk === 'crisis') return 'danger';
    if (risk === 'high' || risk === 'moderate') return 'warn';
    return 'success';
  };

  // Format labels and descriptions based on actual intake state
  const concernsText = intake.concerns?.join(' + ') || 'anxiety + sleep disruption';
  const durationText = intake.duration ? `for ${intake.duration}` : 'for six weeks';
  const intensityValue = intake.intensity || 7;
  const impactText = intake.impact && intake.impact.length > 0 ? intake.impact.join(', ') : 'sleep, concentration, mood';
  const safetyStatus = intake.safety === 'immediate' 
    ? 'immediate risk indicators flagged' 
    : intake.safety === 'recent' 
      ? 'recent indicators monitored' 
      : 'no immediate risk indicators';
  const preferenceText = intake.preference || 'therapy';
  
  let urgencyTitle = 'Routine';
  let urgencyDesc = 'No immediate risk indicators. A first appointment within 1–2 weeks is appropriate, with self-guided support in the interim.';
  
  if (careRoute.riskLevel === 'crisis') {
    urgencyTitle = 'Emergency / Crisis';
    urgencyDesc = 'Immediate crisis support recommended. Please call or text 988 immediately or visit the nearest emergency room.';
  } else if (careRoute.riskLevel === 'high') {
    urgencyTitle = 'High Urgency';
    urgencyDesc = 'Urgent clinical need detected. We recommend seeking an appointment within 2–3 days.';
  } else if (careRoute.riskLevel === 'moderate') {
    urgencyTitle = 'Moderate Urgency';
    urgencyDesc = 'Substantial symptoms detected. We suggest scheduling an appointment within 5–7 days.';
  }

  return (
    <AppShell 
      title="Care route" 
      crumbs={['Care', 'Care route']} 
      actions={
        <div className="flex gap-2">
          <Link href="/care-packet" className="btn btn-ghost btn-sm">Open packet</Link>
          {!isCrisis && (
            <Link href="/matching" className="btn btn-primary btn-sm">
              See options<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </Link>
          )}
        </div>
      }
    >
      <FallbackBanner isFallback={careRoute.isFallback} />

      <div className="enter-stagger stack" style={{ '--gap': '24px' } as React.CSSProperties}>
        
        {/* Urgent Crisis Header */}
        {isCrisis && (
          <Notice variant="danger" title="Immediate Crisis Support Recommended" className="p-6">
            <p className="text-sm leading-relaxed opacity-95 max-w-[64ch] mb-4">
              Based on intake signals, we recommend connecting with immediate crisis assistance. Wise Care is an administrative access platform, not an emergency medical responder or clinician. 
              <strong> Please contact a hotline below.</strong>
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="btn btn-lg bg-wise-danger text-white text-sm font-semibold hover:opacity-90 shadow-md" href="tel:988">Call or text 988 (Lifeline)</a>
              <a className="btn btn-lg border border-wise-danger text-wise-danger text-sm font-semibold hover:bg-wise-danger/10 bg-wise-surface" href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer">Chat online now</a>
              <a className="btn btn-lg btn-ghost text-sm font-semibold border-wise-danger/30 text-wise-danger bg-wise-surface" href="tel:911">Call 911 (Emergency)</a>
            </div>
          </Notice>
        )}

        {/* Route Hero Section */}
        <div className="route-hero">
          <div className="inner">
            <div>
              <div className="route-pill">
                <span className="dot"></span>CARE ROUTE · GENERATED JUST NOW
              </div>
              <h2 className="h2" style={{ margin: '0 0 10px' }}>
                {careRoute.recommendedRoute || 'Therapy with a sleep and anxiety focus, weekly.'}
              </h2>
              <p className="lede">
                {careRoute.reasoningSummary || 'Based on your concern patterns, weekly talk-based therapy is the most fitting first step.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '22px' }}>
                {!isCrisis && (
                  <>
                    <Link href="/matching" className="btn btn-primary">
                      View matched support options<span className="inner icon-only"><ArrowRight className="w-3.5 h-3.5" /></span>
                    </Link>
                    <Link href="/care-packet" className="btn btn-ghost">
                      Open Care Packet
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="urgency-block">
              <div className="lbl">URGENCY LEVEL</div>
              <div className="val">{urgencyTitle}</div>
              <div className="desc">{urgencyDesc}</div>
            </div>
          </div>
        </div>

        {/* Why this path reasoning */}
        <div className="card">
          <div className="card-head mb-4">
            <div>
              <h3 className="h3">Why this path?</h3>
              <div className="sub text-wise-muted text-xs">A short reasoning summary, written so you can push back on it.</div>
            </div>
          </div>
          <ul className="reasoning-list">
            <li>
              <span className="key">Pattern</span>
              <div>
                You described <strong>{concernsText}</strong> {durationText}. Both are highly responsive to short-term, structured therapy, which is why therapy is the primary recommendation.
              </div>
            </li>
            <li>
              <span className="key">Intensity</span>
              <div>
                You rated intensity at <strong>{intensityValue}/10</strong>, with daily impact on {impactText}. This is significant but outpatient care remains appropriate.
              </div>
            </li>
            <li>
              <span className="key">Safety</span>
              <div>
                You reported <strong>{safetyStatus}</strong>. Crisis routing remains available throughout your experience if anything changes.
              </div>
            </li>
            <li>
              <span className="key">Preference</span>
              <div>
                You preferred <strong>{preferenceText}</strong>, {intake.modality || 'telehealth-first'}. The recommended route honors this preference.
              </div>
            </li>
            <li>
              <span className="key">Backup</span>
              <div>
                If symptoms don't improve over <strong>4–6 weeks</strong> of therapy, a medication evaluation or other care modality is a reasonable next step, not a first step.
              </div>
            </li>
          </ul>
        </div>

        {/* Support Grid Modalities */}
        <div className="card">
          <div className="card-head mb-4">
            <div>
              <h3 className="h3">What kinds of support fit this route?</h3>
              <div className="sub text-wise-muted text-xs">Ranked by fit. You'll see specific matches on the next page.</div>
            </div>
          </div>
          <div className="support-grid">
            <div className="support-card featured">
              <div className="ico text-white">
                <Heart className="w-[18px] h-[18px]" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t">Licensed therapist</div>
                <div className="d">Weekly talk-based therapy. Cognitive behavioral approaches are well-studied for anxiety + sleep.</div>
                <span className="tag font-mono">PRIMARY RECOMMENDATION</span>
              </div>
            </div>
            
            <div className="support-card">
              <div className="ico text-wise-fg-soft">
                <Users className="w-[18px] h-[18px]" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t">Peer support group</div>
                <div className="d">Free weekly group. Useful as low-pressure support while you wait for a therapist appointment.</div>
                <span className="tag font-mono">SUPPLEMENTAL</span>
              </div>
            </div>

            <div className="support-card">
              <div className="ico text-wise-fg-soft">
                <Building className="w-[18px] h-[18px]" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t">Community clinic</div>
                <div className="d">In-person, sliding scale, no insurance required. Suitable if cost or insurance becomes a barrier.</div>
                <span className="tag font-mono">ALTERNATE</span>
              </div>
            </div>

            <div className="support-card">
              <div className="ico text-wise-fg-soft">
                <Sparkles className="w-[18px] h-[18px]" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t">Medication evaluation</div>
                <div className="d">Reserved as a backup if therapy alone is insufficient. Not the first step we recommend.</div>
                <span className="tag font-mono">BACKUP</span>
              </div>
            </div>

            <div className="support-card">
              <div className="ico text-wise-fg-soft">
                <BookOpen className="w-[18px] h-[18px]" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t">Self-guided support</div>
                <div className="d">Evidence-based sleep hygiene and worry-management exercises. Useful starting tonight.</div>
                <span className="tag font-mono">USE WHILE WAITING</span>
              </div>
            </div>

            <div className="support-card">
              <div className="ico text-wise-fg-soft text-wise-danger">
                <AlertTriangle className="w-[18px] h-[18px]" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t">Crisis support</div>
                <div className="d">Always available if symptoms worsen or thoughts of self-harm arise. 988 · 24/7.</div>
                <span className="tag font-mono">ALWAYS AVAILABLE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barriers Identified Grid */}
        <div className="card">
          <div className="card-head mb-4">
            <div>
              <h3 className="h3">Care barriers we detected</h3>
              <div className="sub text-wise-muted text-xs">Things that often slow people down. We've factored them into your matches.</div>
            </div>
          </div>
          <div className="barrier-grid">
            <div className="barrier high">
              <div className="head">
                <span className="name">Provider availability</span>
                <span className="badge">DETECTED</span>
              </div>
              <div className="desc">In your state, average wait time for a new therapist appointment is 3–4 weeks. We've prioritized practices with shorter waitlists.</div>
            </div>
            
            <div className="barrier high">
              <div className="head">
                <span className="name">Insurance match</span>
                <span className="badge">PARTIAL</span>
              </div>
              <div className="desc">
                {intake.insurance ? `${intake.insurance} in-network coverage is moderate. We've also surfaced sliding-scale options.` : 'No insurance provided. We have prioritized sliding scale and low-cost options.'}
              </div>
            </div>

            <div className="barrier low">
              <div className="head">
                <span className="name">Cost</span>
                <span className="badge">MANAGEABLE</span>
              </div>
              <div className="desc">Sliding scale and EAP options bring sessions to $40–$140 range.</div>
            </div>

            <div className="barrier low">
              <div className="head">
                <span className="name">Location</span>
                <span className="badge">NOT A BARRIER</span>
              </div>
              <div className="desc">Telehealth removes the geographic constraint. Your state ({intake.stateName || 'your local state'}) is covered by multiple matched providers.</div>
            </div>

            <div className="barrier low">
              <div className="head">
                <span className="name">Urgency</span>
                <span className="badge">ROUTINE</span>
              </div>
              <div className="desc">Your urgency is routine, within 1–2 weeks. No need for same-week intervention.</div>
            </div>

            <div className="barrier high">
              <div className="head">
                <span className="name">Uncertainty</span>
                <span className="badge">COMMON</span>
              </div>
              <div className="desc">It is normal to not know which provider is right. The Care Packet helps the first conversation get past introductions faster.</div>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="notice warn">
          <Info className="w-[18px] h-[18px] shrink-0 text-wise-warn mt-0.5" />
          <div>
            <strong>Important.</strong> Wise Care is a navigation tool, not a clinical service. The recommendations above are starting points for a conversation with a licensed professional, they are not a diagnosis, treatment plan, or prescription. If your symptoms worsen, please reach out to a clinician or, in a crisis, call or text <strong>988</strong>.
            <div className="text-[12px] text-wise-muted mt-2">
              For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
            </div>
          </div>
        </div>

        {/* Bottom Action Card */}
        {!isCrisis && (
          <div className="route-action-card">
            <div>
              <h3>Ready to see who fits?</h3>
              <p>Five support options are waiting, filtered by your insurance, location, and preferences. You can save options, request connections, and share your Care Packet with consent at every step.</p>
            </div>
            <Link href="/matching" className="btn btn-primary btn-lg">
              View matched options<span className="inner">5 options <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        )}

      </div>
    </AppShell>
  );
}
