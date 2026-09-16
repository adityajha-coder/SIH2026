# Pragati-GovX

## Sovereign Innovation Sandbox & Agile Public Procurement Gateway

### Smart India Hackathon 2026 (SIH 2026)
* **Problem Statement ID:** PS 26136 (PS:136)
* **Nodal Authority:** Government of Maharashtra — Department of Skills, Employment, Entrepreneurship & Innovation / Maharashtra State Innovation Society (MSInS)
* **Problem Statement Title:** Platform for Government Departments to Procure Innovative Solutions from Startups via Controlled Trials, Regulatory Sandboxes, and Milestone-Based Contracting

---

## 1. Executive Summary

Public procurement in India has historically operated under rigid General Financial Rules (GFR) requiring multi-crore prior annual turnover (typically 5 Cr to 50 Cr INR) and a minimum of three years of past government execution experience. These criteria systematically disqualify early-stage and deep-tech startups, forcing government departments to rely on legacy system integrators with outdated technological capabilities.

**Pragati-GovX** solves this structural failure. It operationalizes **GFR Rule 173(i)** and the **Maharashtra State Innovative Startup Policy**, establishing an outcome-driven procurement gateway where DPIIT-recognized startups compete on engineering merit, quantifiable outcome benchmarks, and supervised field trial performance rather than balance sheet history.

The platform provides an end-to-end statutory bridge: from departmental problem formulation and explainable AI candidate discovery, through double-blind technical evaluation and multi-model AI anti-cascade audits, to 90-day field sandbox trials governed by a statutory 30-day payment SLA under the MSMED Act 2006, culminating in commercial procurement onboarding on the Government e-Marketplace (GeM) across all 36 Maharashtra districts.

---

## 2. Key Features

The platform provides a comprehensive suite of tools organized by user role, built with clear, simple, and transparent workflows:

### For Startups & Innovators
* **Exemption from Turnover & EMD:** Automatic waiver of prior turnover requirements, past government experience clauses, and Earnest Money Deposits under GFR Rule 173(i) upon entering a valid DPIIT recognition number.
* **Instant Eligibility Pre-Check:** Test challenge eligibility before applying with a single click, verifying sector match, applicant type, and active application windows.
* **Startup Passport:** A single, reusable profile containing verified DPIIT credentials, Technology Readiness Level (TRL 3 to 9), sector tags, patent filings, and team qualifications.
* **Structured 4-Step Proposal Wizard:** Simple step-by-step submission builder focusing on technical architecture, quantitative outcome targets, and milestone plans rather than complex tender paperwork.
* **Cryptographic Evidence Vault:** Upload documents, schematics, and test datasets up to 25 MB directly to a secure S3 cloud bucket with in-browser SHA-256 integrity checksums that prevent file tampering.
* **Transparent Lifecycle Tracker:** Track proposal progress in real time across a 7-stage state machine (Draft, Submitted, Under Review, Clarification, Accepted, Pilot Active, Scaled) with timestamped transition records.
* **Statutory 30-Day Payment SLA Protection:** Milestone payments for field trials are legally protected under Section 15 of the MSMED Act 2006, backed by a live countdown clock tracking disbursement deadlines.

### For Government Departments & Municipal Bodies
* **Challenge Authoring Studio:** Guided 5-step tool for nodal officers to formulate civic challenges with measurable baseline metrics, target outcome KPIs, district targets, and milestone budgets.
* **Real-Time Challenge Readiness Meter:** A 0-to-100 quality indicator that ensures all mandatory statutory terms, TRL thresholds, and evaluation criteria are defined before publishing.
* **Explainable AI Candidate Matching:** Automatically identifies and ranks capable startups against open challenges using a transparent 4-pillar score (Sector 35%, Capability 35%, Maturity 15%, DPIIT Status 15%) with detailed point-wise explanations.
* **Department Command Center:** Executive dashboard providing visual analytics across published challenges, candidate applications, active field trials, and sector distributions.
* **Finite-Risk Pilot Governance (Pilot Canvas):** Manage 90-day sandbox trials with a structured 30% / 40% / 30% milestone compact, reviewing live telemetry and S3 deliverables before releasing funds.
* **Scale Gate Console & Official Sanction Orders:** Evaluate completed pilots across 5 pillars (KPI achievement, robustness, security, economics, readiness), aggregate budgets across all 36 Maharashtra districts, and generate printable Government Sanction Orders (GR-MSInS/2026/...) for direct onboarding to the Government e-Marketplace (GeM).

