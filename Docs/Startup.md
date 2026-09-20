# Startup Architecture and Authorization Guide

> **Platform Designation:** Sovereign Innovation Sandbox & Agile Public Procurement Gateway  
> **Role Code:** `STARTUP_USER`  
> **Target Jurisdiction:** Government of Maharashtra (MSInS / Dept. of Skills, Employment, Entrepreneurship & Innovation)  
> **Statutory Foundations:** GFR 2017 Rule 173(i) • Maharashtra Startup Policy 2024 • MSMED Act 2006 Section 15 • DPDP Act 2023  
> **Parent Documentation:** [README.md](../README.md) • [Technical Architecture (Technical.md)](../Technical.md) • [Security Architecture (Security.md)](../Security.md)

---

## 1. Role Overview and Persona

The **Startup** (`STARTUP_USER`) role represents verified deep-tech founders, innovative MSMEs, and technology ventures seeking to deploy civic innovations in partnership with Government of Maharashtra departments.

Pragati-GovX dismantles the legacy public procurement barrier for startups by providing:
1. **Statutory 100% GFR 173(i) Waivers:** Elimination of prior audited turnover requirements, prior government execution criteria, and Earnest Money Deposits (EMD).
2. **Double-Blind Impartiality:** Automatic scrubbing of corporate branding and founder identities during evaluation, allowing early-stage ventures to compete purely on engineering merit.
3. **Memory-Safe Direct S3 Evidence Vault:** Cryptographic in-browser SHA-256 upload verification for technical schematics, lab test certificates, and telemetry data.
4. **90-Day Sovereign Sandbox Compacts:** Controlled, legally protected field deployments with milestone-based tranche disbursements (30% - 40% - 30%).
5. **Statutory 30-Day Payment SLA Enforcement:** Automated MSMED Act 2006 Section 15 milestone payment tracking, preventing cash-flow insolvency caused by bureaucratic payment delays.
6. **Direct GeM Procurement Scale Gate:** Conversion of successful sandbox trials into direct government procurement contracts on the Government e-Marketplace.
7. **Startup Mitra AI Concierge:** Real-time conversational legal and public procurement advisor grounded in Indian statutory frameworks (GFR 170/173(i), MSMED Act 2006, GeM, SIPP), official government reference links, and guided Pragati-GovX platform shortcuts.

---

## 2. Authentication, Authorization & Session Security

### 2.1 Identity and In-Memory Dual-Token Pattern
* **Primary Authentication:** Local credentials (Argon2/Bcrypt with high work factor) or OAuth 2.0 institutional login.
* **In-Memory Access Token Architecture (XSS Defense):**
  * The short-lived access token (15-minute lifespan) is stored **strictly in JavaScript closure memory** via React `AuthContext`.
  * **Zero Browser Storage:** It is never persisted to `localStorage` or `sessionStorage`, completely immunizing the user against malicious third-party script token exfiltration.
* **Rotated Refresh Token (CSRF Defense):**
  * Issued as a cryptographically signed cookie with `HttpOnly`, `Secure`, and `SameSite=Strict` flags.
  * **Refresh Token Rotation (RTR):** Each refresh request invalidates the previous token and records the SHA-256 digest of the new token in MongoDB (`refreshTokenHash`).
* **Axios Mutex & Silent Refresh Queue:**
  * When an access token expires (HTTP 401), the frontend Axios response interceptor intercepts the failure, holds subsequent concurrent requests in a queue, executes silent refresh via `/v1/auth/refresh-token`, updates the in-memory token, and transparently replays the queued requests.

### 2.2 Startup Authorization Matrix (PBAC)

| Resource | Operation | Permission Gate | Scope / Constraints |
|---|---|---|---|
| **User Profile** | Read / Update | Self | Contact information, security settings, password changes. |
| **Startup Passport** | Read / Update | `requireRole("STARTUP_USER")` | Scoped strictly to the startup's registered organization ID. |
| **Public Challenges** | Read / Search | `problem:view` | Full access to open challenges, GIS district boundaries, and KPIs. |
| **Proposal Submissions**| Create | `submission:create` | Permitted only on active published challenges (one proposal per challenge). |
| **Proposal Submissions**| Read / Track | `submission:view` | Scoped strictly to proposals authored by the startup's organization. |
| **Evidence Vault** | Presigned Upload | `requireRole("STARTUP_USER")` | Direct S3 streaming; 25MB limit; client-side SHA-256 checksum binding. |
| **Pilot Canvas** | Telemetry Stream | `requireRole("STARTUP_USER")` | Active sandboxes awarded to the startup; milestone telemetry submission. |
| **Startup Mitra Concierge** | Chat Query | `requireRole("STARTUP_USER", "ADMIN")` | Real-time legal & platform Q&A via `/v1/ai/legal-chat`; validated via `legalQuerySchema`. |
| **Evaluator Data** | Read | **Forbidden** | Double-blind isolation; evaluator identities and internal scoring are shielded. |
| **Competitor Proposals**| Read | **Forbidden** | Multi-tenant isolation; competitor submissions are strictly inaccessible. |

