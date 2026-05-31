/* Wise Care — shared client behavior */

const STORAGE_KEYS = {
  role: 'wisecare.role',
  intake: 'wisecare.intake',
  intakeStep: 'wisecare.intakeStep',
  saved: 'wisecare.saved',
  followup: 'wisecare.followup',
  sentRequests: 'wisecare.sentRequests',
};

const ROLES = {
  user: { label: 'User', home: 'user-dashboard.html' },
  provider: { label: 'Provider', home: 'provider-dashboard.html' },
  admin: { label: 'Admin', home: 'admin-dashboard.html' },
  org: { label: 'Org', home: 'org-insights.html' },
};

function getRole() {
  return localStorage.getItem(STORAGE_KEYS.role) || 'user';
}
function setRole(role) {
  if (!ROLES[role]) return;
  localStorage.setItem(STORAGE_KEYS.role, role);
  window.location.href = ROLES[role].home;
}

function getIntake() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.intake)) || {}; }
  catch { return {}; }
}
function setIntake(state) {
  localStorage.setItem(STORAGE_KEYS.intake, JSON.stringify(state));
}
function getSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.saved)) || []; }
  catch { return []; }
}
function saveProvider(id) {
  const list = new Set(getSaved());
  list.add(id);
  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify([...list]));
}
function unsaveProvider(id) {
  const list = new Set(getSaved());
  list.delete(id);
  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify([...list]));
}
function getSentRequests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.sentRequests)) || []; }
  catch { return []; }
}
function addSentRequest(id) {
  const list = new Set(getSentRequests());
  list.add(id);
  localStorage.setItem(STORAGE_KEYS.sentRequests, JSON.stringify([...list]));
}

/* ─── Icon library (inline SVG) ─── */
const ICONS = {
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m14.5 9.5-2 5-5 2 2-5 5-2z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 11h6M9 15h4"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H14a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5.5"/></svg>',
  match: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="3.5"/><circle cx="16" cy="15" r="3.5"/><path d="M10.5 11.5 13.5 12.5"/></svg>',
  packet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="m4 7 2-4h12l2 4"/><path d="M9 11h6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 11 13"/><path d="M21 3 14.5 21l-3-9-9-3z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h5l1 2h6l1-2h5"/><path d="m4 13 3-7h10l3 7v7H4z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M14 20c0-2.5 2-4 4.5-4s2.5 1 2.5 3"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 21V11h5a1 1 0 0 1 1 1v9M8 8h2M8 12h2M8 16h2M17 15h0M17 18h0"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M6 11l6 6 6-6M4 21h16"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 10 17H2z"/><path d="M12 10v4M12 18h0"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.5 21a2 2 0 0 0 3 0"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3 4 14h7l-1 7 9-11h-7z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-9-9.4C1.8 7.2 4 4 7.5 4 9.5 4 11 5 12 6.5 13 5 14.5 4 16.5 4 20 4 22.2 7.2 21 10.6 19 15.6 12 20 12 20z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};
function icon(name, size = 16) {
  const svg = ICONS[name];
  if (!svg) return '';
  return svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
}

/* ─── Mock data ─── */
const MOCK_PROVIDERS = [
  {
    id: 'p-01',
    name: 'Dr. M. — Licensed Clinical Therapist',
    type: 'Therapist',
    licensure: 'LCSW · CA',
    specialty: ['Anxiety', 'Burnout', 'Sleep'],
    modality: ['Telehealth'],
    insurance: ['Aetna', 'Cigna', 'Self-pay'],
    slidingScale: true,
    nextAvailable: 'Wed · 7 days',
    sessionCost: '$140 / session',
    matchReason: 'Anxiety + sleep focus, telehealth, accepts sliding scale.',
    matchScore: 94,
  },
  {
    id: 'p-02',
    name: 'Dr. K. — Psychiatric Nurse Practitioner',
    type: 'Medication evaluation',
    licensure: 'PMHNP · Telehealth in 27 states',
    specialty: ['Mood', 'Anxiety', 'Sleep'],
    modality: ['Telehealth'],
    insurance: ['BCBS', 'United', 'Self-pay'],
    slidingScale: false,
    nextAvailable: 'Tue · 6 days',
    sessionCost: '$320 first visit · $180 follow-up',
    matchReason: 'For a medication evaluation if therapy alone is not enough.',
    matchScore: 81,
  },
  {
    id: 'p-03',
    name: 'Quietford Counseling Collective',
    type: 'Group practice',
    licensure: 'Multi-clinician · CA + OR',
    specialty: ['Anxiety', 'Relationships', 'Work stress'],
    modality: ['Telehealth', 'In-person'],
    insurance: ['Most major plans', 'Sliding scale'],
    slidingScale: true,
    nextAvailable: 'This week',
    sessionCost: 'Sliding $80–$180',
    matchReason: 'Short waitlist and sliding scale — good for cost-sensitive starts.',
    matchScore: 88,
  },
  {
    id: 'p-04',
    name: 'County Behavioral Health Clinic',
    type: 'Community clinic',
    licensure: 'Public clinic',
    specialty: ['General', 'Crisis follow-up', 'Substance use'],
    modality: ['In-person'],
    insurance: ['Medi-Cal', 'Sliding scale', 'Uninsured OK'],
    slidingScale: true,
    nextAvailable: 'Intake call within 3 days',
    sessionCost: 'Free–$40',
    matchReason: 'Affordable option that does not require insurance.',
    matchScore: 76,
  },
  {
    id: 'p-05',
    name: 'Stillwater Peer Support Group',
    type: 'Support group',
    licensure: 'Peer-led · Volunteer facilitator',
    specialty: ['Anxiety', 'Caregiver stress'],
    modality: ['Telehealth'],
    insurance: ['Free'],
    slidingScale: true,
    nextAvailable: 'Weekly · Thursdays 7pm',
    sessionCost: 'Free',
    matchReason: 'Low-pressure first step while waiting for a therapist appointment.',
    matchScore: 70,
  },
  {
    id: 'p-06',
    name: '988 Suicide & Crisis Lifeline',
    type: 'Crisis support',
    licensure: 'Federal · 24/7',
    specialty: ['Immediate risk', 'Acute distress'],
    modality: ['Phone', 'Text', 'Chat'],
    insurance: ['Free'],
    slidingScale: true,
    nextAvailable: 'Available now · 24/7',
    sessionCost: 'Free',
    matchReason: 'If safety risk rises, this is the immediate route.',
    matchScore: 100,
  },
];

