'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, 
  BarChart, 
  ChevronRight, 
  HelpCircle, 
  AlertTriangle, 
  Heart, 
  Users, 
  Building, 
  ShieldAlert, 
  Lock, 
  FileCheck2,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-wise-bg text-wise-fg min-h-screen flex flex-col font-sans">
      {/* Navigation Top Bar */}
      <nav className="nav-top sticky top-0 z-20 bg-wise-bg/82 backdrop-blur-md border-b border-wise-hairline">
        <div className="container max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link className="flex items-center gap-2.5 cursor-pointer" href="/">
            <div className="brand-mark w-7 h-7"></div>
            <div className="brand-word">
              Wise Care
              <small>Care Navigation</small>
            </div>
          </Link>
          <ul className="hidden sm:flex items-center gap-7 text-sm font-medium text-wise-fg-soft">
            <li><a href="#how" className="hover:text-wise-fg transition-colors">How it works</a></li>
            <li><a href="#who" className="hover:text-wise-fg transition-colors">Who it's for</a></li>
            <li><a href="#safety" className="hover:text-wise-fg transition-colors">Safety</a></li>
            <li><Link href="/signin" className="hover:text-wise-fg transition-colors">Sign in</Link></li>
          </ul>
          <Link href="/signin" className="btn btn-primary btn-sm flex items-center gap-1">
            Start care navigation
            <span className="inner flex items-center gap-1">→</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero relative overflow-hidden py-16 md:py-24 border-b border-wise-hairline">
        <div className="container max-w-[1240px] mx-auto px-6">
          <div className="hero-grid grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-12 items-center">
            {/* Left Column: Hero Copy */}
            <div className="enter">
              <span className="kicker">AI-powered mental health access</span>
              <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-wise-fg leading-[1.04] my-4 md:my-5">
                Find the right path to mental health support.
              </h1>
              <p className="lede max-w-[48ch] text-wise-fg-soft text-lg mb-8">
                Wise Care helps people understand their needs, prepare for care, and connect with the right support faster — without guessing, without dozens of cold calls, and without doing it alone.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/signin" className="btn btn-primary btn-lg flex items-center">
                  Start care navigation
                  <span className="inner">Begin →</span>
                </Link>
                <a href="#how" className="btn btn-ghost btn-lg">Explore how it works</a>
              </div>

              {/* Three Bullets */}
              <div className="hero-bullets grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-wise-hairline">
                <div className="hero-bullet flex gap-2.5 items-start">
                  <span className="num bg-wise-teal-soft text-wise-teal-deep rounded-full w-5 h-5 flex items-center justify-center font-mono text-[11px] font-semibold shrink-0">1</span>
                  <div className="t text-[13px] text-wise-fg-soft leading-normal">
                    <strong className="text-wise-fg font-semibold block mb-0.5 text-sm">Private intake</strong>
                    A structured form, never a chatbot. Takes about six minutes.
                  </div>
                </div>
                <div className="hero-bullet flex gap-2.5 items-start">
                  <span className="num bg-wise-teal-soft text-wise-teal-deep rounded-full w-5 h-5 flex items-center justify-center font-mono text-[11px] font-semibold shrink-0">2</span>
                  <div className="t text-[13px] text-wise-fg-soft leading-normal">
                    <strong className="text-wise-fg font-semibold block mb-0.5 text-sm">A clear care route</strong>
                    Recommended next steps based on urgency and access barriers.
                  </div>
                </div>
                <div className="hero-bullet flex gap-2.5 items-start">
                  <span className="num bg-wise-teal-soft text-wise-teal-deep rounded-full w-5 h-5 flex items-center justify-center font-mono text-[11px] font-semibold shrink-0">3</span>
                  <div className="t text-[13px] text-wise-fg-soft leading-normal">
                    <strong className="text-wise-fg font-semibold block mb-0.5 text-sm">Provider-ready packet</strong>
                    A short summary to share with a clinician — so your first visit isn't lost in paperwork.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview Card */}
            <div className="enter delay-200">
              <div className="hero-visual rounded-3xl border border-wise-hairline p-6 shadow-md bg-gradient-to-b from-wise-surface to-wise-surface-2 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="kicker text-wise-muted">Care route · live preview</span>
                  <span className="badge teal flex items-center gap-1.5"><span className="dot"></span>In progress</span>
                </div>
                <div className="hero-card-row flex flex-col gap-3">
                  <div className="path-card done flex items-center gap-3.5 bg-wise-surface border border-wise-hairline rounded-xl p-3.5 shadow-sm">
                    <span className="step-dot w-7 h-7 rounded-full bg-wise-success-soft text-wise-success flex items-center justify-center font-mono text-xs font-semibold">✓</span>
                    <div>
                      <div className="lbl text-sm font-medium text-wise-fg">Private intake completed</div>
                      <div className="sub text-xs text-wise-muted">10 questions · 6 min</div>
                    </div>
                    <span className="meta ml-auto font-mono text-[10px] text-wise-muted-2">Step 1</span>
                  </div>
                  <div className="path-card done flex items-center gap-3.5 bg-wise-surface border border-wise-hairline rounded-xl p-3.5 shadow-sm">
                    <span className="step-dot w-7 h-7 rounded-full bg-wise-success-soft text-wise-success flex items-center justify-center font-mono text-xs font-semibold">✓</span>
                    <div>
                      <div className="lbl text-sm font-medium text-wise-fg">Safety check passed</div>
                      <div className="sub text-xs text-wise-muted">No immediate risk indicators</div>
                    </div>
                    <span className="meta ml-auto font-mono text-[10px] text-wise-muted-2">Step 2</span>
                  </div>
                  <div className="path-card active flex items-center gap-3.5 bg-wise-surface border border-wise-teal/40 rounded-xl p-3.5 shadow-md pulse-ring">
                    <span className="step-dot w-7 h-7 rounded-full bg-wise-teal text-white flex items-center justify-center font-mono text-xs font-semibold">3</span>
                    <div>
                      <div className="lbl text-sm font-medium text-wise-fg">Care route ready</div>
                      <div className="sub text-xs text-wise-muted">Therapy · sleep + anxiety focus</div>
                    </div>
                    <span className="meta ml-auto font-mono text-[10px] text-wise-muted-2">Now</span>
                  </div>
                  <div className="path-card flex items-center gap-3.5 bg-wise-surface border border-wise-hairline rounded-xl p-3.5 shadow-sm opacity-60">
                    <span className="step-dot w-7 h-7 rounded-full bg-wise-surface-sunk text-wise-muted flex items-center justify-center font-mono text-xs font-semibold">4</span>
                    <div>
                      <div className="lbl text-sm font-medium text-wise-fg">Review matched options</div>
                      <div className="sub text-xs text-wise-muted">3 providers · 1 community clinic</div>
                    </div>
                    <span className="meta ml-auto font-mono text-[10px] text-wise-muted-2">Next</span>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-wise-hairline flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-wise-muted tracking-wider uppercase">Sample Preview · Simulated Data</span>
                  <span className="text-wise-teal-deep font-semibold">View full route →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Problem Grid */}
      <section id="how" className="section py-16 md:py-24">
        <div className="container max-w-[1240px] mx-auto px-6">
          <div className="section-head max-w-[720px] mb-12">
            <span className="kicker">The problem</span>
            <h2 className="text-3xl font-display font-semibold tracking-tight my-4">
              Mental health care is hard to navigate before you even start.
            </h2>
            <p className="lede">
              Most people don't need more information. They need an answer to a simpler question: <em>what's the right first step for me, given my situation, my coverage, and how I'm feeling right now?</em>
            </p>
          </div>

          <div className="problem-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="problem-card bg-wise-surface border border-wise-hairline rounded-2xl p-6 shadow-sm">
              <div className="ico w-9 h-9 rounded-lg bg-wise-surface-sunk text-wise-fg-soft flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <div className="word font-display text-[19px] font-semibold mb-2">Confusing</div>
              <div className="desc text-[13.5px] text-wise-muted leading-relaxed">
                Therapy. Psychiatry. Group. Community clinic. EAP. Self-guided. The labels don't tell you which one fits.
              </div>
            </div>
            <div className="problem-card bg-wise-surface border border-wise-hairline rounded-2xl p-6 shadow-sm">
              <div className="ico w-9 h-9 rounded-lg bg-wise-surface-sunk text-wise-fg-soft flex items-center justify-center mb-4">
                <BarChart className="w-5 h-5" />
              </div>
              <div className="word font-display text-[19px] font-semibold mb-2">Expensive</div>
              <div className="desc text-[13.5px] text-wise-muted leading-relaxed">
                Insurance coverage is uncertain. Out-of-pocket costs vary wildly. Many people wait until they cannot anymore.
              </div>
            </div>
            <div className="problem-card bg-wise-surface border border-wise-hairline rounded-2xl p-6 shadow-sm">
              <div className="ico w-9 h-9 rounded-lg bg-wise-surface-sunk text-wise-fg-soft flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <div className="word font-display text-[19px] font-semibold mb-2">Fragmented</div>
              <div className="desc text-[13.5px] text-wise-muted leading-relaxed">
                Directories are out of date. Providers don't return calls. The first appointment is weeks away — if it happens.
              </div>
            </div>
            <div className="problem-card bg-wise-surface border border-wise-hairline rounded-2xl p-6 shadow-sm">
              <div className="ico w-9 h-9 rounded-lg bg-wise-surface-sunk text-wise-fg-soft flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <div className="word font-display text-[19px] font-semibold mb-2">Slow</div>
              <div className="desc text-[13.5px] text-wise-muted leading-relaxed">
                A first visit can take a month. By then the reason for the visit may already feel different, worse, or unclear.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five Quiet Steps */}
      <section className="section bg-wise-bg-tint py-16 md:py-24">
        <div className="container max-w-[1240px] mx-auto px-6">
          <div className="section-head max-w-[720px] mb-12">
            <span className="kicker">How Wise Care works</span>
            <h2 className="text-3xl font-display font-semibold tracking-tight my-4">
              Five quiet steps from "I need help" to a first appointment.
            </h2>
            <p className="lede">
              No chatbot. No diagnoses. Specialized AI agents structure your situation, check for safety, recommend a path, surface options that fit, and prepare a short summary you can share with whoever you choose.
            </p>
          </div>

          <div className="solution-flow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border border-wise-hairline rounded-2xl overflow-hidden bg-wise-surface shadow-sm">
            <div className="sol-step p-6 border-b sm:border-r border-wise-hairline last:border-b-0 last:border-r-0">
              <div className="step-num font-mono text-[11px] text-wise-teal-deep tracking-wider font-semibold">01 · INTAKE</div>
              <div className="step-t font-semibold text-[15px] my-2">AI-guided intake</div>
              <div className="step-d text-xs text-wise-muted leading-relaxed">
                A structured form, not a conversation. Captures what's going on, for how long, and how it's affecting daily life.
              </div>
            </div>
            <div className="sol-step p-6 border-b sm:border-r border-wise-hairline last:border-b-0 last:border-r-0">
              <div className="step-num font-mono text-[11px] text-wise-teal-deep tracking-wider font-semibold">02 · SAFETY</div>
              <div className="step-t font-semibold text-[15px] my-2">Safety check</div>
              <div className="step-d text-xs text-wise-muted leading-relaxed">
                Looks for indicators of acute risk. If anything is flagged, routes immediately to crisis support — not a waitlist.
              </div>
            </div>
            <div className="sol-step p-6 border-b sm:border-r border-wise-hairline last:border-b-0 last:border-r-0">
              <div className="step-num font-mono text-[11px] text-wise-teal-deep tracking-wider font-semibold">03 · ROUTE</div>
              <div className="step-t font-semibold text-[15px] my-2">Care route</div>
              <div className="step-d text-xs text-wise-muted leading-relaxed">
                Suggests a path: therapy, psychiatry, community clinic, support group, or self-guided support while waiting.
              </div>
            </div>
            <div className="sol-step p-6 border-b sm:border-r border-wise-hairline last:border-b-0 last:border-r-0">
              <div className="step-num font-mono text-[11px] text-wise-teal-deep tracking-wider font-semibold">04 · MATCH</div>
              <div className="step-t font-semibold text-[15px] my-2">Provider matching</div>
              <div className="step-d text-xs text-wise-muted leading-relaxed">
                Filters real-world barriers — insurance, location, availability, sliding scale — and surfaces options that actually fit.
              </div>
            </div>
            <div className="sol-step p-6 last:border-b-0 last:border-r-0">
              <div className="step-num font-mono text-[11px] text-wise-teal-deep tracking-wider font-semibold">05 · PACKET</div>
              <div className="step-t font-semibold text-[15px] my-2">Care Packet</div>
              <div className="step-d text-xs text-wise-muted leading-relaxed">
                A short, provider-ready summary you can share with consent — so the first appointment starts past intake paperwork.
              </div>
            </div>
          </div>

          <div className="notice brand mt-8 max-w-[760px] flex gap-3.5 items-start bg-wise-teal-soft border border-wise-teal/20 rounded-xl p-4 text-[13.5px] text-wise-teal-deep">
            <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-wise-teal-deep" />
            <div>
              <strong className="text-wise-teal-deep font-semibold block mb-0.5">What Wise Care is not.</strong>
              We do not diagnose, treat, or prescribe. We don't replace licensed clinicians. We help people get to the right person, faster, with less guessing.
            </div>
          </div>
        </div>
      </section>

      {/* Built For Stakeholders */}
      <section id="who" className="section py-16 md:py-24">
        <div className="container max-w-[1240px] mx-auto px-6">
          <div className="section-head max-w-[720px] mb-12">
            <span className="kicker">Built for</span>
            <h2 className="text-3xl font-display font-semibold tracking-tight my-4">
              A platform with sides for everyone who supports the journey.
            </h2>
            <p className="lede">
              Care navigation works because every stakeholder has the right view — and never sees what they shouldn't.
            </p>
          </div>

          <div className="stake-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="stake-card bg-wise-surface border border-wise-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="ico w-9 h-9 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <div className="t font-semibold text-sm">Individuals</div>
              <div className="d text-xs text-wise-muted mt-2 leading-relaxed">
                A calm intake, a clear path, and a packet to bring to a first appointment.
              </div>
            </div>
            <div className="stake-card bg-wise-surface border border-wise-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="ico w-9 h-9 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <div className="t font-semibold text-sm">Providers</div>
              <div className="d text-xs text-wise-muted mt-2 leading-relaxed">
                Referrals arrive with context already structured — and only what the user agreed to share.
              </div>
            </div>
            <div className="stake-card bg-wise-surface border border-wise-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="ico w-9 h-9 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <div className="t font-semibold text-sm">Employers</div>
              <div className="d text-xs text-wise-muted mt-2 leading-relaxed">
                Anonymous trends only. Where employees get stuck, never who or with what.
              </div>
            </div>
            <div className="stake-card bg-wise-surface border border-wise-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="ico w-9 h-9 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <div className="t font-semibold text-sm">Universities</div>
              <div className="d text-xs text-wise-muted mt-2 leading-relaxed">
                Student support demand and routing data — without any individual health information.
              </div>
            </div>
            <div className="stake-card bg-wise-surface border border-wise-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="ico w-9 h-9 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <div className="t font-semibold text-sm">Insurers</div>
              <div className="d text-xs text-wise-muted mt-2 leading-relaxed">
                Operational signals on access barriers — coverage gaps, wait times, completion rates.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="section py-16 md:py-24 border-t border-wise-hairline">
        <div className="container max-w-[1240px] mx-auto px-6">
          <div className="safety-section rounded-3xl bg-wise-bg-tint p-8 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div>
              <span className="kicker">Safety & responsibility</span>
              <h2 className="text-3xl font-display font-semibold tracking-tight text-wise-fg mt-4 mb-4">
                Built with the seriousness this work demands.
              </h2>
              <p className="lede mb-6">
                Wise Care is for navigation, not treatment. We are explicit about what we do — and what we will never do — because the people who reach us deserve clarity, not hype.
              </p>

              <div className="notice danger flex items-start gap-3.5 bg-wise-danger-soft border border-wise-danger/20 rounded-xl p-4 text-[13.5px] text-wise-danger">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-wise-danger" />
                <div>
                  <strong className="block text-wise-danger font-semibold mb-1">If you may be in immediate danger or thinking about harming yourself, please reach out now.</strong>
                  <div className="font-mono text-xs mt-1">988 Suicide & Crisis Lifeline · call or text 988</div>
                  <div className="font-mono text-xs">Emergency · 911</div>
                </div>
              </div>
            </div>

            {/* Pillars */}
            <div className="safety-pillars flex flex-col gap-4">
              <div className="pillar flex gap-3.5 p-4.5 bg-wise-surface border border-wise-hairline rounded-xl shadow-sm">
                <div className="ico w-8 h-8 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="t font-semibold text-sm mb-1 text-wise-fg">No diagnoses, no prescriptions</div>
                  <div className="d text-xs text-wise-muted leading-relaxed">
                    Wise Care does not act as a clinician. We support navigation, preparation, and connection.
                  </div>
                </div>
              </div>
              <div className="pillar flex gap-3.5 p-4.5 bg-wise-surface border border-wise-hairline rounded-xl shadow-sm">
                <div className="ico w-8 h-8 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="t font-semibold text-sm mb-1 text-wise-fg">Safety routing is non-negotiable</div>
                  <div className="d text-xs text-wise-muted leading-relaxed">
                    If intake indicates immediate risk, the product surfaces crisis support before anything else.
                  </div>
                </div>
              </div>
              <div className="pillar flex gap-3.5 p-4.5 bg-wise-surface border border-wise-hairline rounded-xl shadow-sm">
                <div className="ico w-8 h-8 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="t font-semibold text-sm mb-1 text-wise-fg">Consent before sharing</div>
                  <div className="d text-xs text-wise-muted leading-relaxed">
                    Providers see only what the user chose to share. Organizations see only anonymous trends.
                  </div>
                </div>
              </div>
              <div className="pillar flex gap-3.5 p-4.5 bg-wise-surface border border-wise-hairline rounded-xl shadow-sm">
                <div className="ico w-8 h-8 rounded-lg bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="t font-semibold text-sm mb-1 text-wise-fg">No medical claims</div>
                  <div className="d text-xs text-wise-muted leading-relaxed">
                    We don't promise outcomes. We promise a clearer first step than searching alone.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 md:py-24">
        <div className="container max-w-[1240px] mx-auto px-6">
          <div className="cta-band text-center max-w-[960px] mx-auto p-10 md:p-16 border border-wise-hairline rounded-3xl bg-gradient-to-b from-wise-surface-2 to-wise-surface shadow-md">
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight leading-tight max-w-[22ch] mx-auto mb-4">
              A clearer first step takes about six minutes.
            </h2>
            <p className="text-wise-fg-soft text-sm md:text-base max-w-[50ch] mx-auto mb-8 leading-relaxed">
              Begin the private intake, see your suggested care route, and decide what — if anything — to do next.
            </p>
            <Link href="/signin" className="btn btn-primary btn-lg flex items-center justify-center w-fit mx-auto">
              Start care navigation
              <span className="inner flex items-center gap-1">→ Begin</span>
            </Link>
            <div className="mt-5 text-xs text-wise-muted">
              Simulated data in this prototype · No personal health information stored
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="foot border-t border-wise-hairline bg-wise-surface py-12">
        <div className="container max-w-[1240px] mx-auto px-6">
          <div className="foot-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="brand-mark w-7 h-7"></div>
                <div className="brand-word">
                  Wise Care
                  <small>Care Navigation Platform</small>
                </div>
              </div>
              <p className="text-[13px] text-wise-muted leading-relaxed max-w-[36ch]">
                A care navigation prototype. Not a clinical service. We help people get to the right person, faster.
              </p>
            </div>
            <div>
              <h5 className="font-mono text-[11px] font-medium tracking-wider uppercase text-wise-muted-2 mb-4">Product</h5>
              <ul className="flex flex-col gap-2.5 text-[13.5px] text-wise-fg-soft">
                <li><a href="#how" className="hover:text-wise-fg transition-colors">How it works</a></li>
                <li><Link href="/intake" className="hover:text-wise-fg transition-colors">Care navigation</Link></li>
                <li><Link href="/matching" className="hover:text-wise-fg transition-colors">Support options</Link></li>
                <li><Link href="/care-packet" className="hover:text-wise-fg transition-colors">Care packet</Link></li>
                <li><Link href="/follow-up" className="hover:text-wise-fg transition-colors">Follow-up</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[11px] font-medium tracking-wider uppercase text-wise-muted-2 mb-4">Stakeholders</h5>
              <ul className="flex flex-col gap-2.5 text-[13.5px] text-wise-fg-soft">
                <li><Link href="/provider/register" className="hover:text-wise-fg transition-colors">Providers</Link></li>
                <li><Link href="/organization/insights" className="hover:text-wise-fg transition-colors">Employers</Link></li>
                <li><Link href="/organization/insights" className="hover:text-wise-fg transition-colors">Universities</Link></li>
                <li><Link href="/organization/insights" className="hover:text-wise-fg transition-colors">Insurers</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-wise-fg transition-colors">Operations</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[11px] font-medium tracking-wider uppercase text-wise-muted-2 mb-4">Safety</h5>
              <ul className="flex flex-col gap-2.5 text-[13.5px] text-wise-fg-soft">
                <li><a href="#safety" className="hover:text-wise-fg transition-colors">Responsible use</a></li>
                <li><a href="#safety" className="hover:text-wise-fg transition-colors">Crisis support · 988</a></li>
                <li><a href="#safety" className="hover:text-wise-fg transition-colors">Privacy & consent</a></li>
                <li><a href="#safety" className="hover:text-wise-fg transition-colors">What we are not</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom mt-10 pt-5 border-t border-wise-hairline flex flex-col sm:flex-row justify-between items-center text-xs text-wise-muted gap-2 text-center">
            <span>© Wise Care — prototype only · simulated data · v0.1</span>
            <span className="font-mono text-wise-muted">Not a clinical service. If in immediate danger, call 988 or 911.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