### For Technical Evaluators
* **Double-Blind Evaluation Room:** Evaluates submissions stripped of company names, founder identities, and commercial branding (`ANON-VENTURE-XXXX`), eliminating brand favoritism and unconscious bias.
* **Mandatory Conflict-of-Interest (COI) Gate:** Statutory legal declaration required before scoring unlocks, with a 1-click recusal mechanism if any personal or financial connection exists.
* **Calibrated 4-Pillar Scoring Rubric:** Responsive scoring sliders evaluating Problem-Solution Fit (30 pts), Innovation & TRL (25 pts), Feasibility & Team (25 pts), and Measurable Outcome Impact (20 pts) with mandatory qualitative feedback.
* **Live 3-Model AI Anti-Cascade Audit:** One-click automated cross-verification that runs Gemini 3.6 Flash, Groq, and OpenRouter in sequence to verify technical claims against attached documents without replacing human decision-making.
* **Cryptographically Sealed Scorecards:** Evaluator scorecards are immutably locked upon submission with audit trace IDs to prevent retrospective alterations.

### Platform-Wide Governance & Transparency
* **Interactive 36-District GIS Map:** Visual cluster map of open innovation challenges geocoded across every administrative division of Maharashtra.
* **In-Memory Dual-Token Security:** High-security session model where access tokens remain in memory (never written to localStorage) and automatically rotate via secure httpOnly cookies.
* **Perspective-Based About Guide:** Complete interactive manual with dedicated top-right role selectors that explain how the website operates from Startup, Government, and Validator perspectives.
* **Immutable Forensic Audit Trail:** Every status update, scoring decision, and payment event is permanently logged with SHA-256 integrity hashes for public accountability and vigilance audits.

---

## 3. Technology Stack

### Frontend Application (`client/`)
* **Core Framework:** React 18 (Vite SPA toolchain, native ES modules)
* **Component Architecture:** shadcn/ui built on Radix UI headless accessible primitives (Dialog, DropdownMenu, Select, Tabs, Tooltip, Sheet, Separator)
* **Styling & Design System:** Tailwind CSS with CSS custom variables, civic-tech color palette, high-contrast typography, and strict zero-badge metadata tags
* **Server State & Cache:** TanStack React Query v5 (declarative cache management, background invalidation, optimistic updates)
* **Forms & Validation:** React Hook Form integrated with Zod schema validation
* **Data Visualization:** Recharts (SVG-based evaluation radar charts, sector distribution bar charts, milestone KPI comparisons)
* **Geographic Information Systems (GIS):** Leaflet & React-Leaflet (geocoded problem statement clusters and district coverage maps)
* **Micro-Animations:** Framer Motion (page transitions and multi-step authoring wizards)
* **Notification System:** Sonner (stacked toast notifications with non-overlapping header offsets)
* **HTTP Client:** Axios with bidirectional interceptors (automatic in-memory JWT injection and silent token refresh rotation)

### Backend Services (`server/`)
* **Runtime & Architecture:** Node.js (v20+, native ES Modules `"type": "module"`), Express.js RESTful API
* **Database & ODM:** MongoDB with Mongoose (schema validation, compound indices, transactional references)
* **Asynchronous Task Queue & Distributed Caching:** Redis & BullMQ (message broker and distributed job queue orchestration for background multi-model AI verification jobs, statutory 30-day SLA countdown monitors, automated email dispatch, and geocoded query acceleration)
* **Authentication & Cryptography:** Argon2 / Bcrypt password hashing, JSON Web Tokens (JWT), Web Crypto API SHA-256 checksums, Passport.js (Google OAuth 2.0 integration)
* **Security & Hardening:** Helmet (HTTP security headers), Express Rate Limit (DDoS mitigation), CORS origin whitelisting, input sanitization middleware
* **Logging & Tracing:** Morgan HTTP logger, UUID v4 request trace ID injection (`x-trace-id`) across every request envelope