const MOCK_REFERRALS = [
  { id: 'r-7821', name: 'Member · 34', route: 'Therapy · Anxiety / sleep', risk: 'low', age: 'Adult', received: '2 hrs ago', insurance: 'Aetna', summary: 'Sleep disruption 6 wks, work pressure, no safety concerns, sliding scale OK.' },
  { id: 'r-7820', name: 'Member · 28', route: 'Therapy + Medication eval', risk: 'medium', age: 'Adult', received: '5 hrs ago', insurance: 'Self-pay', summary: 'Persistent low mood 4 mo, motivation drop, no safety concerns, open to medication.' },
  { id: 'r-7819', name: 'Member · 41', route: 'Community clinic', risk: 'low', age: 'Adult', received: 'Yesterday', insurance: 'Medi-Cal', summary: 'Generalized anxiety, cost-sensitive, prefers in-person, weekday evening.' },
  { id: 'r-7818', name: 'Member · 22', route: 'Therapy · Burnout', risk: 'low', age: 'Adult', received: 'Yesterday', insurance: 'United', summary: 'Recent grad, job stress, weekly availability, telehealth preferred.' },
  { id: 'r-7817', name: 'Member · 36', route: 'Therapy · Caregiver stress', risk: 'low', age: 'Adult', received: '2 days ago', insurance: 'Cigna', summary: 'Caregiver fatigue, no acute risk, group support also acceptable.' },
];

const MOCK_PROVIDERS_PENDING = [
  { id: 'pp-301', name: 'Marin Telehealth Group', license: 'LCSW · CA #LCS24011', specialty: 'Anxiety, Trauma', insurance: 'Aetna, BCBS, Self-pay', telehealth: true, slidingScale: true, state: 'CA', submitted: '11 hrs ago' },
  { id: 'pp-302', name: 'Dr. R. — Psychiatry', license: 'MD · NY #ML87302', specialty: 'Mood, ADHD', insurance: 'BCBS, United', telehealth: true, slidingScale: false, state: 'NY', submitted: '1 day ago' },
  { id: 'pp-303', name: 'Westbrook Counseling', license: 'LMFT · OR #LMF21998', specialty: 'Relationships, Burnout', insurance: 'Most major, Sliding scale', telehealth: true, slidingScale: true, state: 'OR', submitted: '2 days ago' },
];

/* ─── DOM helpers ─── */
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

/* Toast */
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 12px);
      background: oklch(22% 0.04 252); color: oklch(98% 0 0);
      padding: 12px 18px; border-radius: 999px; font-size: 13px; font-weight: 500;
      box-shadow: 0 12px 32px -8px oklch(20% 0.05 250 / 0.4);
      opacity: 0; transition: all 240ms cubic-bezier(.22, 1.2, .36, 1);
      z-index: 100; pointer-events: none;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translate(-50%, 0)';
  });
  clearTimeout(t._tid);
  t._tid = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translate(-50%, 12px)';
  }, 1800);
}

