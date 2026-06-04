# Wise Care: AI-Powered Mental Health Access & Care Navigation

> [!WARNING]
> **Prototype Boundaries & Safety Disclaimer:** This is a demo prototype. It is not HIPAA-compliant, not a medical device, not a therapy service, and not a real credential verification system. Do not enter real medical, legal, credential, or personal health information.

Wise Care is a Firebase-backed full-stack care-navigation and patient preparation prototype designed for the U.S. healthcare market. It acts as an administrative and preparation bridge between an individual recognizing their need for mental health support and attending their first clinical consultation.

The platform is built using a modern full-stack architecture:
* **Next.js App Router** for seamless server-client rendering and routing.
* **Firebase Authentication** for secure user login and role-based access.
* **Cloud Firestore** for real-time document-oriented data persistence.
* **Firebase Storage** for provider profile photo, clinic logo, and credential uploads (with developer fallback).
* **Gemini API** on the server-side to generate non-diagnostic care navigation plans and clinician pre-briefs.
* **Firestore-based provider matching** via a deterministic scoring engine (and optional AI matching).
* **Admin provider verification workflow** to review, verify, or request info on provider registrations.

This platform is structured to solve the entry pipeline bottleneck of U.S. healthcare by transforming raw patient intakes into actionable, non-diagnostic Care Routes and clinician-ready Care Packets, reducing waitlists, billing opacity, and outreach anxiety.

---

## 1. Problem Framing & Healthcare System Constraints

### The Entry Pipeline Bottleneck
The primary barrier in U.S. mental health care is commonly assumed to be a shortage of licensed clinicians. While clinician supply is a constraint, a deeper and more immediate challenge is the high friction of the **access pipeline**. Individuals looking for care must navigate several complex systemic barriers:

1. **Search & Directory Friction:** Patients encounter outdated provider directories, opaque medical terminology (e.g., differentiatingTalk Therapy, Psychiatry, Intensive Outpatient, and Peer Support), and a lack of clear starting points. The cognitive load of finding an available clinician licensed in their state frequently stalls care-seeking behavior.
2. **Financial & Insurance Opacity:** Mental health billing is complex. Patients struggle to verify in-network coverage, deductibles, copays, and sliding-scale eligibility. Fear of unexpected out-of-network bills delays care.
3. **Supply-Demand Latency (Wait Times):** The wait time for a first appointment with a licensed therapist averages 3 to 6 weeks. During this critical window, patients are left without guided support, resulting in high drop-off rates.
4. **Geographic & State Licensure Restraints:** U.S. healthcare regulations restrict telehealth services to states where the clinician is actively licensed. Directories rarely filter this dynamically, leading to frustrating dead ends.
5. **Outreach Anxiety:** Drafting emails and repeating sensitive clinical histories to intake coordinators is a massive hurdle for individuals experiencing acute anxiety or burnout.

### The Wise Care Solution
Wise Care operates as a pure **navigation and preparation layer** that does not diagnose, prescribe, or provide therapy. Instead, it guides the patient through:
* **Calm Structured Intake:** A quiet, non-conversational form that captures clinical and administrative details without chat fatigue.
* **Deterministic Safety Gate:** An immediate keyword-based safety scanner to route high-risk users to crisis hotlines before invoking LLMs.
* **Structured Care Routes:** Algorithmic next steps, barrier recognition, and matching criteria generated using Large Language Models with strict JSON schemas.
* **Clinician-Ready Care Packets:** Automatically compiling symptoms, history, and goals into a professional brief and outreach email, reducing intake administrative time.

---

## 2. Business Case & Value Proposition

Wise Care resolves systemic frictions for multiple stakeholders within the healthcare ecosystem:

```
               ┌──────────────────────────────────────────┐
               │                WISE CARE                 │
               └────┬──────────────────┬──────────────┬───┘
                    │                  │              │
                    ▼                  ▼              ▼
         ┌────────────────────┐ ┌─────────────┐ ┌─────────────┐
         │ Patients/Consumers │ │  Clinicians │ │ Payers/Orgs │
         └────────────────────┘ └─────────────┘ └─────────────┘
          - Reduced Anxiety      - Pre-briefed   - Reduced ER
          - Cost Transparency      Intakes       - Higher EAP
          - Direct Referrals     - Lower Admin     Engagement
```