### Cloud Storage & S3 Evidence Vault
* **Storage Protocol:** AWS S3-compatible protocol via `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
* **Cloud Provider:** Supabase Storage (zero-cost cloud bucket `SIH2026136-vault` in region `ap-southeast-1`)
* **Presigned Upload Pipeline:** Browser calculates SHA-256 hash in client memory, requests upload intent, and streams binary files directly to the S3 bucket via presigned PUT URLs, preventing Express server memory exhaustion
* **Supported MIME Types:** PDF, CSV, JSON, PNG, JPEG, WEBP, ZIP, DOC, DOCX (up to 25 MB)

### AI Advisory & Governance Pipeline
* **Model Standard:** Google GenAI SDK (`gemini-3.6-flash`)
* **Multi-Model Anti-Cascade Chain:** Google Gemini 3.6 Flash (Layer 1: Generator) -> Groq LLaMA-3.3 70B (Layer 2: Independent Verifier) -> OpenRouter / Ollama Fallback (Layer 3: Arbiter)
* **Governance Enforcement:** Strict zero-price allowlist (`ai.policy.js`) blocking unauthorized paid models with HTTP 403, Bearer token redaction, and prompt length limits (30,000 characters)

### Testing & Quality Assurance
* **Test Runner:** Vitest (native ESM in-memory test runner)
* **Test Coverage:** 5 dedicated test suites with 43 automated unit tests in `test/`
* **CI/CD Integration:** GitHub Actions (`.github/workflows/ci.yml`) automatically running backend integrity checks, Vitest test suites, and frontend production builds on every push and pull request

---

## 4. System Architecture & The 6-Stage Innovation Lifecycle

```
Stage 1: Challenge Studio (Government)
   - Baseline vs Target KPIs formulated
   - 36 Maharashtra districts selected
   - GFR Rule 173(i) exemption terms defined
          │
          ▼
Stage 2: Discovery & Deterministic Pre-Check (Startup)
   - Startups browse geocoded catalog
   - Instant DPIIT recognition validation
   - 100% EMD waiver applied
          │
          ▼
Stage 3: Evidence Submission & S3 Vault
   - 4-step proposal authoring wizard
   - In-browser SHA-256 checksum computation
   - Direct S3 presigned upload
          │
          ▼
Stage 4: Double-Blind Evaluation (Validator)
   - Entity masked to ANON-VENTURE-XXXX
   - Mandatory statutory Conflict-of-Interest (COI) gate
   - 4-pillar weighted rubric scoring (0-100)
          │
          ▼
Stage 5: Live Multi-Model AI Consensus Audit
   - Gemini 3.6 Flash -> Groq -> OpenRouter
   - Independent claim-evidence verification
   - Advisory report generated (human authority preserved)
          │
          ▼
Stage 6: Sandbox Field Pilot & 30-Day SLA Payment (Execution & Scale)
   - 90-day sandbox pilot on Pilot Canvas
   - 30% / 40% / 30% milestone compact
   - MSMED Act Section 15 statutory 30-day payment countdown
   - Scale Gate Console generates 36-district GeM Sanction Order
