# 30-Day Production Roadmap: Wise Care Platform

This roadmap details the next phase of engineering and clinical/legal review needed to move the Wise Care prototype into a production-quality beta release.

---

## Week 1: Secure Infrastructure & Authentication
### Goal: Establish data security policies and initiate a HIPAA-readiness review.
- **Multi-Factor Authentication (MFA):** Implement secure MFA login for Patients and Providers.
- **Secure Data Infrastructure:** Set up PostgreSQL on an encrypted cloud host (e.g., Aptible, AWS RDS with KMS encryption) and prepare for a production security review.
- **Clinician NPI Verification:** Integrate with the **NPPES Registry API** to automatically search NPI numbers during provider registration to verify active clinical status.

---

## Week 2: Real Directory Integration & Geolocation
### Goal: Transition from synthetic data to real-world search mappings.
- **Provider Registry API Integration:** Partner with outpatient networks or pull data from open directories (e.g. OpenPath, SAMHSA locator APIs).
- **Google Maps API:** Implement radius and zip code searches so users can filter in-person matches by physical distance.
- **State-by-State Registry Verification:** Hook into state licensure board validation scripts to cross-reference telehealth providers' active statuses.

---

## Week 3: Real-Time Insurance & Benefit Verification
### Goal: Provide transparency on out-of-pocket costs and deductibles.
- **Eligibility Clearinghouse API:** Integrate with services like **Candid Health** or **Change Healthcare** to check live member coverage status (subject to clinical/legal review).
- **Deductible Tracker:** Query the deductible progress of in-network patients to calculate the exact co-pay and out-of-pocket fees per session.
- **Sliding Scale Calculator:** Build a verified upload portal for paystubs or tax returns to automatically calculate sliding scale eligibility thresholds (subject to BAA/vendor review of attachments).

---

## Week 4: Multi-Channel Outreach Automation
### Goal: Automate clinician outreach and tracking under secure channels.
- **Secure Email Forwarding:** Set up communication channels using providers approved under BAA/vendor review constraints to send outreach emails directly to clinic inbox addresses.
- **Direct EHR Integration:** Build endpoints pushing intake summaries directly to common EHRs (e.g. Athenahealth, SimplePractice) if a clinic has integrated our widget (contingent on successful clinical/legal review).
- **Dynamic Follow-Up Scheduler:** Integrate push notifications or text-message check-ins (via Twilio under a signed Business Associate Agreement) to query patient progress 7 days post-connection.