/* ─── Sidebar render ─── */
function renderSidebar(active) {
  const role = getRole();
  const navs = {
    user: [
      { label: 'Care', items: [
        { id: 'user-dashboard', label: 'Dashboard', href: 'user-dashboard.html', icon: 'home' },
        { id: 'intake', label: 'Intake', href: 'intake.html', icon: 'clipboard' },
        { id: 'care-route', label: 'Care route', href: 'care-route.html', icon: 'route' },
        { id: 'provider-matching', label: 'Support options', href: 'provider-matching.html', icon: 'match' },
        { id: 'care-packet', label: 'Care packet', href: 'care-packet.html', icon: 'packet' },
        { id: 'connection-request', label: 'Connection requests', href: 'connection-request.html', icon: 'send' },
        { id: 'follow-up', label: 'Follow-up', href: 'follow-up.html', icon: 'check' },
      ]},
    ],
    provider: [
      { label: 'Practice', items: [
        { id: 'provider-dashboard', label: 'Dashboard', href: 'provider-dashboard.html', icon: 'home' },
        { id: 'provider-inbox', label: 'Referral inbox', href: 'provider-inbox.html', icon: 'inbox', pill: '5' },
        { id: 'provider-register', label: 'Profile', href: 'provider-register.html', icon: 'settings' },
      ]},
    ],
    admin: [
      { label: 'Operations', items: [
        { id: 'admin-dashboard', label: 'Dashboard', href: 'admin-dashboard.html', icon: 'home' },
        { id: 'admin-verify', label: 'Provider verification', href: 'admin-verify.html', icon: 'shield', pill: '3' },
      ]},
    ],
    org: [
      { label: 'Insights', items: [
        { id: 'org-insights', label: 'Anonymous trends', href: 'org-insights.html', icon: 'chart' },
      ]},
    ],
  };
  const sections = navs[role] || navs.user;
  const navHtml = sections.map(sec => `
    <div class="nav-section">
      <div class="nav-section-label">${sec.label}</div>
      ${sec.items.map(it => `
        <a class="nav-item ${it.id === active ? 'active' : ''}" href="${it.href}">
          <span class="ico">${icon(it.icon, 16)}</span>
          <span>${it.label}</span>
          ${it.pill ? `<span class="pill">${it.pill}</span>` : ''}
        </a>
      `).join('')}
    </div>
  `).join('');

  return `
    <div class="sidebar-brand">
      <div class="brand-mark"></div>
      <div class="brand-word">Wise Care<small>Care Navigation</small></div>
    </div>
    ${navHtml}
    <div class="sidebar-foot">
      <div class="nav-section-label" style="padding: 0 4px 4px;">Demo role</div>
      <div class="role-switch" role="tablist" aria-label="Demo role">
        ${Object.entries(ROLES).map(([k, v]) => `
          <button class="${role === k ? 'active' : ''}" data-role="${k}" type="button">${v.label}</button>
        `).join('')}
      </div>
      <a href="landing.html" class="nav-item" style="font-size: 12.5px; color: var(--muted);">
        <span class="ico">${icon('back', 14)}</span> Back to landing
      </a>
    </div>
  `;
}

function mountAppShell({ active, title, crumbs = [], actions = '' }) {
  const sidebar = document.querySelector('[data-sidebar]');
  if (sidebar) sidebar.innerHTML = renderSidebar(active);

  const topbarTitle = document.querySelector('[data-topbar-title]');
  if (topbarTitle) topbarTitle.textContent = title;

  const crumbWrap = document.querySelector('[data-crumbs]');
  if (crumbWrap && crumbs.length) {
    crumbWrap.innerHTML = crumbs.map((c, i) => i === crumbs.length - 1
      ? `<span style="color: var(--fg-soft);">${c}</span>`
      : `<a href="#" style="color: var(--muted);">${c}</a><span class="sep">›</span>`
    ).join('');
  }

  const actionWrap = document.querySelector('[data-actions]');
  if (actionWrap) actionWrap.innerHTML = actions;

  /* Role switcher */
  document.querySelectorAll('.role-switch button').forEach(btn => {
    btn.addEventListener('click', () => setRole(btn.dataset.role));
  });

  /* Mobile menu */
  const menuBtn = document.querySelector('[data-menu]');
  const scrim = document.querySelector('[data-scrim]');
  const sidebarEl = document.querySelector('.sidebar');
  if (menuBtn && sidebarEl && scrim) {
    menuBtn.addEventListener('click', () => {
      sidebarEl.classList.add('open');
      scrim.classList.add('open');
    });
    scrim.addEventListener('click', () => {
      sidebarEl.classList.remove('open');
      scrim.classList.remove('open');
    });
  }
}

/* App shell HTML skeleton */
function appShellHTML(content) {
  return `
    <div class="mobile-bar">
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="brand-mark"></div>
        <div class="brand-word" style="font-size: 0.95rem;">Wise Care</div>
      </div>
      <button class="mobile-menu-btn" data-menu aria-label="Menu">${icon('menu', 18)}</button>
    </div>
    <div class="sidebar-scrim" data-scrim></div>
    <div class="app">
      <aside class="sidebar" data-sidebar></aside>
      <main class="main">
        <header class="topbar">
          <div>
            <div class="topbar-crumbs" data-crumbs></div>
            <div class="topbar-title" data-topbar-title></div>
          </div>
          <div class="topbar-actions" data-actions></div>
        </header>
        <div class="workspace">
          ${content}
        </div>
      </main>
    </div>
  `;
}
