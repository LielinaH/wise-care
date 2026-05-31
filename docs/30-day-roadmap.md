# 30-Day Production Roadmap: Wise Care Platform

This roadmap details the next phase of engineering and clinical review needed to move the Wise Care prototype into a production-quality beta release.

---

## Week 1: Secure Infrastructure & Authentication
### Goal: Replace prototype state with secure, HIPAA-compliant storage and auth.
- **NextAuth.js Integration:** Implement secure login for Users (patients) and Providers (clinicians) using multi-factor authentication (MFA).
- **HIPAA-Compliant Database:** Set up PostgreSQL on an encrypted, HIPAA-compliant hosting provider (e.g., Aptible, AWS RDS with KMS encryption).
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
- **Eligibility Clearinghouse API:** Integrate with services like **Candid Health** or **Change Healthcare** to check live member coverage status.
- **Deductible Tracker:** Query the deductible progress of in-network patients to calculate the exact co-pay and out-of-pocket fees per session.
- **Sliding Scale Calculator:** Build a verified upload portal for paystubs or tax returns to automatically calculate sliding scale eligibility thresholds.

---

## Week 4: Multi-Channel Outreach Automation
### Goal: Automate clinician outreach and tracking.
- **Secure Email Forwarding:** Use HIPAA-compliant secure email servers (e.g., LuxSci, Mailgun HIPAA) to send outreach emails directly to clinic inbox addresses.
- **Direct EHR Integration:** Build endpoints pushing intake summaries directly to common EHRs (e.g. Athenahealth, SimplePractice) if a clinic has integrated our widget.
- **Dynamic Follow-Up Scheduler:** Integrate push notifications or text-message check-ins (via Twilio HIPAA account) to query patient progress 7 days post-connection.
