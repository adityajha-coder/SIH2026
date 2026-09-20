# Technical Evaluator Architecture and Authorization Guide

> **Platform Designation:** Sovereign Innovation Sandbox & Agile Public Procurement Gateway  
> **Role Code:** `EVALUATOR`  
> **Target Jurisdiction:** Government of Maharashtra (MSInS / Dept. of Skills, Employment, Entrepreneurship & Innovation)  
> **Statutory Foundations:** GFR 2017 Rule 173(i) • Maharashtra Startup Policy 2024 • IT Act 2000 • CERT-In Guidelines  
> **Parent Documentation:** [README.md](../README.md) • [Technical Architecture (Technical.md)](../Technical.md) • [Security Architecture (Security.md)](../Security.md)

---

## 1. Role Overview and Persona

The **Technical Evaluator** (`EVALUATOR`) role represents accredited academic faculty (e.g., IIT Bombay, VJTI, COEP), senior R&D scientists, certified public procurement validators, and independent technical domain specialists.

The Evaluator is tasked with conducting rigorous, double-blind technical assessments of startup proposals submitted against department civic challenges. Evaluators operate under strict statutory recusal mandates, score submissions against standardized 4-pillar rubrics, and deliver objective, evidence-backed evaluations without brand bias or commercial influence.

---

## 2. Authentication, Authorization & Session Security

### 2.1 Identity and Dual-Token Lifecycle
* **Authentication Method:** Secure local credential verification (Argon2/Bcrypt with high cost factor) or federated institutional SSO.
* **In-Memory Dual-Token Pattern:**
  * **Short-Lived Access Token (15 minutes):** Kept strictly in JavaScript closure memory inside React's `AuthContext`. It is never written to `localStorage` or `sessionStorage`, immunizing against Cross-Site Scripting (XSS) token theft.
  * **Long-Lived Refresh Token (7 days):** Issued as a cryptographically signed `HttpOnly`, `Secure`, `SameSite=Strict` cookie bound to an active database session.
  * **Refresh Token Rotation (RTR):** Every token refresh generates a new refresh token and stores its SHA-256 digest in MongoDB (`refreshTokenHash`), invalidating stale tokens.
  * **Immediate Session Revocation:** Any password change, administrator suspension, or session revocation takes effect instantly via `sessionModel` lookup in `requireAuth`.
* **Account Status Guard:** Evaluator accounts must have `status: "ACTIVE"`. Suspended or inactive accounts are rejected with `403 ACCOUNT_SUSPENDED`.

### 2.2 Strict Assignment Authorization Scoping (PBAC)
Evaluators possess strictly scoped capabilities under the platform's permission matrix:

| Resource | Operation | Permission Gate | Scope / Constraints |
|---|---|---|---|
| **Evaluator Profile** | Read / Update | Self | Academic designation, department taxonomy, institutional affiliation. |
| **Assigned Queue** | Read | `requireRole("EVALUATOR")` | Filtered strictly to proposals where `evaluatorId === actor._id`. |
| **COI Protocol** | Submit Recusal | Self (Assigned) | Statutory requirement; locks dossier upon recusal (`ASSIGNMENT_RECUSED`). |
| **Technical Dossier** | Read (Masked) | `requireRole("EVALUATOR")` | Double-blind masked dossier (`ANON-VENTURE-XXXX`); corporate branding stripped. |
| **Evidence Vault** | Download Stream | `requireRole("EVALUATOR")` | Direct-to-S3 presigned GET URLs with 30-minute TTL and SHA-256 integrity check. |
| **Evaluation Scorecard** | Submit Scores | `evaluation:score` | Scored against 4-pillar rubric; locks permanently upon submission (`ALREADY_SCORED`). |
| **Peer Evaluator Scores**| Read | **Forbidden** | Blind isolation; evaluators cannot view scores from other reviewers on the same dossier. |
| **Commercial Terms** | Read | **Forbidden** | Financial balance sheets and EMD exemption records are handled upstream. |