### Stakeholder Value Matrix
* **Patients:** Reduces search fatigue, demystifies insurance, and generates clear, copy-pasteable outreach messages, shortening the time-to-care.
* **Clinicians & Group Practices:** Delivers pre-prepared intake briefs (SOAP-style layout) containing timelines, daily impact, and goals. This reduces clinician administrative burden, decreases intake drop-off, and increases slot utilization.
* **Employers & Universities:** Offers a private, structured entry point for employees/students seeking support, boosting Employee Assistance Program (EAP) utilization and reducing absenteeism.
* **Insurers & Public Payers:** Guides members to appropriate in-network care paths before symptoms escalate, reducing expensive emergency room utilization.

### Ethical Monetization Policy
Wise Care enforces a strict **privacy-first data policy**. User health data, search parameters, or diagnostic briefs are never sold, shared, or monetized for advertising. Revenue is generated via:
1. **Enterprise B2B SaaS (PMPM):** Employers and universities pay a flat Per-Member-Per-Month fee to offer Wise Care as a white-labeled access portal.
2. **Provider Integration Software:** Clinical networks pay a subscription to integrate Wise Care referrals directly into their Electronic Health Records (EHR) systems.
3. **Payer Outcomes Pilots:** Insurers pay outcome-based fees for successful navigation pathways that redirect members from emergency care to outpatient counseling.

---

## 3. Core MVP Strategy & Production Architecture

Wise Care is engineered around a secure, Firebase-backed full-stack architecture to validate the care navigation workflow:

* **No Conversational Chatbots:** The platform deliberately avoids open-ended chat inputs, instead utilizing structured forms to capture symptom intensity, daily impact, and state licensure variables cleanly and predictably.
* **Full-Stack Firebase Integration:** The core production architecture is built upon:
  * **Firebase Authentication:** Handles secure user authentication, signup, and login workflows.
  * **Cloud Firestore:** Persists multi-role account profiles, intake results, referrals, chat logs, and support plans.
  * **Firebase Storage:** Uploads and hosts provider credential documents, licenses, profile photos, and organization logos.
* **Server-Side API Routes:** Connects frontend inputs securely to the server-side Gemini API client for structured, cautious plan generation.
* **Firestore-Based Directory Matching:** Queries active provider documents directly from Firestore, applying location, modality, insurance, and specialty weights to compute deterministic compatibility scores.
* **Administrative Credentials Queue:** Features a robust provider verification dashboard allowing platform administrators to review upload evidence and manage verification statuses.
* **Integrated Stakeholder Roles:** To allow testing across all interfaces (Patient, Provider, Organization, Admin) within a single browser session, the sidebar includes an interactive **Role Switcher** that changes roles dynamically (syncing state in Firestore or localStorage depending on the active mode).
* **Synthetic Directory Seeding:** Populated with diverse provider archetypes (Private practice, psychiatric evaluation, support group, community clinic, crisis hotline) stored in Firestore to test matching behaviors without scraping real registries.

---

## 4. Account Model & Role Permissions

Wise Care structures user access around four primary roles, defining specific workflows and boundaries:

### A. Patient
* **Access Control:** Log in via Firebase Auth.
* **Capabilities:**
  * Complete a structured intake form.
  * Receive an AI-generated non-diagnostic Care Route and clinician-ready Care Packet.
  * Search and match with verified providers.
  * Submit referrals to providers.
  * Track referral statuses (Pending, Accepted, Waitlisted, Declined).
  * Direct chat messaging with accepted providers.
  * Track assigned Support Plans (complete tasks, view resources).

### B. Solo Provider (Clinician)
* **Access Control:** Log in via Firebase Auth.
* **Capabilities:**
  * Build a professional clinical profile.
  * Upload license cards/documents for verification.
  * Receive, review, and manage patient referrals (Accept, Waitlist, Decline).
  * Access patient Care Packets (SOAP briefs, symptoms, timelines).
  * Create, edit, and share personalized Support Plans (tasks, readings, log files).
  * Real-time chat messaging with referred patients.

