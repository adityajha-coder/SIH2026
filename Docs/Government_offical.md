# Government Official Architecture and Authorization Guide

> **Platform Designation:** Sovereign Innovation Sandbox & Agile Public Procurement Gateway  
> **Role Code:** `GOVERNMENT_USER`  
> **Target Jurisdiction:** Government of Maharashtra (MSInS / Dept. of Skills, Employment, Entrepreneurship & Innovation)  
> **Statutory Foundations:** GFR 2017 Rule 173(i) • Maharashtra Startup Policy 2024 (GR No. MAT-2024/CR-88/Ind-7) • MSMED Act 2006 Section 15 • GeM Special Gateway  
> **Parent Documentation:** [README.md](../README.md) • [Technical Architecture (Technical.md)](../Technical.md) • [Security Architecture (Security.md)](../Security.md)

---

## 1. Role Overview and Persona

The **Government Official** (`GOVERNMENT_USER`) represents authorized departmental nodal officers, municipal commissioners, mission directors, and public procurement desk officers across Maharashtra's 36 administrative districts.

The Government Official is empowered to:
1. **Formulate Outcome-Driven Civic Challenges:** Define quantifiable problem statements via the **Challenge Studio** with statutory GFR 173(i) exemption clauses.
2. **Discover Candidate Startups via Explainable AI:** Rapidly search and score startups across Maharashtra's innovation ecosystem based on a 4-pillar algorithmic matching engine.
3. **Govern Double-Blind Technical Evaluations:** Configure 4-pillar statutory rubrics and assign accredited evaluators from independent academic registries.
4. **Issue Statutory Sanction Orders & Compacts:** Formulate legally binding pilot compacts with milestone-based tranche disbursements (30% - 40% - 30%).
5. **Supervise 90-Day Regulatory Sandboxes:** Monitor live field pilots on the **Pilot Canvas**, review telemetry logs, and authorize milestone escrow releases within the statutory 30-day MSMED SLA.
6. **Scale Gate Transitions to GeM:** Issue final completion certificates and scale-up sanction orders for direct public procurement onboarding on the Government e-Marketplace (GeM).

---

## 2. Authentication, Authorization & Session Security

### 2.1 Identity and Dual-Token Lifecycle
* **Authentication Method:** Secure email/password login (Argon2/Bcrypt) or government single sign-on (SSO).
* **In-Memory Dual-Token Pattern:**
  * **Short-Lived Access Token (15 minutes):** Stored in JavaScript closure memory inside React `AuthContext` (`let currentAccessToken = null`). Never persisted in `localStorage` or `sessionStorage` (immunizing against XSS).
  * **Long-Lived Refresh Token (7 days):** Cryptographically signed HTTP-only cookie with `Secure`, `SameSite=Strict` attributes.
  * **Refresh Token Rotation (RTR):** Token refreshed silently with SHA-256 hashing stored in MongoDB `Session` records.
  * **Immediate Session Revocation:** Logout or administrative deactivation revokes the session immediately (`requireAuth` checks `session.revoked`).
* **Account Status Guard:** Accounts must be `status: "ACTIVE"`. Suspended accounts are immediately blocked with `403 ACCOUNT_SUSPENDED`.

### 2.2 Departmental Authorization Matrix (PBAC)

| Resource | Operation | Permission Constant | Scope & Constraints |
|---|---|---|---|
| **Department Profile** | Read / Update | `requireRole("GOVERNMENT_USER")` | Scoped strictly to the officer's affiliated nodal department. |
| **Challenge Statement** | Create / Update | `problem:create`, `problem:update` | Draft and edit challenge statements; budget and district scoping. |
| **Challenge Publication** | Publish Live | `problem:publish` | Transitions challenge from `DRAFT` to `PUBLISHED` on public catalog. |
| **Rubric Configuration** | Create / Update | `problem:create` | Configures weighted scoring criteria (4 statutory pillars, 100 points). |
| **Candidate Submissions** | Read / Review | `submission:view`, `submission:review` | Scoped to submissions received under the department's challenges. |
| **Clarification Cycles** | Issue Queries | `submission:review` | Issues formal technical clarification requests to applicant startups. |
| **Evaluator Allocation** | Assign / Reassign | `requireRole("GOVERNMENT_USER")` | Assigns accredited independent evaluators under double-blind protocols. |
| **Statutory Sanction** | Issue Decision | `evaluation:decide` | Issues formal `ACCEPTED` or `REJECTED` Sanction Orders and compacts. |
| **Milestone Disbursement**| Verify & Release | `requireRole("GOVERNMENT_USER")` | Approves milestone telemetry and triggers escrow tranche disbursement. |

