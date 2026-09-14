# Startup Architecture and Authorization Guide

## 1. Role Overview and Persona
The Startup role (`STARTUP_USER`) represents verified innovative enterprises, founders, and technical teams applying for public sector challenges under the Pragati-GovX platform. The role is designed to facilitate agile public procurement, statutory DPIIT recognition verification, GFR Rule 173(i) exemption claims, cryptographic evidence submissions, and 90-day sovereign sandbox field pilots.

---

## 2. Authentication and Authorization Model

### 2.1 Identity and Session Lifecycle
- Primary Authentication: Local credentials (Argon2 password hashing) or Google OAuth 2.0.
- Dual-Token Architecture:
  - Access Token: Ephemeral JSON Web Token (15-minute lifespan) held strictly in client JavaScript memory. Never persisted in LocalStorage or SessionStorage to prevent Cross-Site Scripting (XSS) compromise.
  - Refresh Token: Secure HTTP-only cookie (7-day lifespan) with `SameSite=Lax` (development) or `SameSite=Strict` (production).
  - Silent Rotation: Handled automatically by the client Axios interceptor on 401 responses via `GET /v1/auth/refresh-token`.
- Role Identifier: `STARTUP_USER`.
- Route Guards: Protected on the server by `authenticate` and `requireRole(["STARTUP_USER", "ADMIN"])`.

### 2.2 Authorization Matrix
| Resource | Operation | Access Level | Constraints |
|---|---|---|---|
| User Profile | Read / Update | Self | Can only view and edit personal identity and contact data. |
| Organization Profile | Read / Update | Entity Owner | Scoped strictly to the startup's registered organization ID. |
| Public Challenges | Read / Search | Public | Read-only access to published problem statements. |
| Submissions | Create / Read | Scoped | Can only submit to published challenges; one active submission per challenge. |
| Evidence Vault | Upload / Attach | Scoped | File uploads limited to 25 MB; client-side SHA-256 integrity hash verification. |
| Pilot Compact | Read / Update | Assigned Entity | Access restricted to pilots awarded to the startup's entity. |
| Evaluator Data | Forbidden | None | Evaluator identities, rubrics notes, and internal government scoring are masked. |

---

## 3. Architecture and Data Flow

### 3.1 High-Level Flow
```
[Startup Client (SPA)]
        |
        | 1. Authentication (JWT / OAuth)
        v
[API Gateway / Route Guards] -> requireRole(["STARTUP_USER"])
        |
        +---> [Organization Service] -> DPIIT Validation / GFR 173(i) Exemption
        |
        +---> [Problem Service]      -> Catalog Browsing & GIS Map
        |
        +---> [Submission Service]   -> Duplicate Check & SHA-256 Evidence Vault
        |
        +---> [Pilot Service]        -> 90-Day Sandbox Milestone Tracking
```

### 3.2 Submission State Machine
A startup's proposal moves through a formal finite state machine:
```
[DRAFT] -> [SUBMITTED] -> [UNDER_REVIEW] -> [EVALUATED] -> [PILOT_ACTIVE] -> [PILOT_COMPLETED]
                              |                                    |
                              +--------> [REJECTED] <--------------+
```
- DRAFT: Proposal prepared locally within the Application Wizard.
- SUBMITTED: Formal submission recorded; immutable proposal snapshot with SHA-256 evidence hash.
- UNDER_REVIEW: Assigned to external technical validators; proposal content is locked.
- EVALUATED: Double-blind scoring completed by assigned evaluators.
- PILOT_ACTIVE: 90-day field sandbox compact executed with government nodal department.
- PILOT_COMPLETED: Milestone deliverables verified; final completion certificate issued.
- REJECTED: Application disqualified or non-selected with statutory feedback.

---

## 4. Core Functional Modules

### 4.1 Startup Passport (`/startup/profile`)
- Organization Identity: Legal name, incorporation date, company registration number, and core team size.
- DPIIT Recognition: Automatic verification against government databases for startup certification.
- Statutory Exemption Claims:
  - 100% Earnest Money Deposit (EMD) waiver under GFR Rule 173(i).
  - Exemption from prior turnover and prior operational experience criteria.
- Technical Capabilities: Domain taxonomy, technology readiness level (TRL), patents, and deployment stage.

### 4.2 Application Wizard (`/challenges/:id/apply`)
- Step 1 - Executive Summary: Solution title, abstract, problem-solution fit, and value proposition.
- Step 2 - Technical Architecture: System architecture, scalability, API specifications, and data residency compliance.
- Step 3 - Evidence Vault:
  - Multi-file dropzone supporting PDF, DOCX, ZIP, and images up to 25 MB each.
  - Document categories: Architecture Blueprint, Benchmark Report, Compliance Certificate, Telemetry Logs, Pitch Deck.
  - Cryptographic SHA-256 verification computed on the client before upload to guarantee tamper-proof evidence.
  - External artifact repository and live demonstration links.
- Step 4 - Milestone Schedule: 90-day pilot deployment schedule broken into verifiable tranches.
- Step 5 - Statutory Review & Declaration: Formal anti-collusion and GFR 173(i) eligibility certification.

### 4.3 Submissions Tracker (`/startup/submissions`)
- Centralized tracking desk for all submitted applications.
- Real-time status badges, submission timestamps, and challenge references.
- Duplicate submission prevention: Challenge detail view detects existing applications and directs to the active submission record.

### 4.4 Pilot Canvas (`/pilots/:id`)
- Collaborative workspace active once a submission transitions to `PILOT_ACTIVE`.
- Milestone KPI tracking against predetermined evaluation criteria.
- Sensor data and field telemetry upload portal for public authority acceptance.

---

## 5. API Surface

| Method | Endpoint | Description | Authorization |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Email/password login | Public |
| GET | `/api/v1/auth/google` | Google OAuth initiation | Public |
| GET | `/api/v1/problems` | Browse open challenges with pagination and filtering | Authenticated |
| GET | `/api/v1/problems/:id` | View challenge statement details | Authenticated |
| POST | `/api/v1/submissions` | Submit new pilot compact application | STARTUP_USER |
| GET | `/api/v1/submissions` | List entity's submitted proposals | STARTUP_USER (Scoped) |
| GET | `/api/v1/submissions/:id` | View submission details and status | STARTUP_USER (Owner) |
| PUT | `/api/v1/organizations/:id/profile` | Update startup passport and capabilities | STARTUP_USER (Owner) |
| GET | `/api/v1/notifications` | Fetch status and milestone updates | Authenticated (Self) |

---

## 6. Security and Compliance

1. Data Isolation: Startup entities cannot query or view applications submitted by competing startups.
2. Anonymization in Review: Submissions are served to technical evaluators with brand and identifying data masked to enforce double-blind evaluation protocols.
3. Cryptographic Integrity: Evidence vault documents store SHA-256 digests in MongoDB to prevent file substitution during technical scrutiny.
4. Data Privacy: Fully compliant with the Digital Personal Data Protection (DPDP) Act 2023, offering 1-click sovereign data exports via the user profile console.