### C. Provider Organization (Clinic/Group Practice)
* **Access Control:** Log in via Firebase Auth.
* **Capabilities:**
  * Create organization-level profiles.
  * Upload business licenses, accreditation files, and company logos.
  * Manage services, modalities, languages, and specialties offered.
  * View and route incoming referrals sent to the organization.

### D. Admin (Platform Administrator)
* **Access Control:** Configured by setting `role` to `"admin"` in the Firestore `users` collection.
* **Capabilities:**
  * Access the administrative dashboard.
  * View list of all system users.
  * Review registration verification requests from Solo Providers and Provider Organizations.
  * Approve, reject, or request information on credentials (which updates their verification status).
  * Enable/disable user accounts.

---

## 5. Platform Architecture, Firestore Schema & Firebase Storage

The platform uses Next.js (App Router), styled with clean vanilla CSS, and uses Firebase Authentication, Cloud Firestore, and Firebase Storage.

```
┌────────────────────────────────────────────────────────┐
│                      Next.js Frontend                  │
│   (Intake, Matching, Provider Portal, Admin Panel)     │
└───────────────┬──────────────────────────────┬─────────┘
                │ Secure Token                 │ DB Read/Write & Storage
                ▼                              ▼
┌──────────────────────────────┐       ┌───────────────────────┐
│        Next.js API           │       │    Firebase Suite     │
│  - JWT Logger Header         ├──────►│ - Cloud Firestore     │
│  - Deterministic Safety Guard│       │ - Firebase Storage    │
│  - Gemini API Client         │       │ - Firebase Auth       │
└──────────────────────────────┘       └───────────────────────┘
```

### Firestore Collection Schema

#### 1. `users`
* **Path:** `/users/{uid}`
* **Role:** Global role mapping and account status.
* **Schema:**
  ```typescript
  interface UserRecord {
    uid: string;
    email: string;
    displayName: string;
    role: 'patient' | 'provider_org' | 'solo_provider' | 'admin';
    onboardingComplete: boolean;
    disabled?: boolean;
    createdAt: any;
    updatedAt: any;
  }
  ```

#### 2. `patients`
* **Path:** `/patients/{uid}`
* **Role:** Stores intake answers and active care route/packet pointer references.
* **Schema:**
  ```typescript
  interface PatientProfile {
    userId: string;
    displayName: string;
    intakeStatus: 'not_started' | 'started' | 'completed';
    activeCareRouteId: string | null;
    activeCarePacketId: string | null;
    activeReferralId: string | null;
    intakeAnswers?: IntakeAnswers;
    savedProviderIds?: string[];
    createdAt: any;
    updatedAt: any;
  }
  ```

#### 3. `soloProviders`
* **Path:** `/soloProviders/{uid}`
* **Role:** Solo clinician profile details, licensure records, references, and verification status.
* **Schema:**
  ```typescript
  interface SoloProviderProfile {
    userId: string;
    profile?: {
      displayName: string;
      providerTitle: string;
      bio: string;
      profilePhoto: FileMetadata | null;
      contactEmail: string;
      contactPhone: string;
    };
    licensure?: {
      licenseType: string;
      licenseNumberPlaceholder: string;
      licenseState: string;
      licenseExpirationDate: string;
      licenseDocument: FileMetadata | null;
      npiPlaceholder?: string;
      telehealthStates: string[];
    };
    careDetails?: {
      specialties: string[];
      modalities: string[];
      acceptedCoverageOptions: string[];
      selfPayRate: string;
      slidingScaleAvailable: boolean;
      languages: string[];
      availability: string;
    };
    references?: {
      reference1Name: string;
      reference1Relationship: string;
      reference1Email: string;
      reference1Phone?: string;
      reference1Status: 'not_sent' | 'requested' | 'received';
      reference2Name: string;
      reference2Relationship: string;
      reference2Email: string;
      reference2Phone?: string;
      reference2Status: 'not_sent' | 'requested' | 'received';
    };
    verification?: VerificationInfo;
    createdAt: any;
    updatedAt: any;
  }
  ```

