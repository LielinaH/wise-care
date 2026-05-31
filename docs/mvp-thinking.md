# MVP Thinking: Designing the Wise Care Prototype

The goal of the Wise Care MVP is to validate a core product hypothesis: **Can structuring a user's intake details into a clear care route and shareable packet increase the speed and completion rate of provider connections?**

To validate this hypothesis efficiently, the MVP focuses on key high-impact features while deferring heavier operational requirements to later releases.

## 1. Core Workflow Prioritization
Instead of trying to build a comprehensive clinical portal, the MVP focuses heavily on the user's journey through five critical stages:
1. **Calm Structured Intake:** Replaces open-ended chatbot widgets with a predictable multi-step form to reduce user cognitive load.
2. **Deterministic Safety Guard:** Runs an instant, local regex/keyword safety check on the client-side/server before calling the LLM, ensuring high-risk users are redirected to hotlines immediately.
3. **Structured Care Route:** Uses Gemini 2.0+ to output strict JSON schemas mapping out goals, barriers, and next steps in cautious language.
4. **Targeted Provider Matching:** Scores simulated providers using a lightweight, transparent matching engine rather than complex machine learning models.
5. **Care Packet & Direct Connection:** Generates a pre-written outreach message and briefing summary to minimize outreach anxiety.

## 2. Technical Compromises for Validation
- **Local Storage Persistence:** For a prototype, setting up a database (PostgreSQL/MongoDB) and authentication (Auth0/NextAuth) adds significant delay. We utilize browser `localStorage` to persist intake details, saved providers, and referrals. This allows simulated interactions (e.g. User submits connection -> Provider inbox updates) to function out-of-the-box.
- **Synthetic Directory Data:** Using real provider data requires scraping, API keys, or directory licensing. We seed the prototype with a diverse set of synthetic clinics representing standard archetypes (Private practice, psychiatric evaluation, support group, community clinic, crisis hotline) to test matching behaviors.
- **Mock Portals for Stakeholders:** Instead of creating separate deployment targets for Providers, Admins, and Organizations, we include a demo role switcher in the sidebar layout. This allows stakeholders to inspect how data aggregates across different portals instantly within a single session.

## 3. Gemini AI Workflow Architecture
We prioritized two core server-side AI integrations:
- **Care Route Generation (`/api/ai/care-route`):** Translates free-text concerns and structured metrics into an actionable, non-diagnostic pathway.
- **Care Packet Generation (`/api/ai/care-packet`):** Structures the raw user input into a clinical summary and draft email outreach.

If the Gemini API key is missing, the server falls back to matching local mock routing templates so the application remains fully testable without environment credentials.