```

---

## 5. Role-Based Authorization & Workspaces

The platform enforces strict role boundaries across four primary user personas:

| User Role | Workspace Path | Primary Responsibilities & Permissions |
|---|---|---|
| `STARTUP_USER` | `/startup/dashboard` | Manage Startup Passport; browse challenges; run deterministic pre-checks; author technical proposals; upload SHA-256 verified evidence; track 7-stage submission lifecycles; submit sandbox milestone deliverables; monitor 30-day SLA payment disbursements. |
| `GOVERNMENT_USER` | `/government/dashboard` | Access Department Command Center; author problem statements in Challenge Studio; set baseline vs target KPIs; run Explainable AI candidate matching; assign anonymized submissions to evaluators; govern field trials in Pilot Canvas; inspect telemetry; issue 36-district Sanction Orders (`GR-MSInS/2026/...`). |
| `EVALUATOR` | `/evaluator/queue` | Access assigned evaluation queue; complete mandatory statutory Conflict-of-Interest (COI) legal recusal gate; conduct double-blind scoring on 4-pillar rubrics (100 pts); run live multi-model AI anti-cascade verification; seal immutable scorecards with audit trace IDs. |
| `ADMIN` | `/admin/audit` | Oversee cross-departmental operations; inspect system-wide forensic audit logs; verify SHA-256 state transition integrity; manage user organizations; resolve system-level escalation flags. |

---

## 6. Security, Session & Data Governance Architecture

### Dual-Token Lifecycle (XSS & CSRF Defense)
1. **Access Token (15-Minute Expiry):** Kept strictly in JavaScript memory closure. Never persisted in `localStorage` or `sessionStorage` to eliminate Cross-Site Scripting (XSS) extraction risks.
2. **Refresh Token (7-Day Expiry):** Transmitted in an `httpOnly`, `secure`, `sameSite=strict` cookie.
3. **Silent Token Rotation:** Upon receiving an HTTP 401 Unauthorized status, the Axios response interceptor intercepts the failure, queries `GET /v1/auth/refresh-token` using the secure cookie, updates the in-memory access token, and transparently replays the queued request without disrupting the user.

### Double-Blind Anonymization
All candidate submissions are stripped of corporate trademarks, founder identities, and commercial branding upon submission. Reviewers and evaluation committees interact solely with synthetic sovereign codes (e.g. `ANON-VENTURE-4981`), ensuring complete insulation against vendor favoritism, political lobbying, or brand bias.

### Mandatory Conflict-of-Interest (COI) Charter
Before an evaluator can view any technical dossier or input scores, they must complete a legal declaration affirming zero financial, equity, advisory, or familial connection to any participating party. A single-click recusal mechanism immediately reallocates the submission to an alternate evaluator without administrative penalty.

### Cryptographic Evidence Integrity
Every technical document, sensor log, and audit artifact uploaded by a startup undergoes Web Cryptography SHA-256 calculation inside the client browser. The resulting digest is stored immutably in the database before the binary file streams to the S3 bucket. Any subsequent modification or substitution immediately invalidates the cryptographic checksum.

---

## 7. Statutory Compliance & Legal Backing

1. **General Financial Rules (GFR) Rule 173(i):** Provides statutory authority for state procuring entities to waive conditions of prior turnover and prior experience for recognized startups, provided technical specifications are met.
2. **Micro, Small and Medium Enterprises Development (MSMED) Act 2006 (Section 15):** Enforces mandatory milestone payment within 45 days (implemented as 30 days under Maharashtra GR No. MAT-2024/CR-88/Ind-7). The system calculates statutory interest liability if deadlines lapse.
3. **Maharashtra State Innovative Startup Policy 2024:** Authorizes departmental trial pilots up to 15 Lakh INR without standard tendering and allows direct procurement transition up to 1 Crore INR upon successful pilot audit.
4. **Digital Personal Data Protection (DPDP) Act 2023:** Role-scoped access control ensures commercial IP, technical schematics, and personal identifying data remain segregated and encrypted.

---

## 8. Directory Structure

```
SIH2026/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI pipeline
├── Docs/
│   ├── Startup.md                     # Startup architecture & authorization spec
│   ├── Government_offical.md          # Government nodal officer architecture spec
│   └── Evaluator.md                   # Technical evaluator architecture spec
├── client/                            # React 18 + Vite Frontend Monorepo
│   ├── src/
│   │   ├── assets/                    # Brand assets & logos
│   │   ├── components/
│   │   │   ├── common/                # ErrorBoundary, PulseRail, Modals
│   │   │   ├── government/            # AssignEvaluatorModal, ReadinessMeter
│   │   │   ├── layout/                # Navbar, Footer, AppLayout, RoleGuard
│   │   │   └── ui/                    # Accessible shadcn/ui primitives
│   │   ├── context/                   # AuthContext (session, login, token memory)
│   │   ├── hooks/                     # Custom React Query hooks
│   │   ├── lib/                       # Axios client envelope, queryClient
│   │   ├── pages/
│   │   │   ├── app/                   # Profile, NotificationCenter, Redirects
│   │   │   ├── evaluator/             # EvaluatorQueue, EvaluationRoom
│   │   │   ├── government/            # DepartmentDashboard, ChallengeStudio, ScaleGate
│   │   │   ├── pilot/                 # PilotCanvas (30-day SLA payment ledger)
│   │   │   ├── public/                # LandingPage, ChallengeCatalog, AboutPage, Policy
│   │   │   └── startup/               # StartupDashboard, Passport, Wizard, Tracker
│   │   ├── App.jsx                    # Central client routing table
│   │   ├── index.css                  # Design tokens, variables & typography
│   │   └── main.jsx                   # Application bootstrapping entrypoint
│   └── package.json
├── server/                            # Node.js Express Backend Monorepo
│   ├── config/                        # Database connection & passport strategies
│   ├── constants/                     # Roles, system statuses & configuration
│   ├── controllers/                   # Request handlers for all domain entities
│   ├── middleware/                    # Auth guards, role checks, rate limiters
│   ├── models/                        # Mongoose schemas & data models
│   ├── routes/                        # Express API route declarations (/v1)
│   ├── services/
│   │   ├── ai/                        # Multi-model verification, Gemini/Groq adapters
│   │   ├── eligibility/               # Deterministic statutory rule engine
│   │   ├── government/                # Digilocker, API Setu, OGD adapters
│   │   ├── submission/                # FSM transition guards
│   │   ├── audit.service.js           # Immutable SHA-256 audit logging
│   │   ├── matching.service.js        # Deterministic explainable matching engine
│   │   ├── storage.service.js         # Supabase S3 presigned URL generator
│   │   └── submission.service.js      # Proposal lifecycle operations
│   ├── validators/                    # Zod validation schemas
│   ├── app.js                         # Express application assembly
│   └── server.js                      # Server startup listener
├── test/                              # Automated Vitest Test Suites
│   ├── aiPolicy.test.js               # AI model allowlist & sanitization tests
│   ├── authValidator.test.js          # Password complexity & registration tests
│   ├── eligibilityRules.test.js       # Statutory window & DPIIT gate tests
│   ├── evidenceValidator.test.js      # S3 MIME & 25MB file limit tests
│   └── transitionGuard.test.js        # 7-stage FSM state transition tests
├── package.json                       # Root workspace package manifest
├── testing.md                         # Comprehensive API testing guide
└── README.md                          # Authoritative platform documentation
```

---

## 9. Automated Testing with Vitest

The project includes an in-memory testing suite executed via Vitest, requiring zero external database connections:

```bash
# Run test suite once
npm test