#### 4. `providerOrganizations`
* **Path:** `/providerOrganizations/{orgId}`
* **Role:** Organization profiles, credentials, service details, and verification status.
* **Schema:**
  ```typescript
  interface ProviderOrgProfile {
    orgId: string;
    ownerUserId: string;
    organizationProfile?: {
      organizationName: string;
      organizationType: 'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org';
      organizationBio: string;
      logo: FileMetadata | null;
      primaryContactName: string;
      primaryContactEmail: string;
      primaryContactPhone: string;
      website?: string;
    };
    credentialInfo?: {
      businessLicensePlaceholder: string;
      licenseState: string;
      accreditationPlaceholder?: string;
      credentialDocument: FileMetadata | null;
    };
    serviceDetails?: {
      servicesOffered: string[];
      specialties: string[];
      modalities: string[];
      locations: string[];
      acceptedCoverageOptions: string[];
      slidingScaleAvailable: boolean;
      availability: string;
      clinicianCount: number;
    };
    references?: {
      reference1Name: string;
      reference1Relationship: string;
      reference1Email: string;
      reference1Status: 'not_sent' | 'requested' | 'received';
      reference2Name: string;
      reference2Relationship: string;
      reference2Email: string;
      reference2Status: 'not_sent' | 'requested' | 'received';
    };
    verification?: VerificationInfo;
    createdAt: any;
    updatedAt: any;
  }
  ```

#### 5. `careRoutes`
* **Path:** `/careRoutes/{routeId}`
* **Role:** Stores the AI-generated care pathway, barriers, and matching criteria.

#### 6. `carePackets`
* **Path:** `/carePackets/{packetId}`
* **Role:** SOAP-style intake summaries, daily life impact lists, and outreach drafts.

#### 7. `referrals`
* **Path:** `/referrals/{referralId}`
* **Role:** Connects patients to providers and tracks invitation workflows.
* **Subcollection `messages` (`/referrals/{referralId}/messages/{messageId}`):** Stores the direct chat transcript between patient and provider.

#### 8. `supportPlans`
* **Path:** `/supportPlans/{planId}`
* **Role:** Active clinical homework tasks and resources shared by providers with active patients.

#### 9. `followUps`
* **Path:** `/followUps/{followUpId}`
* **Role:** Captures blocker data if a patient struggles to attend appointments.

#### 10. `providerVerificationRequests`
* **Path:** `/providerVerificationRequests/{requestId}`
* **Role:** Backing log collection storing details of submitted provider applications for administrative review.

### Firebase Storage Integration & File Metadata

Firebase Storage is utilized to upload and serve provider profile assets and verification documents. Uploaded files are represented in Firestore collections via a nested `FileMetadata` structure:

```typescript
interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  demoOnly: boolean;
  storagePath: string | null;
  downloadURL: string | null;
}
```

The system manages the following file uploads:
* **profilePhoto:** Uploaded by solo providers.
* **organizationLogo:** Uploaded by provider organizations.
* **licenseDocument:** Uploaded by solo providers to verify credentials.
* **credentialDocument:** Uploaded by clinics to prove business standing.

> [!IMPORTANT]
> **Demo Upload Warning:** In demo mode (when Firebase environment variables are not configured), uploads generate mock metadata with `demoOnly: true` and null storage paths. Users should not upload real medical, legal, or personal credential documents to the demo version.

### Storage Security Rules (`storage.rules`)

Secure access to uploaded provider assets is enforced via `storage.rules`:
* **Public Reads:** Allowed for profile photos (`photo`) and clinic logos (`logo`) to let anyone view active directories.
* **Restricted Reads/Writes:** Licensure files (`licensure`) and credential documents (`credential`) are private. Only the owner of the document (matching `request.auth.uid`) or platform administrators can read or write these files.

---

## 6. What is Real vs. Simulated

The platform maintains a clear boundary between real functional features and simulated workflows:

### Real Features (Implemented)
* **Firebase Authentication:** Real signup, login, session state, and role-based permissions.
* **Firestore Data Persistence:** Real saving, querying, and updating of intake forms, provider profiles, referrals, chat messages, support plans, and follow-up reviews.
* **Firebase Storage Upload Flow:** Real file upload to Cloud Storage bucket (if configured).
* **Gemini Server-Side Generation:** Real server-side extraction and navigation-plan synthesis using the Gemini API.
* **Provider Profile Submission:** Real submission of credential details and document attachments.
* **Admin Review Workflow:** Real admin-facing credential review page to approve/reject provider roles.
* **Referral Status Updates:** Real-time transition of referral invites (Pending, Accepted, Waitlisted, Declined).

### Simulated / Mock Features
* **Real Clinical Care:** The platform is a navigation guide and does not provide clinical therapy or treatment.
* **Real Credential Verification:** Admin review is a simulation workflow; the platform does not check licenses against real state databases or federal registries.
* **Real Emergency Response:** The safety scanner redirects users to crisis hotlines but does not dispatch emergency services.
* **Real Insurance Verification:** Copay and benefit details are calculated based on prototype simulation parameters rather than direct clearinghouse check APIs.
* **Real EHR Integration:** Referral profiles are not exported to actual clinic Electronic Health Records software.
* **HIPAA Compliance:** The system is a prototype and does not support regulatory HIPAA-compliant data storage.

### Feature Implementation Matrix
* **Firebase Authentication & Firestore:** Fully Implemented.
* **Firebase Storage Upload:** Implemented with graceful fallback (generates mock metadata if storage credentials are missing).
* **Admin Provider Verification:** Fully Implemented.
* **Firestore-based Provider Matching:** Fully Implemented.
* **Firebase Admin Token Verification:** Planned / Prototype Fallback (server routes log Bearer headers but bypass cryptographic verification in this pass).

---

## 7. Server-Side AI Workflows (Gemini API)

Wise Care integrates the `@google/genai` SDK to run server-side generative pipelines. To guarantee reliability, all Gemini calls utilize strict JSON schemas to guarantee return object types.

### Core Generative Endpoints

1. **Care Route AI Workflow (`POST /api/ai/care-route`):** 
   Processes the patient's intake form. It runs a deterministic safety check first. If clean, it invokes Gemini with `careRouteResponseSchema` to outline risks, recommended pathways, care goals, and next steps using clinical-cautious language (*"may," "could," "consider"*).
2. **Care Packet AI Workflow (`POST /api/ai/care-packet`):**
   Gathers raw patient concerns, timelines, and impact metrics and converts them into a formatted PDF-ready brief (timeline, impact details, insurance notes) and a structured email draft.
3. **Follow-Up AI Workflow (`POST /api/ai/follow-up`):**
   Triggered if a patient fails to connect with their matched provider. Analyzes obstacles (e.g., cost, wait times, outreach anxiety) and outputs secondary adjustments and alternative options.

### Security Boundary: JWT Authentication Token Handling
To secure the backend AI endpoints from abuse, frontend fetch scripts request a Firebase ID token:
```javascript
const token = await auth.currentUser.getIdToken(true);
```
This is transmitted in the request headers:
```http
Authorization: Bearer <firebase_id_token>
```
The server-side API routes parse and log this Bearer token (verification is currently mock/prototype-level in this pass, with full Admin cryptographic verification planned).

---

## 8. Meaningful AI vs. Decorative Chatbots

```
DECORATIVE AI CHATBOTS                MEANINGFUL AI PIPELINES
┌────────────────────────┐            ┌────────────────────────┐
│  "Hello! How are you   │            │  Structured Form Data  │
│   feeling today?"      │            └───────────┬────────────┘
└───────────┬────────────┘                        │ Strict JSON Schema
            │ Unstructured                        ▼
            ▼ Text Input              ┌────────────────────────┐
┌────────────────────────┐            │   Gemini Processing    │
│  Generates Conversational           └───────────┬────────────┘
│  Paragraphs (High Risk)│                        │
└────────────────────────┘                        ▼
                                      ┌────────────────────────┐
                                      │ SOAP-style Briefs      │
                                      │ Outreach Email Draft   │
                                      └────────────────────────┘
```

