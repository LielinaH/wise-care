# Wise Care - AI-Powered Mental Health Access & Care Navigation

Wise Care is a fictional AI-powered mental health access and care-navigation platform for the U.S. market. It helps individuals move from *"I need help but don’t know where to start"* to a tailored care route, matched support options, provider connection, preparation packets, and follow-up tracking.

This platform has been converted from a client-side mock demo into a full-stack Next.js application backed by **Firebase Authentication** and **Cloud Firestore**, with server-side AI processing via the **Gemini API**.

> **[!WARNING]**
> **PROTOTYPE LIMITATIONS & SAFETY WARNING**  
> * This is a demo prototype. Do not enter real medical or personal health information (PHI).  
> * Wise Care does not claim HIPAA compliance, perform real clinician credential verification, handle real emergency responses, verify real insurance coverage, or store production-grade medical records.  
> * Wise Care does not diagnose, provide therapy, prescribe medication, or replace a licensed professional.  
> * If you may be in immediate danger or thinking about harming yourself, contact emergency services or a crisis hotline immediately (call/text 988, or call 911).

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

## 2. Platform Architecture & Data Persistence

Wise Care supports two modes:
1. **Live Firebase Mode**: Uses Firebase Authentication and Cloud Firestore for persistence, with Gemini API routes processing server-side.
2. **Fallback Developer Mode**: If environment variables are missing, the application automatically falls back to `localStorage` for state management and local mock templates for AI generation, showing a warning banner.

### Account Roles
The application uses four distinct, secure user roles:
* `patient`: Individuals seeking care navigation, intake check-ins, care packets, and referrals.
* `solo_provider`: Individual clinicians managing availability, licensing details, and receiving referrals.
* `provider_org`: Clinical organizations, group practices, or clinics receiving referrals.
* `admin`: Operators managing system health, monitoring high-risk alerts, and reviewing provider credentials.

### Firestore Collections
The Firestore schema consists of the following collections:

1. **`users`**
   * Document path: `/users/{uid}`
   * Fields: `uid`, `email`, `displayName`, `role` (one of the 4 roles above), `onboardingComplete`, `createdAt`, `updatedAt`
2. **`patients`**
   * Document path: `/patients/{uid}`
   * Fields: `userId`, `displayName`, `intakeStatus` (`not_started` | `started` | `completed`), `activeCareRouteId`, `activeCarePacketId`, `activeReferralId`, `intakeAnswers` (JSON map of answers), `savedProviderIds` (array of strings), `createdAt`, `updatedAt`
3. **`soloProviders`**
   * Document path: `/soloProviders/{uid}`
   * Fields: `userId`, `displayName`, `licenseType`, `licenseState`, `licenseNumberPlaceholder`, `specialties` (array), `modalities` (array), `coverageOptions` (array), `availability`, `verificationStatus` (`draft` | `pending` | `verified` | `rejected`), `createdAt`, `updatedAt`
4. **`providerOrganizations`**
   * Document path: `/providerOrganizations/{orgId}`
   * Fields: `orgId`, `ownerUserId`, `organizationName`, `organizationType`, `verificationStatus`, `services` (array), `specialties` (array), `modalities` (array), `coverageOptions` (array), `locations` (array), `availability`, `createdAt`, `updatedAt`
5. **`careRoutes`**
   * Document path: `/careRoutes/{routeId}`
   * Fields: `patientId`, `riskLevel`, `recommendedRoute`, `recommendedSupportTypes` (array), `reasoningSummary`, `detectedBarriers` (array), `careGoals` (array), `nextSteps` (array), `matchingCriteria` (JSON), `safetyMessage`, `isFallback` (boolean), `createdAt`, `updatedAt`
6. **`carePackets`**
   * Document path: `/carePackets/{packetId}`
   * Fields: `patientId`, `careRouteId`, `mainConcerns` (array), `timeline`, `dailyLifeImpact` (array), `careGoals` (array), `questionsToAskProvider` (array), `materialsToPrepare` (array), `insurancePaymentNotes` (array), `suggestedOutreachMessage`, `shareableSummary`, `nextStepChecklist` (array), `selectedFields` (map of flags), `isFallback` (boolean), `createdAt`, `updatedAt`
