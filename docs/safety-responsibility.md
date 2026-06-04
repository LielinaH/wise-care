# Safety & Responsibility Guide: Wise Care Platform

Because Wise Care deals with mental health care access, safety is built directly into our product architecture, clinical guardrails, and user experience. 

Wise Care is **not an AI therapist, clinic, or diagnostic service.** Our role is administrative navigation, preparation, and connection.

---

## 1. Multi-Layer Safety Architecture

### Layer A: Deterministic Safety Guard (Local Code)
Before sending user free-text inputs to any Large Language Model, the application runs a local, deterministic regex-based keyword scanner (`lib/ai/safety.ts`).

The safety system distinguishes between different levels of safety concerns:
* **Immediate Crisis Triggers:**
  - **Keywords:** `suicide`, `suicidal`, `self-harm`, `harm myself`, `kill myself`, `end my life`, `want to die`, `cut myself`, `harm others`, `kill them`, `overdose`, `hang myself`, `shoot myself`, `immediate danger`, `emergency`.
  - **Action:** If triggered, the API route immediately bypasses LLM text generation and returns a hardcoded **Crisis Route**. This prevents prompt injections, hallucinations, or model delays.
  - **User Interface:** The UI immediately redirects to the 988 and 911 helpline resource cards as the primary call to action.
* **Broader Risk & Clinical/Support Language:**
  - **Keywords:** `abuse`, `abusing`, `abused`, and references to historical trauma or non-crisis support queries.
  - **Action:** In demo mode or general matching, these trigger safety logs or custom matching logic (e.g., directing to specialized providers for trauma/abuse support), but do not bypass the flow entirely unless accompanied by active self-harm/crisis markers.

### Layer B: LLM Guardrails & Formatting Rules
When calling the Gemini API for standard care routing, the system prompts contain strict clinical rules:
- **No Diagnoses:** The model is prohibited from labeling symptoms as disorders (e.g. saying "You have GAD").
- **No Medical Claims:** The model cannot promise clinical outcomes or recommend specific drugs/prescriptions.
- **Cautious Language:** The model must use tentative phrasing: *"based on what you shared," "may suggest," "might consider."*
- **No False Assurances:** The model must never tell the user "you are safe" or "everything is fine."
- **Professional Backup:** The model must always prompt the user to seek consultation with a licensed clinical professional.

### Layer C: Consent, Privacy & Prototype Boundaries
- **Consent Gate:** Sharing summaries and Care Packets with provider clinics requires an active consent checkbox tick. 
- **Employee Privacy:** Employer and university portal dashboards are restricted to aggregated, anonymized trends. Single patient files can never be viewed.
- **Prototype Warning:** This platform is a demonstration prototype. It is not HIPAA-compliant, and users must not upload real clinical credentials, NPI details, or actual health records.