A common pattern in digital health is deploying open-ended conversational chatbots (e.g., "tell me how you feel"). This design pattern fails in healthcare due to:
* **High Cognitive Load:** Patients in distress struggle to formulate detailed prompt histories.
* **Safety Risks:** Chatbots are prone to hallucinating medical advice or failing to capture hidden crisis triggers.
* **Clinician Friction:** Paragraphs of text generated by an AI chatbot do not save clinicians time during intake.

### How Wise Care is Different
Wise Care uses AI as an **invisible, structured back-end utility**:
1. **Inputs are Structured:** Patients select checkboxes for symptoms, intensity, and duration, ensuring clear data boundaries.
2. **Deterministic Pre-Processing:** An algorithmic safety scanner inspects text before LLM access, guaranteeing safety.
3. **Outputs are Structured & Actionable:** Gemini is restricted to returning JSON schema objects. Instead of generating conversational filler, it builds copyable outreach templates and SOAP summaries, solving real administrative workflows.

---

## 9. 30-Day Production Roadmap

To transition this prototype toward a production release, we propose the following 30-day engineering plan focused on clinical, legal, and compliance reviews:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           30-DAY ROADMAP                                │
├─────────────┬────────────────────────┬───────────────────┬──────────────┤
│   WEEK 1    │         WEEK 2         │      WEEK 3       │    WEEK 4    │
├─────────────┼────────────────────────┼───────────────────┼──────────────┤
│ BAA/Vendor  │ NPI API Verification   │ Candid Health API │ Twilio SMS & │
│ Review & MFA│ & Google Maps Geolocation│ Insurance Checks │ EHR Connect  │
└─────────────┴────────────────────────┴───────────────────┴──────────────┘
```

### Week 1: Secure Infrastructure, Auth & NPI Verification
* **Data Security & Privacy Audit:** Establish database encryption policies and initiate a HIPAA-readiness review.
* **Clinical/Legal Review:** Perform a full compliance review of authentication flows and data handling.
* **Multi-Factor Authentication (MFA):** Implement secure MFA for providers.
* **NPPES Registry API Integration:** Query the National Provider Identifier (NPI) Registry API during provider sign-up to verify licenses and active clinical standing.

### Week 2: Directory Integration & Geolocation Mapping
* **Real Directories:** Integrate SAMHSA and OpenPath APIs to feed real outpatient clinic data.
* **Google Maps API:** Add postal code radius sorting for patients seeking in-person care.
* **State Licensure Scraping:** Build automated verification check scripts targeting state licensing boards.

### Week 3: Real-Time Insurance & Benefit Verification
* **Eligibility Clearinghouse integration:** Connect to **Candid Health** or **Change Healthcare** APIs to verify insurance benefits, remaining deductibles, and co-pay amounts.
* **Sliding Scale Portal:** Implement secure document uploading to facilitate BAA/vendor review of third-party attachments.

### Week 4: Multi-Channel Communications & EHR Integration
* **Secure Email:** Set up communication channels using providers approved under BAA/vendor review constraints.
* **Direct EHR Integrations:** Implement API endpoints to sync care packets directly into common EHR platforms (clinical/legal review required before launch).
* **Twilio SMS Alerts:** Add automated patient follow-up checks via SMS utilizing a communications provider under a signed Business Associate Agreement (BAA).

---

## 10. Safety, Guardrails & Responsibility

### Three-Layer Safety Guard
* **Layer A (Deterministic Regex Scanner):** 
  If the intake contains keywords like `suicide`, `self-harm`, `harm myself`, or `overdose`, the application immediately skips the LLM and serves a hardcoded **Crisis Route** pointing to 988.
* **Layer B (Prompt-Level Rules):** 
  System instructions forbid Gemini from diagnosing conditions, recommending specific drugs, or offering false comfort (*"you are safe"*). It mandates tentative phrasing (*"may suggest," "might consider"*).
* **Layer C (Consent, Privacy & Prototype Boundaries):** 
  Clear scoping ensures patients understand that the tool acts as a navigation layout rather than a therapy substitute.

---

## 11. Setup, Execution & Interactive Testing

### Prerequisites
* Node.js 20 or later

### Installation & Firebase Configuration
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Provide your values in `.env.local`:
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
3. **Set up Firebase Storage:**
   - Open your Firebase Console, navigate to **Storage**, and click **Get Started** to enable the default storage bucket.
   - Install the Firebase CLI: `npm install -g firebase-tools`
   - Log in: `firebase login`
   - Select your project: `firebase use --add`
   - Deploy the Storage Security Rules:
     ```bash
     firebase deploy --only storage
     ```
4. **Deploy Firestore Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```
5. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!WARNING]
> **Demo Upload Security Boundary:** The file upload flow is intended strictly for prototype evidence checks (e.g. testing the UI of sending credentials to admins). Do not upload real legal, clinical license cards, or personal health records.