---

## 3. End-to-End Departmental Procurement Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DEPARTMENTAL PROCUREMENT PIPELINE                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│  [ 1. CHALLENGE STUDIO ]                                                                         │
│   • Formulate civic challenge (Target baseline vs desired KPI outcome)                          │
│   • 0-100 Challenge Readiness Meter validation                                                   │
│   • GFR Rule 173(i) 100% turnover & EMD exemption clauses declared                               │
│   • Sector tagging & 36 Maharashtra district GIS scoping                                         │
│               │                                                                                  │
│               ▼                                                                                  │
│  [ 2. CANDIDATE DISCOVERY & MATCHING ]                                                           │
│   • 4-Pillar Explainable AI Discovery (Sector 35%, Tech 35%, TRL 15%, DPIIT 15%)                │
│   • District-level startup identification across Tier-2/Tier-3 hubs                              │
│               │                                                                                  │
│               ▼                                                                                  │
│  [ 3. DOUBLE-BLIND EVALUATOR ALLOCATION ]                                                        │
│   • Assign accredited academic/domain evaluators from registry                                   │
│   • Enforce statutory Conflict-of-Interest (COI) recusal protocols                               │
│   • Monitor 4-pillar scoring progress without unmasking startup corporate branding               │
│               │                                                                                  │
│               ▼                                                                                  │
│  [ 4. STATUTORY SANCTION ORDER & ESCROW DEPOSIT ]                                                │
│   • Formulate 90-day sandbox pilot compact                                                       │
│   • Lock 100% pilot grant corpus into Sovereign Treasury Escrow                                  │
│   • Tranche schedule established: 30% Inception, 40% Telemetry, 30% Scale Gate                   │
│               │                                                                                  │
│               ▼                                                                                  │
│  [ 5. PILOT CANVAS & 90-DAY SANDBOX GOVERNANCE ]                                                 │
│   • Review live field telemetry and milestone evidence                                          │
│   • Authorize tranche releases within statutory 30-day MSMED Act SLA                             │
│   • Scale Gate Sanction Order issued for direct GeM catalog onboarding                           │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Functional Modules

### 4.1 Department Command Center (`/government/dashboard`)
* **Executive Procurement KPI Cards:**
  * Active Published Challenges vs Drafts.
  * Candidate Proposals Received.
  * Proposals Under Double-Blind Review.
  * Live 90-Day Sandboxes under Supervision.
* **Sector Focus & District GIS Telemetry:**
  * Distribution across GovTech, Clean Water, Agriculture, Smart Mobility, and Healthcare.
  * 36-district interactive map showing trial locations across Maharashtra.