---

## 3. Evaluator Workflow & State Machine

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                EVALUATOR LIFECYCLE & STATE GUARDS                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│  [ 1. ALLOCATION ] ─────────> Nodal officer assigns proposal via evaluationAssignmentModel      │
│          │                                                                                       │
│          ▼                                                                                       │
│  [ 2. ASSIGNED QUEUE ] ────> Evaluator reviews anonymous summary & rubric criteria              │
│          │                                                                                       │
│          ├──────────────────────────────────────────────────────────┐                            │
│          ▼ Potential conflict identified                            ▼ No conflict declared       │
│  ┌───────────────┐                                          ┌───────────────┐                    │
│  │ COI RECUSAL   │                                          │ COI AFFIRMED  │                    │
│  │ State: RECUSED│                                          │ Dossier Unlocks                    │
│  └───────┬───────┘                                          └───────┬───────┘                    │
│          │                                                          │                            │
│          ▼ Proposal returned to pool for reassignment               ▼                            │
│                                                             ┌───────────────┐                    │
│                                                             │ DOUBLE-BLIND  │                    │
│                                                             │ EXAMINATION   │                    │
│                                                             └───────┬───────┘                    │
│                                                                     │                            │
│                                                                     ▼                            │
│                                                             ┌───────────────┐                    │
│                                                             │ 4-PILLAR      │                    │
│                                                             │ SCORING (100) │                    │
│                                                             └───────┬───────┘                    │
│                                                                     │                            │
│                                                                     ▼                            │
│                                                             ┌───────────────┐                    │
│                                                             │ SCORECARD     │                    │
│                                                             │ SEALED & LOCK │                    │
│                                                             │ (COMPLETED)   │                    │
│                                                             └───────────────┘                    │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Statutory Conflict-of-Interest (COI) Recusal Gate
Prior to accessing detailed engineering blueprints or telemetry logs, the evaluator must execute a statutory non-conflict declaration:
* **Affirmation:** *"I solemnly affirm that I hold no equity, advisory, consulting, familial, or prior employment relationship with the applicant venture under GFR 2017 Rule 173(i)."*
* **Recusal:** *"I declare a potential conflict of interest and recuse myself from evaluating this proposal."*
* Submitting a recusal automatically sets `assignment.status = "RECUSED"`, writes an event to `AuditEvent`, and returns the dossier to the department pool.

---

## 4. Double-Blind Anonymization & Evidence Vault

### 4.1 Synthetic Identity Scrubbing (`ANON-VENTURE-XXXX`)
To ensure total meritocracy:
* Company legal names, GSTINs, DPIIT entity numbers, founder names, and corporate email domains are stripped.
* Proposals are identified solely by synthetic tokens (e.g., `ANON-VENTURE-8921`).
* Proprietary algorithms, system block diagrams, and hardware benchmarks are evaluated strictly on engineering viability.

### 4.2 Evidence Vault Cryptographic Verification
* Engineering schematics, lab test certificates, and architecture blueprints are retrieved directly from cloud storage via presigned URLs (30-minute expiry).
* The client application validates the cryptographic **SHA-256 checksum** against the immutable hash recorded during submission upload (`evidence.checksumSHA256`).
* Prevents post-submission evidence tampering or unauthorized document substitution.

---

## 5. Standardized 4-Pillar Evaluation Rubric (100 Points)

Evaluations are graded against the statutory **GFR 173(i) Technical Merit Rubric**:

```
┌──────────────────────────────────────────────────────────────┬──────────────┬─────────────┐
│ Evaluation Pillar                                            │ Max Score    │ Weight      │
├──────────────────────────────────────────────────────────────┼──────────────┼─────────────┤
│ 1. Technical Architecture & Viability                        │ 25 Points    │ 35% (0.35)  │
│    • Codebase maturity, compute throughput, latency SLA      │              │             │
│    • Maharashtra State Data Centre (SDC) compatibility       │              │             │
├──────────────────────────────────────────────────────────────┼──────────────┼─────────────┤
│ 2. Departmental KPI Alignment                                │ 25 Points    │ 25% (0.25)  │
│    • Direct efficacy in solving the civic problem statement  │              │             │
│    • Quantifiable benchmark outcomes (<14% water loss, etc.) │              │             │
├──────────────────────────────────────────────────────────────┼──────────────┼─────────────┤
│ 3. Pilot Feasibility & 90-Day Sandbox Readiness              │ 25 Points    │ 25% (0.25)  │
│    • Operational readiness for 90-day field deployment       │              │             │
│    • Zero dependency on extensive legacy retrofit            │              │             │
├──────────────────────────────────────────────────────────────┼──────────────┼─────────────┤
│ 4. Sovereignty, Security & CERT-In Compliance                │ 25 Points    │ 15% (0.15)  │
│    • Data localization within India (DPDP Act 2023)          │              │             │
│    • Zero proprietary cloud lock-in & CERT-In audit readiness│              │             │
├──────────────────────────────────────────────────────────────┼──────────────┼─────────────┤
│ TOTAL STATUTORY SCORE                                        │ 100 Points   │ 1.00 (100%) │
└──────────────────────────────────────────────────────────────┴──────────────┴─────────────┘
```

### 5.1 Clamping & Idempotency Safeguards
* **Score Clamping:** The backend enforces that no criterion score exceeds its declared `maxScore` (`SCORE_EXCEEDS_MAX`).
* **Weighted Aggregate Computation:**
  $$\text{WeightedScore} = \sum_{i=1}^{n} \left( \frac{\text{Score}_i}{\text{MaxScore}_i} \times \text{Weight}_i \right)$$
* **Idempotency Lock:** Once scores are committed, `assignment.status` transitions to `COMPLETED`. Any subsequent POST attempt returns `400 ALREADY_SCORED`.

---

## 6. Multi-Model AI Consensus Cross-Audit

While human evaluators maintain statutory decision-making authority, the platform provides an independent **AI Consensus Cross-Audit** generated by the background AI cascade (Gemini 3.6 Flash + Groq LLaMA-3.3 70B):
* Evaluates technical consistency between claims made in the abstract and telemetry data attached in the Evidence Vault.
* Highlights potential architectural red flags, unaddressed edge cases, or unrealistic latency claims.
* Formatted strictly as **advisory decision support**; the AI cannot reject or approve proposals.

---

## 7. API Reference for Evaluators

All endpoints require `Authorization: Bearer <AccessToken>`:

| Method | Route | Description | Guard / Permission |
|---|---|---|---|
| `GET` | `/v1/evaluations/assignments` | List all assigned evaluation dossiers | `requireRole("EVALUATOR")` |
| `GET` | `/v1/evaluations/templates/:problemId` | Fetch rubric criteria & weights | `requireRole("EVALUATOR")` |
| `POST` | `/v1/evaluations/assignments/:id/recuse` | Submit statutory COI recusal | `requireRole("EVALUATOR")` (Assigned) |
| `POST` | `/v1/evaluations/scores` | Submit finalized rubric score & narrative | `requirePermission("evaluation:score")` |
| `GET` | `/v1/evidence/:id` | Obtain 30-min presigned GET download URL | `requireAuth` (Scoped) |

---

## 8. Forensic Auditability & Compliance Checklist

* ✅ **Double-Blind Integrity:** Corporate legal names, GSTINs, and founders are completely masked from evaluator screens.
* ✅ **Immutable Audit Trail:** Evaluator login, dossier views, document downloads, recusal events, and score commits are permanently logged to `AuditEvent` with IP, timestamp, and UUIDv4 `traceId`.
* ✅ **Statutory Recusal Enforcement:** Recusal requests cannot be reversed; assignment immediately returns to department pool.
* ✅ **Tamper-Evident Scorecards:** Submitted scores are permanently bound to `DecisionRecord` and cannot be mutated.