### Simulated Developer Accounts
In Developer Mode (missing environment configs), log in using these simulated emails (no password required):
* **Patient:** `patient.demo@wisecare.test`
* **Solo Clinician:** `clinician.demo@wisecare.test`
* **Clinic Org:** `clinic.demo@wisecare.test`
* **Admin:** `admin.demo@wisecare.test`

To configure a Platform Admin in Firebase Mode, register a user account normally, locate their UID in the Firestore Console, and change their `role` field value in the `users` collection to `"admin"`.

---

## 12. Recommended Demo Flow

To experience the full capabilities of the Wise Care platform, follow this ideal end-to-end demo walkthrough:

1. **Patient Authentication:**
   - Register or sign in as a Patient (`patient.demo@wisecare.test`).
2. **Structured Intake Form:**
   - Complete the multi-step questionnaire outlining symptoms, daily life impact, location, and insurance preferences.
3. **AI Care Route Generation:**
   - View the generated **Care Route** summarizing safety risk levels, barriers, recommended care modalities, and goals.
4. **Directory Matching:**
   - Search matched clinicians/organizations in the directory, seeing compatibility scores calculated directly from Firestore provider records.
5. **Care Packet Generation:**
   - Inspect the compiled **Care Packet** containing structured intake briefs (SOAP-style layout) and draft clinician outreach emails.
6. **Referral Submission:**
   - Select a provider and click "Connect" to submit a referral along with your Care Packet credentials.
7. **Provider Response & Management:**
   - Sign out and log in as a Provider (`clinician.demo@wisecare.test` or `clinic.demo@wisecare.test`).
   - Open your Inbox, inspect the referred patient brief, and select **Accept**, **Waitlist**, or **Decline** (which updates the referral status in real-time).
8. **Patient Connections Status Check:**
   - Sign back in as the Patient to view the connection status update. If accepted, you can chat with the provider and receive support plans.
9. **Admin Provider Verification:**
   - Sign in as a Platform Admin (`admin.demo@wisecare.test`).
   - Open the admin dashboard to review pending provider license documents, updating their verification status to **Verified**, **Rejected**, or **Request Info**.

---

## 13. Developer Fallback & Demonstration Mode

To ensure evaluators and developers can run the entire platform flow out-of-the-box without configuring live API keys or cloud resources, the application features an integrated local fallback system:

### A. Local Storage State Fallback
If Firebase environment variables are missing from `.env.local`, the application displays a persistent warning banner and automatically routes database operations to the browser's `localStorage`. This includes:
* Mock persistence of patient intake answers, care routes, and packets.
* Mock referrals inbox and status transitions.
* Mock messaging transcripts stored in local memory.

### B. Local AI Mock Generation
If the Gemini API key is missing, server-side routes return structured mockup responses matching the user's intake details, allowing full end-to-end testing of Care Routes, Packets, and Support Plans.

### C. Client-Side Demo Role Switcher
To facilitate multi-perspective evaluations in a single browser session, a client-side **Role Switcher** is embedded in the layout sidebar. Evaluators can instantly switch between Patient, Solo Clinician, Clinic Org, and Platform Admin roles to inspect how data updates across profiles (syncing to Firestore if configured, or `localStorage` in fallback mode).

### D. Synthetic Directory Seeding
A collection of diverse synthetic provider documents representing private therapists, clinics, support groups, and crisis services is seeded into the database (Firestore or local memory) to test compatibility scoring without scraping real directories.
