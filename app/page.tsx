'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, 
  BarChart, 
  Activity,
  HelpCircle, 
  AlertTriangle, 
  Heart, 
  Users, 
  Building, 
  Lock, 
  FileCheck2,
  Info,
  Check,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-wise-bg text-wise-fg min-h-screen flex flex-col font-sans">
      {/* Navigation Top Bar */}
      <nav className="nav-top">
        <div className="container">
          <div className="nav-top-inner">
            <Link className="brand-row" href="/">
              <div className="brand-mark"></div>
              <div className="brand-word">
                Wise Care
                <small>Care Navigation</small>
              </div>
            </Link>
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#who">Who it's for</a></li>
              <li><a href="#safety">Safety</a></li>
              <li><Link href="/signin">Sign in</Link></li>
            </ul>
            <Link href="/signin" className="btn btn-primary btn-sm">
              Start care navigation
              <span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="enter">
              <span className="kicker">AI-powered mental health access</span>
              <h1 className="h1 my-4">Find the right path to mental health support.</h1>
              <p className="lede mb-6" style={{ maxWidth: '48ch' }}>
                Wise Care helps people understand their needs, prepare for care, and connect with the right support faster, without guessing, without dozens of cold calls, and without doing it alone.
              </p>

              <div className="flex flex-wrap gap-3 my-6">
                <Link href="/signin" className="btn btn-primary btn-lg">
                  Start care navigation
                  <span className="inner">Begin <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
                <a href="#how" className="btn btn-ghost btn-lg">Explore how it works</a>
              </div>

              <div className="hero-bullets">
                <div className="hero-bullet">
                  <span className="num">1</span>
                  <div className="t">
                    <strong>Private intake</strong>
                    A structured form, never a chatbot. Takes about six minutes.
                  </div>
                </div>
                <div className="hero-bullet">
                  <span className="num">2</span>
                  <div className="t">
                    <strong>A clear care route</strong>
                    Recommended next steps based on your situation, urgency, and access barriers.
                  </div>
                </div>
                <div className="hero-bullet">
                  <span className="num">3</span>
                  <div className="t">
                    <strong>Provider-ready packet</strong>
                    A short summary to share with a clinician, so your first visit isn't lost in paperwork.
                  </div>
                </div>
              </div>
            </div>

            <div className="enter" style={{ animationDelay: '200ms' }}>
              <div className="hero-visual">
                <div className="flex items-center justify-between mb-4.5">
                  <span className="kicker" style={{ color: 'var(--muted)' }}>Care route · live preview</span>
                  <span className="badge teal"><span className="dot"></span>In progress</span>
                </div>
                <div className="hero-card-row">
                  <div className="path-card done">
                    <span className="step-dot"><Check className="w-3.5 h-3.5" /></span>
                    <div>
                      <div className="lbl">Private intake completed</div>
                      <div className="sub">10 questions · 6 min</div>
                    </div>
                    <span className="meta">Step 1</span>
                    <span className="path-conn"></span>
                  </div>
                  <div className="path-card done">
                    <span className="step-dot"><Check className="w-3.5 h-3.5" /></span>
                    <div>
                      <div className="lbl">Safety check passed</div>
                      <div className="sub">No immediate risk indicators</div>
                    </div>
                    <span className="meta">Step 2</span>
                    <span className="path-conn"></span>
                  </div>
                  <div className="path-card active">
                    <span className="step-dot">3</span>
                    <div>
                      <div className="lbl">Care route ready</div>
                      <div className="sub">Therapy · sleep + anxiety focus</div>
                    </div>
                    <span className="meta">Now</span>
                    <span className="path-conn"></span>
                  </div>
                  <div className="path-card">
                    <span className="step-dot">4</span>
                    <div>
                      <div className="lbl">Review matched options</div>
                      <div className="sub">3 providers · 1 community clinic · 1 group</div>
                    </div>
                    <span className="meta">Next</span>
                    <span className="path-conn"></span>
                  </div>
                  <div className="path-card">
                    <span className="step-dot">5</span>
                    <div>
                      <div className="lbl">Send connection request</div>
                      <div className="sub">Care Packet · with your consent</div>
                    </div>
                    <span className="meta">After</span>
                  </div>
                </div>
                <div className="mt-4 pt-3.5 border-t border-wise-hairline flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-wise-muted tracking-wider uppercase">SAMPLE PREVIEW - SIMULATED DATA</span>
                  <Link href="/signin" className="text-wise-teal-deep font-semibold hover:underline flex items-center gap-1">
                    View full route <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Problem Grid */}
      <section id="how" className="section">
        <div className="container">
          <div className="section-head max-w-[720px]">
            <span className="kicker">The problem</span>
            <h2 className="h2 my-3">Mental health care is hard to navigate before you even start.</h2>
            <p className="lede">
              Most people don't need more information. They need an answer to a simpler question: <em>what's the right first step for me, given my situation, my coverage, and how I'm feeling right now?</em>
            </p>
          </div>

          <div className="problem-grid">
            <div className="problem-card">
              <div className="ico">
                <Compass className="w-5 h-5" />
              </div>
              <div className="word">Confusing</div>
              <div className="desc">Therapy. Psychiatry. Group. Community clinic. EAP. Self-guided. The labels don't tell you which one fits.</div>
            </div>
            <div className="problem-card">
              <div className="ico">
                <BarChart className="w-5 h-5" />
              </div>
              <div className="word">Expensive</div>
              <div className="desc">Insurance coverage is uncertain. Out-of-pocket costs vary wildly. Many people wait until they cannot anymore.</div>
            </div>
            <div className="problem-card">
              <div className="ico">
                <Users className="w-5 h-5" />
              </div>
              <div className="word">Fragmented</div>
              <div className="desc">Directories are out of date. Providers don't return calls. The first appointment is weeks away, if it happens.</div>
            </div>
            <div className="problem-card">
              <div className="ico">
                <Activity className="w-5 h-5" />
              </div>
              <div className="word">Slow</div>
              <div className="desc">A first visit can take a month. By then the reason for the visit may already feel different, worse, or unclear.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works flow */}
      <section className="section tint">
        <div className="container">
          <div className="section-head max-w-[720px]">
            <span className="kicker">How Wise Care works</span>
            <h2 className="h2 my-3">Five quiet steps from "I need help" to a first appointment.</h2>
            <p className="lede">
              No chatbot. No diagnoses. Specialized AI agents structure your situation, check for safety, recommend a path, surface options that fit, and prepare a short summary you can share with whoever you choose.
            </p>
          </div>

          <div className="solution-flow">
            <div className="sol-step">
              <div className="step-num">01 · INTAKE</div>
              <div className="step-t">AI-guided intake</div>
              <div className="step-d">A structured form, not a conversation. Captures what's going on, for how long, and how it's affecting daily life.</div>
            </div>
            <div className="sol-step">
              <div className="step-num">02 · SAFETY</div>
              <div className="step-t">Safety check</div>
              <div className="step-d">Looks for indicators of acute risk. If anything is flagged, routes immediately to crisis support, not a waitlist.</div>
            </div>
            <div className="sol-step">
              <div className="step-num">03 · ROUTE</div>
              <div className="step-t">Care route</div>
              <div className="step-d">Suggests a path: therapy, psychiatry, community clinic, support group, or self-guided support while waiting.</div>
            </div>
            <div className="sol-step">
              <div className="step-num">04 · MATCH</div>
              <div className="step-t">Provider matching</div>
              <div className="step-d">Filters real-world barriers (insurance, location, availability, sliding scale) and surfaces options that actually fit.</div>
            </div>
            <div className="sol-step">
              <div className="step-num">05 · PACKET</div>
              <div className="step-t">Care Packet</div>
              <div className="step-d">A short, provider-ready summary you can share with consent, so the first appointment starts past intake paperwork.</div>
            </div>
          </div>

          <div className="notice brand mt-7 max-w-[760px]">
            <Info className="ico w-4 h-4 text-wise-teal-deep shrink-0 mt-0.5" />
            <div>
              <strong className="text-wise-teal-deep font-semibold">What Wise Care is not.</strong>
              <p className="mt-0.5">We do not diagnose, treat, or prescribe. We don't replace licensed clinicians. We help people get to the right person, faster, with less guessing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Stakeholders */}
      <section id="who" className="section">
        <div className="container">
          <div className="section-head max-w-[720px]">
            <span className="kicker">Built for</span>
            <h2 className="h2 my-3">A platform with sides for everyone who supports the journey.</h2>
            <p className="lede">Care navigation works because every stakeholder has the right view and never sees what they shouldn't.</p>
          </div>

          <div className="stake-grid">
            <div className="stake-card">
              <div className="ico">
                <Heart className="w-5 h-5" />
              </div>
              <div className="t">Individuals</div>
              <div className="d">A calm intake, a clear path, and a packet to bring to a first appointment.</div>
            </div>
            <div className="stake-card">
              <div className="ico">
                <Users className="w-5 h-5" />
              </div>
              <div className="t">Providers</div>
              <div className="d">Referrals arrive with context already structured, and only what the user agreed to share.</div>
            </div>
            <div className="stake-card">
              <div className="ico">
                <Building className="w-5 h-5" />
              </div>
              <div className="t">Employers</div>
              <div className="d">Anonymous trends only. Where employees get stuck, never who or with what.</div>
            </div>
            <div className="stake-card">
              <div className="ico">
                <Building className="w-5 h-5" />
              </div>
              <div className="t">Universities</div>
              <div className="d">Student support demand and routing data, without any individual health information.</div>
            </div>
            <div className="stake-card">
              <div className="ico">
                <Lock className="w-5 h-5" />
              </div>
              <div className="t">Insurers</div>
              <div className="d">Operational signals on access barriers: coverage gaps, wait times, and completion rates.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="section">
        <div className="container">
          <div className="safety-section">
            <div>
              <span className="kicker">Safety & responsibility</span>
              <h2 className="h2 mt-3.5 mb-3.5">Built with the seriousness this work demands.</h2>
              <p className="lede">Wise Care is for navigation, not treatment. We are explicit about what we do and what we will never do because the people who reach us deserve clarity, not hype.</p>


            </div>
            
            <div className="safety-pillars">
              <div className="pillar">
                <div className="ico">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <div className="t">No diagnoses, no prescriptions</div>
                  <div className="d">Wise Care does not act as a clinician. We support navigation, preparation, and connection.</div>
                </div>
              </div>
              <div className="pillar">
                <div className="ico">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="t">Safety routing is non-negotiable</div>
                  <div className="d">If intake indicates immediate risk, the product surfaces crisis support before anything else.</div>
                </div>
              </div>
              <div className="pillar">
                <div className="ico">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="t">Consent before sharing</div>
                  <div className="d">Providers see only what the user chose to share. Organizations see only anonymous trends.</div>
                </div>
              </div>
              <div className="pillar">
                <div className="ico">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="t">No medical claims</div>
                  <div className="d">We don't promise outcomes. We promise a clearer first step than searching alone.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="container">
          <div className="cta-band">
            <h2>A clearer first step takes about six minutes.</h2>
            <p>Begin the private intake, see your suggested care route, and decide what, if anything, to do next.</p>
            <Link href="/signin" className="btn btn-primary btn-lg">
              Start care navigation
              <span className="inner"><ArrowRight className="w-3.5 h-3.5" /> Begin</span>
            </Link>
            <div className="mt-4 text-xs text-wise-muted">
              For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="foot">
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="brand-mark"></div>
                <div className="brand-word">
                  Wise Care
                  <small>Care Navigation Platform</small>
                </div>
              </div>
              <p className="text-[13px] text-wise-muted leading-relaxed max-w-[36ch] m-0">
                A care navigation prototype. Not a clinical service. We help people get to the right person, faster.
              </p>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><Link href="/intake">Care navigation</Link></li>
                <li><Link href="/matching">Support options</Link></li>
                <li><Link href="/care-packet">Care packet</Link></li>
                <li><Link href="/follow-up">Follow-up</Link></li>
              </ul>
            </div>
            <div>
              <h5>Stakeholders</h5>
              <ul>
                <li><Link href="/provider/register">Providers</Link></li>
                <li><Link href="/organization/insights">Employers</Link></li>
                <li><Link href="/organization/insights">Universities</Link></li>
                <li><Link href="/organization/insights">Insurers</Link></li>
                <li><Link href="/admin/dashboard">Operations</Link></li>
              </ul>
            </div>
            <div>
              <h5>Safety</h5>
              <ul>
                <li><a href="#safety">Responsible use</a></li>
                <li><a href="#safety">Privacy & consent</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© Wise Care - prototype only · simulated data · v0.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
