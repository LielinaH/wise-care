# Wise Care — AI-Powered Mental Health Access Platform

Wise Care is a fictional AI-powered mental health access and care-navigation platform for the U.S. market. It helps individuals move from *"I need help but don’t know where to start"* to a tailored care route, matched support options, provider connection, preparation packets, and follow-up tracking.

This project is rebuilt from a static Open Design HTML/CSS prototype into a production-quality full-stack Next.js application using React, TypeScript, Tailwind CSS, and the Gemini API.

> **Important Safety Copy**  
> *“Wise Care does not diagnose, provide therapy, prescribe medication, or replace a licensed professional.”*  
> *“If you may be in immediate danger or thinking about harming yourself, contact emergency services or a crisis hotline immediately (call/text 988, or call 911).”*

---

## 1. Project Framing & Product Thesis

### The Access Bottleneck
The mental healthcare challenge in the U.S. is not merely a supply shortage of clinicians. Access is highly fragmented and hindered by cost opacity, wait time latency, state-specific licensing limits, insurance confusion, stigma, and the administrative anxiety of first-time clinician outreach.

### Our Solution
Wise Care operates as a pure **navigation and preparation layer** between recognizing a distress signal and attending a first session. It provides:
1. A quiet, structured intake form (never a chat box).
2. A deterministic crisis safety check.
3. An algorithmic Care Route outlining barriers and next steps.
4. Transparent matching against state, cost, and specialty slots.
5. A clinician-ready **Care Packet** briefing and outreach template.

---

## 2. Platform Features & Demo Roles

To test the multi-sided platform workflow, a **Demo Role Switcher** is included in the sidebar navigation:
- **User Dashboard (`/dashboard`):** Guides patients through Intake, AI Processing, Care Route results, Provider Matching, Care Packet previews, and Connection Requests.
- **Provider Portal (`/provider/dashboard`):** Allows clinician groups to complete directory listings and review incoming patient Care Packets inside the **Referral Inbox** (`/provider/inbox`).
- **Admin Dashboard (`/admin/dashboard`):** Allows administrators to inspect directory health, manage the provider credentials verification queue, and monitor high-risk safety alerts.
- **Organization Insights (`/organization/insights`):** Displays anonymized, aggregate metrics for enterprise/university partners (common access barriers, route distribution) with strict privacy disclaimers.

---

## 3. Server-Side AI Workflows (Gemini API)

Wise Care implements three server-side generative workflows powered by the `@google/genai` SDK:

1. **Care Route AI Workflow (`POST /api/ai/care-route`):** Runs a deterministic safety check. If clean, triggers Gemini with strict JSON schemas to outline risks, recommended pathways, care goals, and next steps in cautious language (*"may," "could," "consider"*).
2. **Care Packet AI Workflow (`POST /api/ai/care-packet`):** Structures answers and routes into a clinical brief (timeline, impact, materials checklist) and a copyable email outreach draft.
3. **Follow-Up AI Workflow (`POST /api/ai/follow-up`):** Analyzes post-referral roadblocks (cost, wait times, anxiety) to suggest next best action steps.

### Safe Fallback Mode
If `GEMINI_API_KEY` is not configured, the endpoints gracefully fall back to structured local mock templates and display a banner:  
`Using fallback AI response because Gemini is not configured.`  
This ensures the prototype remains fully testable in all environments.

---

## 4. Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first variable configurations)
- **Icons:** Lucide React
- **Forms:** React Hook Form
- **AI SDK:** `@google/genai`
- **Validation:** Zod
- **Persistence:** Local Storage (for SSR-safe mock database synchronization)

---

## 5. Folder Structure

```
wise-care/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── care-packet/route.ts
│   │   │   ├── care-route/route.ts
│   │   │   └── follow-up/route.ts
│   │   └── ...
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   └── verify/page.tsx
│   ├── provider/
│   │   ├── dashboard/page.tsx
│   │   ├── inbox/page.tsx
│   │   └── register/page.tsx
│   ├── organization/
│   │   └── insights/page.tsx
│   ├── signin/page.tsx
│   ├── dashboard/page.tsx
│   ├── intake/page.tsx
│   ├── ai-processing/page.tsx
│   ├── care-route/page.tsx
│   ├── matching/page.tsx
│   ├── care-packet/page.tsx
│   ├── connection-request/page.tsx
│   ├── follow-up/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   └── DemoRoleSwitcher.tsx
│   └── wise-care/
│       └── FallbackBanner.tsx
├── docs/
│   ├── problem-framing.md
│   ├── mvp-thinking.md
│   ├── business-case.md
│   ├── safety-responsibility.md
│   └── 30-day-roadmap.md
├── lib/
│   ├── ai/
│   │   ├── gemini.ts
│   │   ├── prompts.ts
│   │   ├── safety.ts
│   │   └── schemas.ts
│   ├── data/
│   │   ├── mockProviders.ts
│   │   ├── mockResources.ts
│   │   └── mockReferrals.ts
│   ├── matching/
│   │   └── matchProviders.ts
│   ├── storage.ts
│   └── types.ts
├── tests/
│   └── test.ts
└── README.md
```

---

## 6. Setup & Execution

### Prerequisites
- Node.js 20 or later

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API key:
   ```env
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

3. Run automated tests:
   ```bash
   npx tsx tests/test.ts
   ```

4. Launch local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Interactive Demo Flow

1. **User Landing:** Go to the home page, read the safety copy, and click **Start care navigation**.
2. **Mock Log In:** Select **Individual Seeking Care**.
3. **Caseload Check-in:** Click **Begin private intake** on your dashboard.
4. **Crisis Check:** Fill out Step 4. If you select **Immediate concern**, notice the page automatically swaps to prioritize 988 emergency lifelines.
5. **Route Analysis:** Fill out standard options and click submit. Review the animated progress steps.
6. **Review Route:** Read the AI-generated care recommendations, reasoning summary, and care goals. Click **Match support**.
7. ** Algorithmic Matches:** Inspect scored synthetic clinics. Click **Save to plan** on a therapist, then click **Connect**.
8. **Direct outreach:** Custom-edit the outreach message, agree to the consent checkbox, and click **Send connection request**.
9. **Caseload Propagation:** Toggle the **Demo Role Switcher** to **Provider** in the sidebar. Visit the **Referral Inbox** and see the referral you just submitted listed in the queue!
10. **Admin & Partner Views:** Switch to **Admin** to approve directories, or **Org** to view anonymized barrier charts updating dynamically.
