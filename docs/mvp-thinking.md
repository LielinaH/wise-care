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

## 2. Technical Scope & Architecture
- **Firebase-First Architecture:** The core platform leverages Firebase Auth for user management, Cloud Firestore for multi-role profile persistence (patients, solo providers, clinics, admins), and Firebase Storage for uploading and managing verification credentials.
- **Developer Fallback Mode:** To ensure evaluators can run the full flow out-of-the-box without requiring active Firebase credentials or Gemini API keys, the system includes a **Developer Fallback Mode**. If environment keys are missing, the system gracefully shifts state management to browser `localStorage` and falls back to local template matches for AI generations, displaying a persistent banner.
- **Unified Testing Environment:** Rather than deploying separate sites for patients, clinicians, clinic administrators, and platform admins, the prototype features an interactive **Role Switcher** in the sidebar. This allows developers to simulate multi-role behaviors (e.g. a patient submitting a referral, switching roles to clinic organization, and accepting the referral) dynamically.
- **Synthetic Directory Seeding:** We seed the Firestore database with a diverse set of synthetic provider records representing standard clinical archetypes (Private practice, psychiatric evaluation, support group, community clinic, crisis hotline) to test deterministic and AI matching criteria.

## 3. Gemini AI Workflow Architecture
We prioritized two core server-side AI integrations:
- **Care Route Generation (`/api/ai/care-route`):** Translates free-text concerns and structured metrics into an actionable, non-diagnostic pathway.
- **Care Packet Generation (`/api/ai/care-packet`):** Structures the raw user input into a clinical summary and draft email outreach.

If the Gemini API key is missing, the server falls back to matching local mock routing templates so the application remains fully testable without environment credentials.