# Run tests in interactive watch mode
npx vitest
```

### Test Suite Summary (`test/`)
* **`test/transitionGuard.test.js`:** Enforces the 7-stage finite state machine. Blocks illegal state jumps (e.g. `DRAFT` to `SCALED`) with `400 INVALID_TRANSITION` and blocks unauthorized role transitions with `403 TRANSITION_FORBIDDEN`.
* **`test/aiPolicy.test.js`:** Validates model allowlists (`gemini-3.6-flash`, `openai/gpt-oss-20b`), verifies prompt sanitization, redacts Bearer JWT credentials, and limits prompt sizes.
* **`test/eligibilityRules.test.js`:** Validates statutory application window timelines, GFR 173(i) DPIIT certificate checks, applicant organization eligibility, and case-insensitive sector alignment.
* **`test/authValidator.test.js`:** Enforces password complexity (uppercase, lowercase, number, special character `@$!%*?&`, minimum 8 characters), username injection protection, and 6-digit numeric OTP validation.
* **`test/evidenceValidator.test.js`:** Validates file size limits (25 MB max), permitted MIME formats (PDF, CSV, JSON, ZIP, images), blocks executable `.exe` scripts, and enforces 24-character hex MongoDB ObjectId formats.

---

## 10. Authors & Institutional Attribution

* **Smart India Hackathon 2026:** Problem Statement 26136 (PS:136)
* **Sponsoring Authority:** Government of Maharashtra (Department of Skills, Employment, Entrepreneurship & Innovation / Maharashtra State Innovation Society)
* **Lead Author & System Architect:** Aditya Jha
* **Platform Designation:** Pragati-GovX (Sovereign Innovation Sandbox & Agile Public Procurement Gateway)