* **Proposal Pipeline Donut & Action Queues:**
  * Real-time lifecycle distribution: `SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `PILOT_ACTIVE`, `PILOT_COMPLETED`.
  * One-click navigation to Challenge Studio, Rubric Builder, and Candidate Review Desk.

### 4.2 Challenge Studio (`/government/challenges/new`)
* **0-100 Readiness Meter:** Dynamic heuristic meter validating completeness of problem definition, measurable KPI targets, operational constraints, and budget clarity before publication.
* **Outcome-Based Formulation:** Mandates baseline vs target metrics (e.g., *Baseline: 38.5% water loss $\rightarrow$ Target: <14% across 12km trial zone*).
* **Statutory Exemption Directives:** Automatically injects standard statutory clauses invoking **GFR Rule 173(i)** and **Maharashtra Startup Policy 2024**, guaranteeing 100% exemption from prior turnover and EMD.

### 4.3 Explainable AI Candidate Discovery (`/government/challenges/:id/matching`)
* **4-Pillar Algorithmic Alignment:**
  $$\text{MatchScore} = (0.35 \times \text{Sector}) + (0.35 \times \text{TechCapability}) + (0.15 \times \text{TRL}) + (0.15 \times \text{DPIIT})$$
* **Natural Language Scrutiny Rationale:** The system generates plain-English explanations detailing why each startup fits the challenge and suggests pointed technical scrutiny questions for departmental review committees.
* **Democratizing Tier-2 & Tier-3 Ventures:** Eliminates urban bias by actively surfacing verified ventures from Nashik, Nagpur, Aurangabad, Kolhapur, and Solapur.

### 4.4 Pilot Canvas & 90-Day Regulatory Sandbox (`/pilots/:id`)
* **Milestone Telemetry Verification:** Startups stream real-world sensor logs and milestone evidence into the vault with SHA-256 integrity verification.
* **Statutory Tranche Schedule:**
  * **Phase 1 (Inception Advance - 30%):** Disbursed upon compact execution to fund sandbox mobilization.
  * **Phase 2 (Mid-Term Telemetry - 40%):** Disbursed upon successful field operational testing and telemetry validation.
  * **Phase 3 (Scale Gate - 30%):** Disbursed upon final independent audit and departmental acceptance.
* **Statutory 30-Day Payment SLA:** A BullMQ background cron sweeps active milestones daily. If an approved tranche remains unpaid after 30 days, escalation notifications are dispatched to the Directorate of Industries under Section 15 of the MSMED Act 2006.

---

## 5. API Reference for Government Nodal Officers

All endpoints require `Authorization: Bearer <AccessToken>`:

| Method | Route | Description | Guard / Permission |
|---|---|---|---|
| `GET` | `/v1/problems` | List challenges authored by the department | `requireRole("GOVERNMENT_USER")` |
| `POST` | `/v1/problems` | Create new civic challenge draft | `requirePermission("problem:create")` |
| `PUT` | `/v1/problems/:id` | Update challenge constraints & budget | `requirePermission("problem:update")` |
| `POST` | `/v1/problems/:id/publish` | Publish challenge live to public catalog | `requirePermission("problem:publish")` |
| `GET` | `/v1/submissions` | List proposals submitted against challenges | `requirePermission("submission:view")` |
| `POST` | `/v1/evaluations/assignments` | Assign evaluator under double-blind protocol | `requireRole("GOVERNMENT_USER")` |
| `POST` | `/v1/evaluations/decisions` | Issue statutory Sanction Order & compact | `requirePermission("evaluation:decide")` |
| `GET` | `/v1/ai/matching/:problemId` | Run Explainable AI candidate discovery | `requireRole("GOVERNMENT_USER")` |
| `POST` | `/v1/payments/escrow/release` | Authorize milestone escrow tranche release | `requireRole("GOVERNMENT_USER")` |

---

## 6. Security, Compliance & CAG Auditability

* ✅ **Departmental Tenancy Isolation:** Nodal officers cannot access, modify, or approve proposals belonging to other state departments.
* ✅ **GFR Rule 173(i) Enforcement:** The backend rejects any attempt to disqualify an applicant startup based on turnover or operational balance-sheet metrics.
* ✅ **CAG Audit-Ready Forensic Ledger:** Every sanction order, budget allocation, evaluator assignment, and payment authorization writes an immutable record to `AuditEvent` with actor identity, timestamp, IP, and SHA-256 entity fingerprint.
* ✅ **Direct GeM Scale Gate:** Successful 90-day sandbox pilots generate cryptographically sealed Sanction Orders accepted by the Government e-Marketplace (GeM) for streamlined direct public procurement.