7. **`referrals`**
   * Document path: `/referrals/{referralId}`
   * Fields: `patientId`, `patientDisplayName`, `providerType` (`solo_provider` | `provider_org`), `providerId`, `providerName`, `carePacketId`, `careRouteId`, `status` (`pending` | `accepted` | `waitlisted` | `declined` | `request_info` | `withdrawn`), `providerMessage` (optional), `createdAt`, `updatedAt`
8. **`followUps`**
   * Document path: `/followUps/{followUpId}`
   * Fields: `patientId`, `referralId`, `contactedProvider` (boolean), `scheduledAppointment` (boolean), `blocker`, `recommendedAdjustment`, `nextBestActions` (array), `createdAt`
9. **`providerVerificationRequests`**
   * Document path: `/providerVerificationRequests/{requestId}`
   * Fields: `providerType`, `providerId`, `submittedBy`, `status` (`pending` | `approved` | `rejected` | `request_info`), `notes`, `createdAt`, `updatedAt`

---

## 3. Server-Side AI Workflows (Gemini API)

Wise Care implements three server-side generative workflows powered by the `@google/genai` SDK:

1. **Care Route AI Workflow (`POST /api/ai/care-route`):** Runs a deterministic safety check. If clean, triggers Gemini with strict JSON schemas to outline risks, recommended pathways, care goals, and next steps in cautious language (*"may," "could," "consider"*).
2. **Care Packet AI Workflow (`POST /api/ai/care-packet`):** Structures answers and routes into a clinical brief (timeline, impact, materials checklist) and a copyable email outreach draft.
3. **Follow-Up AI Workflow (`POST /api/ai/follow-up`):** Analyzes post-referral roadblocks (cost, wait times, anxiety) to suggest next best action steps.

### Authentication Token Handling
To secure generative endpoints, client-side scripts request a Firebase ID token (`currentUser.getIdToken()`) and attach it as a Bearer token in the request header:
```
Authorization: Bearer <firebase_id_token>
```
The API routes parse and log this header. At the prototype level, this verifies the boundary for secure authenticated writes.

---

## 4. Setup & Execution

### Prerequisites
* Node.js 20 or later

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables by copying the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Modify `.env.local` to fill out your details:
   ```env
   # Live Gemini API Key configuration
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash

   # Firebase configuration parameters
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. Setup Firestore Security Rules:
   Deploy the `firestore.rules` file to your Firebase Project to secure your database collections:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. Launch local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Demo Account Setup & Interactive Testing

### Demo Accounts in Fallback Mode
If Firebase configurations are missing, you can test the entire loop by using the following simulated logins (no password required, email prefix triggers role):
* **Patient**: `patient.demo@wisecare.test`
* **Solo Clinician**: `clinician.demo@wisecare.test`
* **Group Practice / Org**: `clinic.demo@wisecare.test`
* **Platform Admin**: `admin.demo@wisecare.test`

### Setup Demo Admin Account in Firebase Mode
Registration for the `admin` role is secured to prevent unauthorized access.
1. Sign up a new user via the regular registration page (`/auth/register`).
2. Open your Firebase Console and go to the **Firestore Database** tab.
3. Locate the `users` collection, select the document corresponding to your newly registered user's `uid`, and edit the `role` field value to `"admin"`.
4. The user is now recognized as a Platform Admin, allowing them to access the Admin dashboards.

---

## 6. What is Working vs. Simulated

### Fully Working Features
* **Firebase Authentication**: Sign up and sign in using Firebase Auth with secure client validation.
* **Role-Based Routing**: Redirections keep patients, providers, and admins in their respective areas.
* **Intake & Route Storage**: Answers are stored in Firestore, Gemini API generates care routes, and they are saved back to Firestore linked to the patient profile.
* **Clinician Matchmaking**: Direct queries filter clinicians by licensing states, specialties, and insurance options.
* **Referral Management**: Sent connection requests are persisted as referral documents. Clinicians view incoming referrals in real time and can accept, waitlist, or decline them.
* **Admin Verification panel**: Administrators can review pending credentials, check licensing parameters, and approve or reject clinical directory listings.

### Simulated Elements
* **Clinician Directory**: Seeding is populated with synthetic clinicians for demonstration purposes.
* **Outreach Communications**: Clicking "Send connection request" creates a record in Cloud Firestore for the provider's inbox, but does not send physical emails or integrate with EHR systems.
* **Verification Checks**: The checklist inside the admin verification page is manually checked by the admin and simulated rather than pulling from official state regulatory databases.