---

## 3. Proposal Lifecycle: Canonical 7-Stage FSM

Startup proposals proceed through a strictly governed 7-stage **Finite State Machine (FSM)** enforced in `server/services/submission/transitionGuard.js`:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             STARTUP PROPOSAL 7-STAGE FSM LIFECYCLE                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│  [ 1. DRAFT ] ────────────────────> Proposal drafted locally in Application Wizard               │
│          │                                                                                       │
│          ▼ Validated & Signed                                                                    │
│  [ 2. SUBMITTED ] ────────────────> Immutable proposal sealed with SHA-256 evidence digests      │
│          │                                                                                       │
│          ▼ Evaluator Assigned                                                                    │
│  [ 3. UNDER_REVIEW ] ─────────────> Double-blind 4-pillar technical evaluation (ANON-VENTURE)   │
│          │                                                                                       │
│          ├────────────────────────────────┬───────────────────────────────┐                      │
│          ▼ Rejected                       ▼ Clarification required        ▼ Accepted             │
│  ┌───────────────┐              ┌───────────────────┐           ┌───────────────────┐            │
│  │ 4a. REJECTED  │              │ Clarification     │           │ 4b. ACCEPTED      │            │
│  │ (Statutory    │              │ Query Response    │           │ (Sanction Order & │            │
│  │ Feedback Log) │              └─────────┬─────────┘           │ Pilot Compact)    │            │
│  └───────────────┘                        │                     └─────────┬─────────┘            │
│                                           │                               │                      │
│                                           └─────── Re-evaluated ──────────┘                      │
│                                                                           │                      │
│                                                                           ▼ Sandbox Initialized  │
│                                                                 ┌───────────────────┐            │
│                                                                 │ 5. PILOT_ACTIVE   │            │
│                                                                 │ (90-Day Sandbox)  │            │
│                                                                 └─────────┬─────────┘            │
│                                                                           │                      │
│                                                                           ▼ Milestones Complete  │
│                                                                 ┌───────────────────┐            │
│                                                                 │ 6. PILOT_COMPLETED│            │
│                                                                 │ (Outcome Audit)   │            │
│                                                                 └─────────┬─────────┘            │
│                                                                           │                      │
│                                                                           ▼ Commercial Scale-Up  │
│                                                                 ┌───────────────────┐            │
│                                                                 │ 7. SCALED         │            │
│                                                                 │ (Direct GeM Entry)│            │
│                                                                 └───────────────────┘            │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Functional Modules

### 4.1 Startup Passport (`/startup/profile`)
* **DPIIT Sovereign Auto-Verification:** Entering a verified DPIIT recognition number automatically verifies the venture against official registries.
* **100% Statutory Exemption Flags:**
  * **Turnover Waiver:** 100% exemption from prior ₹5Cr – ₹50Cr turnover criteria under GFR Rule 173(i).
  * **Experience Waiver:** Exemption from 3 to 5 years prior government execution history.
  * **EMD Waiver:** 100% waiver of Earnest Money Deposit (EMD) and tender fees.
* **Technical Capability Taxonomy:** Technology Readiness Level (TRL 1–9), patent registration numbers, core architecture classification, and deployment footprint.

### 4.2 5-Step Application Wizard (`/challenges/:id/apply`)
* **Step 1 - Executive Summary:** Solution title, technical abstract, civic problem-solution fit, and quantifiable outcome metrics.
* **Step 2 - System Architecture:** API specifications, compute requirements, throughput benchmarks, and Maharashtra State Data Centre (SDC) compatibility.
* **Step 3 - Evidence Vault (Direct S3 Streaming):**
  * Client calculates cryptographic SHA-256 hash using the native browser `SubtleCrypto` API.
  * Direct client-to-S3 presigned PUT streaming (15-minute TTL); the Express backend never buffers large binary files in server memory.
  * Supports architectural schematics, lab test certificates, benchmark datasets, and telemetry logs up to 25MB each.
* **Step 4 - Milestone Schedule:** Proposed 90-day sandbox pilot timeline broken into 3 statutory tranches (30% Inception Advance, 40% Mid-Term Telemetry, 30% Scale Gate).
* **Step 5 - Statutory Certification:** Digital anti-collusion declaration and GFR 173(i) eligibility affirmation.

### 4.3 Pilot Canvas & 30-Day Payment SLA Tracker (`/pilots/:id`)
* **90-Day Field Sandbox Supervision:** Startups upload live telemetry and field sensor logs directly against agreed milestone KPIs.
* **Statutory 30-Day Payment SLA:**
  * When a milestone is approved by the department nodal officer, a statutory 30-day countdown initializes under **Section 15 of the MSMED Act 2006**.
  * If the milestone payment remains pending past 30 days, automated escalation alerts are dispatched to the Directorate of Industries and MSInS leadership.
