# MVP Thinking: Designing the Wise Care Prototype

The goal of the Wise Care MVP is to validate a core product hypothesis: **Can structuring a user's intake details into a clear care route and shareable packet increase the speed and completion rate of provider connections?**

To validate this hypothesis efficiently, the MVP focuses on key high-impact features built on a secure cloud-first database:

## 1. Core Workflow Prioritization
Rather than a simple local mockup, the MVP establishes a full-stack, multi-role flow through five critical stages:
1. **Calm Structured Intake:** Replaces open-ended chatbot widgets with a predictable multi-step form to reduce user cognitive load.
2. **Deterministic Safety Guard:** Runs an instant, local regex/keyword safety check before calling the LLM, ensuring high-risk users are redirected to hotlines immediately.
3. **Structured Care Route:** Uses Gemini to output strict JSON schemas mapping out goals, barriers, and next steps in cautious language.
4. **Targeted Provider Matching:** Scores providers registered directly in Firestore using a transparent matching engine (state, modality, insurance, and specialties).
5. **Care Packet & Direct Connection:** Generates a pre-written outreach message and structured intake brief (SOAP-style layout) to minimize outreach anxiety and send referrals directly to providers.

## 2. Platform Architecture & Data Integrity
The Wise Care prototype implements a production-focused full-stack strategy:
- **Firebase Auth Accounts:** Provides real signup, authentication, and session boundaries for Patients, Solo Providers, Clinic Organizations, and Platform Administrators.
- **Firestore Database Persistence:** All intake details, matched results, referrals, live messaging, and support plans are written and queried dynamically from Cloud Firestore.
- **Firestore Provider Records:** Providers and clinics register their detailed directory profiles directly in Firestore.
- **Provider Credential Evidence:** Enables solo clinicians and clinic representatives to upload credential documents, business licenses, and logo/photos.
- **Admin Verification Workflow:** Administrators utilize a real review dashboard to verify provider credentials, moving their status from pending to verified, rejected, or request info.
- **Matching from Verified Firestore Providers:** The directory search only surfaces and computes scores for verified provider records stored in Firestore.
- **Local Storage / Developer Fallback Mode:** To ensure out-of-the-box testability, the system includes a fallback layer. If Firebase environment keys are missing, the application redirects database reads/writes to browser `localStorage` and serves local static template matches for AI generations.

## 3. Gemini AI Workflow Architecture
We prioritized two core server-side AI integrations:
- **Care Route Generation (`/api/ai/care-route`):** Translates free-text concerns and structured metrics into an actionable, non-diagnostic pathway.
- **Care Packet Generation (`/api/ai/care-packet`):** Structures raw user inputs into a structured intake brief (SOAP-style layout) and draft email outreach.

If the Gemini API key is missing, the server falls back to matching local mock routing templates so the application remains fully testable without environment credentials.