* **Scale Gate Direct GeM Onboarding:** Upon pilot completion and final outcome verification, the platform generates a cryptographically sealed **Scale Gate Sanction Order**, enabling the startup to onboard directly to the Government e-Marketplace (GeM) special procurement window without open tender competition.

### 4.4 Startup Mitra: Legal & Public Procurement AI Concierge
* **Dedicated Statutory Advisory:** An in-app conversational AI guide trained on Indian public procurement law, statutory exemptions, and Pragati-GovX system operations:
  * **GFR 2017 Rule 170:** Explains 100% Earnest Money Deposit (EMD) and tender fee exemptions.
  * **GFR 2017 Rule 173(i):** Explains turnover and prior operating experience waivers for DPIIT startups.
  * **MSMED Act 2006 (Sections 15 & 16):** Demystifies mandatory 45-day payment ceilings, 30-day sandbox SLAs, and compound penal interest.
  * **SIPP Scheme & IP Incentives:** Explains 80% patent filing fee rebates and fast-track examination.
  * **GeM Startup Runway:** Guides startups on listing products without standard tender barriers upon pilot completion.
* **Dynamic Official Government Citations:** Automatically pairs responses with verified official portals:
  * [Startup India Hub](https://www.startupindia.gov.in) (DPIIT recognition and seed fund)
  * [DPIIT Central Portal](https://dpiit.gov.in) (Official gazettes & notifications)
  * [Department of Expenditure](https://doe.gov.in) (GFR 2017 procurement guidelines)
  * [Government e-Marketplace](https://gem.gov.in) (GeM Startup Runway)
  * [MSME Samadhaan](https://samadhaan.msme.gov.in) (Delayed payment grievance filing)
  * [IP India](https://ipindia.gov.in) (SIPP patent rebate scheme)
* **Direct Platform Navigation Shortcuts:** Emits actionable deep-link buttons allowing founders to jump directly to:
  * **Startup Passport** (`/startup/profile`): Add DPIIT number to unlock GFR 173(i) waivers.
  * **Explore Challenges** (`/challenges`): Browse open department problem statements.
  * **Pilot Canvas** (`/pilots`): Track active sandboxes, telemetry, and 30-day payment SLAs.
  * **My Submissions** (`/startup/submissions`): Monitor proposal evaluation and review status.
* **Multi-Model Resilience:** Built on OpenRouter with active free model failover (`nex-agi/nex-n2.5-pro:free`, `nex-agi/nex-n2.5-mini:free`), per-model 8-second request timeouts, and deterministic simulated legal expert fallback.

---

## 5. API Reference for Startups

All endpoints require `Authorization: Bearer <AccessToken>`:

| Method | Route | Description | Guard / Permission |
|---|---|---|---|
| `POST` | `/v1/auth/login` | Email/password login; returns in-memory access token | Public |
| `GET` | `/v1/auth/refresh-token` | Silent token refresh via HttpOnly cookie | Public (Cookie) |
| `GET` | `/v1/problems` | Browse published challenges with GIS and sector filters | `requireAuth` |
| `GET` | `/v1/problems/:id` | View challenge specification and KPI benchmarks | `requireAuth` |
| `POST` | `/v1/submissions` | Submit new proposal under GFR 173(i) | `requirePermission("submission:create")` |
| `GET` | `/v1/submissions` | List proposals authored by the startup's organization | `requirePermission("submission:view")` |
| `GET` | `/v1/submissions/:id` | Fetch proposal details and live lifecycle status | `requirePermission("submission:view")` |
| `POST` | `/v1/evidence/upload` | Request 15-min presigned S3 upload intent | `requireRole("STARTUP_USER")` |
| `POST` | `/v1/evidence/finalize` | Finalize upload with in-browser SHA-256 digest | `requireRole("STARTUP_USER")` |
| `PUT` | `/v1/organizations/:id` | Update Startup Passport and DPIIT credentials | `requireRole("STARTUP_USER")` (Owner) |
| `POST` | `/v1/ai/legal-chat` | Query Startup Mitra legal & procurement assistant | `requireRole("STARTUP_USER", "ADMIN")` |

---

## 6. Security, Immutability & Trade Secret Protection

* ✅ **Proprietary IP Shielding:** Proposals and architectural schematics are protected under double-blind protocols; evaluators only see anonymized dossiers (`ANON-VENTURE-XXXX`).
* ✅ **Zero In-Memory File Buffering:** Direct S3 presigned streaming eliminates file caching on intermediate servers, ensuring proprietary blueprints stream directly to encrypted cloud vaults.
* ✅ **Multi-Tenant Boundary Enforcement:** Organization data is strictly sandboxed; competitor startups cannot inspect or query submitted applications.
* ✅ **Tamper-Evident SHA-256 Evidence Records:** Submitted files cannot be altered or substituted post-submission; any discrepancy between stored and calculated hashes triggers an automated security alert.
