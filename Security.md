# Pragati-GovX: Comprehensive Security Architecture & Cryptographic Flow Specification

> **Platform Designation:** Sovereign Innovation Sandbox & Agile Public Procurement Gateway  
> **Target Authority:** Government of Maharashtra (MSInS / Dept. of Skills, Employment, Entrepreneurship & Innovation)  
> **Statutory Compliance:** GFR 2017 Rule 173(i) • IT Act 2000 • DPDP Act 2023 • CERT-In Cybersecurity Directives • MSMED Act 2006  
> **Security Posture:** Zero-Trust Architecture (ZTA) • Defense-in-Depth • Double-Blind Impartiality • Tamper-Evident Forensic Auditability  

---

## Executive Summary

Public procurement platforms operating at the intersection of state government departments and early-stage deep-tech startups carry an exceptional risk profile. Pragati-GovX is architected to protect:
1. **Public Treasury & Escrow Capital:** Preventing unauthorized disbursements and enforcing statutory milestone-gated tranche releases under GFR Rule 173(i).
2. **Proprietary Startup Intellectual Property (IP):** Shielding architectural designs, source code repositories, and patent-pending trade secrets from corporate espionage and unauthorized dissemination.
3. **Public Procurement Integrity:** Eliminating vendor bias, political lobbying, and identity leakages through strict cryptographic anonymization and statutory double-blind evaluation protocols.
4. **State Regulatory Sovereignty:** Ensuring complete data localization within sovereign Indian boundaries, CERT-In compliance, and immutable forensic audit trails for Comptroller & Auditor General (CAG) and State Vigilance Commission inspections.

---

## 1. Zero-Trust Security Topology & Defense-in-Depth

Pragati-GovX operates on a **Zero-Trust Architecture (ZTA)** principle: *"Never Trust, Always Verify"*. No user, device, network interface, or internal service is inherently trusted, regardless of physical location or network perimeter.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                DEFENSE-IN-DEPTH SECURITY PERIMETER                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│  [ CLIENT TIER ]                                                                                 │
│   • In-Memory Access Token (Zero LocalStorage / SessionStorage Storage)                          │
│   • Client-Side SHA-256 Digest Calculation via Web Crypto API                                    │
│   • Auto-Drain Axios Retry Queue on 401 with Token Mutex                                         │
│                                      │                                                           │
│                                      ▼ HTTPS (TLS 1.3)                                           │
│  [ EDGE & GATEWAY TIER ]                                                                         │
│   • Helmet HTTP Security Headers (Strict CSP, HSTS Preload, X-Frame-Options DENY)                │
│   • Dynamic CORS Whitelisting (Exact Origin Matching + Vercel Preview Regex)                     │
│   • Distributed Redis Sliding-Window Rate Limiters (Login, Register, OTP, Password)             │
│   • Global Request Tracing (UUIDv4 X-Request-ID attached to headers & async contexts)            │
│                                      │                                                           │
│                                      ▼ Request Pipeline                                          │
│  [ APPLICATION & AUTH TIER ]                                                                     │
│   • L-1: Cryptographic JWT Signature & Session State Validation                                  │
│   • L-2: Coarse-Grained Role-Based Access Control (RBAC)                                         │
│   • L-3: Granular Permission-Based Access Control (PBAC Matrix)                                  │
│   • L-4: Multi-Tenant Organization Boundary Enforcement                                          │
│   • Zod Strict Input Validation & Schema Sanitization                                            │
│                                      │                                                           │
│                                      ▼ Isolated Operations                                       │
│  [ DATA & CRYPTO STORAGE TIER ]                                                                  │
│   • MongoDB with Field-Level Sensitive Data Redaction                                            │
│   • Direct Client-to-S3 Presigned Streaming (MIME Validation, Byte Clamping, 900s TTL)           │
│   • Redis Cluster: Session Revocation Hash Map + Cache Layer                                     │
│   • Append-Only Tamper-Evident Audit Ledger (SHA-256 Entity Fingerprints)                        │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flow & Dual-Token Architecture

Pragati-GovX implements a hardened **In-Memory Dual-Token Pattern with Refresh Token Rotation (RTR)**. This eliminates the twin vulnerabilities of Cross-Site Scripting (XSS) token exfiltration and Cross-Site Request Forgery (CSRF).

```
   [ Browser Client ]                     [ Express Backend ]                    [ Redis / MongoDB ]
           │                                       │                                      │
           │─────── 1. POST /v1/auth/login ───────>│                                      │
           │        (email, password)              │────── 2. BCrypt Compare Password ───>│
           │                                       │<───── 3. User Verified ──────────────│
           │                                       │                                      │
           │                                       │────── 4. Create Session Record ─────>│
           │                                       │          (Store SHA-256(RefreshToken)│
           │                                       │<───── 5. Session Stored ─────────────│
           │<────── 6. HTTP 200 OK ────────────────│                                      │
           │        • AccessToken (JSON body)      │                                      │
           │        • Set-Cookie: RefreshToken     │                                      │
           │          (HttpOnly, Secure, SameSite) │                                      │
           │                                       │                                      │
   [ In-Memory AccessToken ]                       │                                      │
   (Expires in 15 Minutes)                         │                                      │
           │                                       │                                      │
           │─────── 7. Authenticated Request ─────>│                                      │
           │        Authorization: Bearer <JWT>    │────── 8. Validate JWT & Session ────>│
           │<────── 9. Resource Data ──────────────│<───── 9. Session Active & Valid ─────│
           │                                       │                                      │
   [ 15 Mins Elapsed: 401 Unauthorized ]           │                                      │
           │                                       │                                      │
           │─────── 10. GET /v1/auth/refresh ─────>│                                      │
           │        (Cookie: RefreshToken)         │────── 11. Hash Token & Check DB ────>│
           │                                       │           Rotate Refresh Token       │
           │                                       │<───── 12. New Session State ─────────│
           │<────── 13. HTTP 200 OK ───────────────│                                      │
           │        • New AccessToken (Body)       │                                      │
           │        • New Set-Cookie (Rotated)     │                                      │
           │                                       │                                      │
```
### 2.1 Short-Lived In-Memory Access Token
* **Lifespan:** 15 minutes (`900s`).
* **Storage Location:** Kept exclusively in JavaScript closure memory inside React's `AuthContext` (`let currentAccessToken = null`).
* **Security Benefit:** **Zero disk/browser persistence**. Even if an attacker executes an XSS payload via an untrusted browser extension or DOM injection, there is no `localStorage` or `sessionStorage` token available to steal.
* **Payload Structure:**
  ```json
  {
    "id": "65b8c9f2a41234567890abcd",
    "sessionId": "65b8c9f2a41234567890abce",
    "role": "STARTUP_USER",
    "iat": 1711728000,
    "exp": 1711728900
  }
  ```

### 2.2 Long-Lived Rotated Refresh Token
* **Lifespan:** 7 days.
* **Storage Location:** Emitted exclusively as an HTTP header cookie with strict flags:
  ```http
  Set-Cookie: refreshToken=eyJhbGciOi...; 
              Path=/; 
              HttpOnly; 
              Secure; 
              SameSite=Strict; 
              Max-Age=604800
  ```
* **Security Flags Explained:**
  * `HttpOnly`: Completely blocks JavaScript read access via `document.cookie`, preventing exfiltration.
  * `Secure`: Transmitted exclusively over encrypted TLS/HTTPS channels; blocked over plaintext HTTP.
  * `SameSite=Strict`: Instructs the browser never to attach the cookie to cross-site requests, immunizing against CSRF attacks.

### 2.3 Refresh Token Rotation (RTR) & Cryptographic Hashing
To prevent token reuse and replay attacks:
1. When a refresh request arrives at `/v1/auth/refresh-token`, the server computes the **SHA-256 digest** of the incoming refresh token:
   $$\text{Hash} = \text{SHA-256}(\text{RefreshToken})$$
2. The server queries `sessionModel` for an unrevoked session matching `refreshTokenHash`.
3. Upon validation, the server generates a brand-new refresh token, updates `session.refreshTokenHash` with the new hash, and invalidates the previous token immediately.
4. If a revoked or already-used refresh token is presented, the system detects a potential token-theft replay and immediately revokes all sessions associated with that user account.

### 2.4 Instantaneous Global Session Revocation
Because JWTs are stateless by default, standard JWT systems cannot easily revoke access before expiration. Pragati-GovX solves this by injecting `sessionId` into the access token payload:
* On every authenticated request, `requireAuth` queries MongoDB/Redis:
  ```javascript
  const session = await sessionModel.findById(decoded.sessionId);
  if (!session || session.revoked) {
      return res.status(401).json({ error: { code: "SESSION_REVOKED" } });
  }
  ```
* **Single Device Logout:** Marks `session.revoked = true` and clears the cookie.
* **Global Security Killswitch (`logoutALL`):** Marks all active user sessions as `revoked: true` in one atomic operation, instantly terminating sessions across all devices, mobile browsers, and active sessions.
* **Account Status Gate:** If an administrator suspends an account (`status: SUSPENDED`), `requireAuth` halts subsequent API calls immediately with `403 ACCOUNT_SUSPENDED`.

---

## 3. Multi-Tiered Authorization: RBAC & Permission Matrix

Pragati-GovX enforces a 4-tier authorization defense on all endpoints:

```
[ Incoming Request ]
         │
         ▼
[ Tier 1: requireAuth ] ──────────> Cryptographic JWT check, Session validity, Account status
         │
         ▼
[ Tier 2: requireRole ] ──────────> Role matching (STARTUP_USER, GOVERNMENT_USER, EVALUATOR, ADMIN)
         │
         ▼
[ Tier 3: requirePermission ] ────> Granular capability check against formal permission matrix
         │
         ▼
[ Tier 4: Tenancy / Org Guard ] ──> Verifies actor belongs to the specific Startup or Department
         │
         ▼
[ Route Controller Execution ]
```

### 3.1 Role & Permission Matrix (PBAC)

| Domain | Permission Constant | `STARTUP_USER` | `GOVERNMENT_USER` | `EVALUATOR` | `ADMIN` | Description |
|---|---|:---:|:---:|:---:|:---:|---|
| **Problem** | `problem:create` | ❌ | ✅ | ❌ | ✅ | Author public challenge statements |
| **Problem** | `problem:update` | ❌ | ✅ | ❌ | ✅ | Modify challenge constraints & deadlines |
| **Problem** | `problem:publish` | ❌ | ✅ | ❌ | ✅ | Publish challenge live to public catalog |
| **Problem** | `problem:view` | ✅ | ✅ | ✅ | ✅ | Read challenge specifications & criteria |
| **Submission** | `submission:create` | ✅ | ❌ | ❌ | ✅ | Submit innovation proposals under GFR 173(i) |
| **Submission** | `submission:view` | ✅ *(Own)* | ✅ *(Dept)* | ✅ *(Blind)* | ✅ | Inspect submission dossiers & evidence |
| **Submission** | `submission:review` | ❌ | ✅ | ❌ | ✅ | Issue technical clarifications to startups |
| **Evaluation** | `evaluation:score` | ❌ | ❌ | ✅ | ✅ | Score proposals against the 4-pillar rubric |
| **Evaluation** | `evaluation:decide` | ❌ | ✅ | ❌ | ✅ | Issue final statutory Sanction Orders |
| **Governance**| `admin:configure` | ❌ | ❌ | ❌ | ✅ | System-level configuration & rate limits |
| **Governance**| `admin:moderate` | ❌ | ❌ | ❌ | ✅ | Suspend bad actors, unlock audit forensics |

### 3.2 Multi-Tenant Data Boundary Protection
Even when an authenticated user holds a valid role, they cannot manipulate resources outside their tenant boundary:
* **Startups:** Enforced via `organizationMemberModel.findOne({ organizationId, userId, status: "ACTIVE" })`. Startups cannot view competitor submissions or upload evidence files to challenges they have not drafted.
* **Department Nodal Officers:** Enforced via `problem.organizationId`. Department officers can only manage proposals and issue sanction orders for challenges originated by their specific nodal department.
* **Evaluators:** Access is strictly limited to dossiers assigned to them via `evaluationAssignmentModel`. Access is prohibited once scoring is completed or if a conflict of interest is declared.

---

## 4. Double-Blind Anonymization & Evaluator Conflict-of-Interest (COI)

To eliminate procurement corruption, vendor favoritism, and brand bias, Pragati-GovX enforces an **Automated Double-Blind Evaluation Protocol**:

```
 ┌───────────────────────────┐
 │   Original Startup Dossier │
 │ • Company: Acme Robotics  │
 │ • Founders: Jane & John   │
 │ • Email: contact@acme.in  │
 │ • Brand Assets / Trademarks│
 └─────────────┬─────────────┘
               │
               ▼
 ┌────────────────────────────────────────────────────────┐
 │           Double-Blind Masking Sanitizer Engine         │
 │ • Assigns Synthetic ID: "ANON-VENTURE-8921"            │
 │ • Strips Corporate Branding, Logos & Domains           │
 │ • Sanitizes Team Resumes to Quantified Capabilities    │
 │ • Masks Patent Assignee Strings & Registered Entities  │
 └─────────────┬──────────────────────────────────────────┘
               │
               ▼
 ┌────────────────────────────────────────────────────────┐
 │           Statutory Conflict-of-Interest Gate          │
 │ Evaluator MUST execute legal non-conflict declaration: │
 │  "I affirm that I have no financial interest, prior    │
 │   consulting, or familial relationship with this       │
 │   venture or related entities under GFR Rule 173(i)."  │
 └─────────────┬──────────────────────────────────────────┘
         ┌─────┴──────────────────┐
   Affirmed                   Recused
         │                        │
         ▼                        ▼
 ┌────────────────┐      ┌────────────────────────┐
 │ Scorecard Open │      │ Assignment RECUSED     │
 │ 4-Pillar Rubric│      │ Reassigned to Alternate│
 └────────────────┘      └────────────────────────┘
```

### 4.1 Evaluation Security Guards
1. **Masked Dossiers (`ANON-VENTURE-XXXX`):** Evaluators never see startup legal names, GSTINs, DPIIT entity names, or founder biographies.
2. **Statutory COI Recusal Gate:** If an evaluator recognizes a technology or suspects a relationship with the underlying team, they can trigger an immediate **Recusal** (`status: RECUSED`), which permanently locks the scorecard and dispatches an automated alert to nodal officers to reassign the dossier.
3. **Idempotent Scoring Locks:** Once an evaluator submits their scores via `submitScores`, the assignment status transitions to `COMPLETED`. Any subsequent attempt to modify or re-post scores returns `400 ALREADY_SCORED`.
4. **Rubric Bounds Clamping:** The backend cross-validates each score against the assigned `evaluationTemplateModel.criteria.maxScore`. Attempts to submit scores exceeding the statutory limit are rejected with `400 SCORE_EXCEEDS_MAX`.

---

## 5. Direct-to-Storage Presigned S3 Streaming (Zero-Buffer Security)

Traditional file upload architectures route file bytes through the backend application server. This introduces massive security risks: memory exhaustion DoS, buffer overflows, temporary disk leaks, and server-side execution of malicious binaries.

Pragati-GovX eliminates this via **Direct Client-to-S3 Presigned Streaming with SHA-256 Checksums**:

```
   [ Client Browser ]                 [ Express Backend ]                   [ S3 Cloud Storage ]
           │                                   │                                     │
           │─── 1. POST /v1/evidence/upload ──>│                                     │
           │    (fileName, mimeType, sizeBytes,│                                     │
           │     entityType, entityId)         │                                     │
           │                                   │─── 2. Validate Membership & Limits ─┤
           │                                   │─── 3. Generate S3 Presigned PUT ───>│
           │<── 4. Return Upload Intent ───────│       (15-Minute Expiry Window)     │
           │    • presigned PUT URL            │                                     │
           │    • required headers             │                                     │
           │                                   │                                     │
   [ Compute SHA-256 in WebWorker ]            │                                     │
   crypto.subtle.digest("SHA-256")             │                                     │
           │                                   │                                     │
           │─── 5. Direct S3 Upload (PUT) ──────────────────────────────────────────>│
           │       (Content-Type, Binary Stream)                                     │
           │<── 6. S3 200 OK ────────────────────────────────────────────────────────│
           │                                   │                                     │
           │─── 7. POST /v1/evidence/finalize >│                                     │
           │    (evidenceId, checksumSHA256,   │                                     │
           │     actualSizeBytes)              │                                     │
           │                                   │─── 8. Immutable DB Record Sealed ───┤
           │<── 9. Finalized Evidence Record ──│                                     │
```

### 5.1 Storage Security Parameters
* **Presigned PUT Expiration:** Strictly limited to **15 minutes (`900s`)**.
* **Presigned GET Expiration:** Download links expire after **30 minutes (`1800s`)**.
* **MIME-Type Clamping:** Permitted types are restricted to `application/pdf`, `image/png`, `image/jpeg`, and `application/zip`.
* **File Extension Sanitization:** Strips path traversal characters (`../`, `\`, null bytes) and clamps file extension lengths:
  ```javascript
  const sanitizedExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  const fileKey = `evidence/${entityType.toLowerCase()}/${Date.now()}-${crypto.randomUUID()}${sanitizedExt}`;
  ```
* **Tamper-Evident SHA-256 Checksum:** The browser calculates the cryptographic SHA-256 hash using the native browser `SubtleCrypto` engine before transmission. The server permanently binds this checksum to the `Evidence` record, ensuring complete forensic evidentiary integrity.

---

## 6. Distributed Rate Limiting & DoS Defense

Rate limiting is orchestrated via Redis sliding-window counters, backed by `rate-limit-redis` and `express-rate-limit`. In the event of a Redis cluster outage, the system gracefully falls back to local in-memory tracking (`passOnStoreError: true`):

```
┌─────────────────────────┬───────────────────┬──────────────┬──────────────────────────────────────────┐
│ Protected Vector        │ Window Interval   │ Max Requests │ Threat Vector Mitigated                  │
├─────────────────────────┼───────────────────┼──────────────┼──────────────────────────────────────────┤
│ `/v1/auth/login`        │ 1 Minute (60s)    │ 5 Attempts   │ Credential stuffing, brute-force attacks │
│ `/v1/auth/register`     │ 1 Minute (60s)    │ 5 Accounts   │ Sybil attacks, automated bot genesis     │
│ `/v1/auth/verify-email` │ 1 Minute (60s)    │ 3 Attempts   │ OTP enumeration & brute-force guessing   │
│ `/v1/auth/forgot-pwd`   │ 1 Minute (60s)    │ 3 Requests   │ Email flooding, SMTP server exhaustion   │
│ Global API Gateway      │ 15 Minutes (900s) │ 100 Requests │ Layer-7 HTTP flooding, endpoint scrapers │
└─────────────────────────┴───────────────────┴──────────────┴──────────────────────────────────────────┘
```

### 6.1 DoS & Slowloris Countermeasures
* **Reverse Proxy Headers:** Validated via `req.ip` behind trusted proxies.
* **Strict Payload Size Limits:**
  * Standard JSON requests: Clamped to `100kb` to prevent memory buffer bloat.
  * Local Mock Storage routes: Clamped to `50mb`.
* **Asynchronous Timeout Isolation:** Long-running operations (AI multi-model consensus, automated eligibility scans, notification dispatches) are never executed inside the HTTP request-response cycle; they are delegated to isolated BullMQ background workers.

---

## 7. Multi-Model AI Consensus Verification Security

Pragati-GovX employs a **Tri-Model Anti-Cascade AI Consensus Architecture** (Google Gemini 3.6 Flash + Groq LLaMA-3.3 70B + OpenRouter Arbiter). Because Large Language Models can be susceptible to adversarial prompt injections and hallucinations, strict guardrails are enforced:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          AI INPUT SANITIZATION PIPELINE                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ Raw Proposal Text & Schematics ]                                                    │
│               │                                                                        │
│               ▼                                                                        │
│  [ Prompt Injection Scrubbing ]                                                        │
│   • Strips adversarial tokens ("ignore previous instructions", "system override")      │
│   • Sanitizes delimiter escaping & markdown breakout strings                           │
│   • Enforces strict token truncation (4,000 token context ceiling)                     │
│               │                                                                        │
│               ▼                                                                        │
│  [ Air-Gapped Sandboxed Prompt Execution ]                                             │
│   • Models have ZERO access to production databases, internal APIs, or file systems    │
│   • Read-only access to proposal submission text only                                  │
│               │                                                                        │
│               ▼                                                                        │
│  [ Cross-Model Consensus & Variance Check ]                                            │
│   • Computes variance between Gemini 3.6 & Groq LLaMA-3.3 scores                        │
│   • If variance > 20%, automatically dispatches OpenRouter Arbiter                     │
│               │                                                                        │
│               ▼                                                                        │
│  [ Strict Advisory Classification ]                                                    │
│   • AI output is sealed as advisory metadata (`aiRunModel`)                            │
│   • AI CANNOT reject or approve submissions; human statutory officers hold sole veto   │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Sovereign Treasury Escrow & Financial Security

Public procurement pilots under Pragati-GovX are funded via a milestone-based **Sovereign Escrow Protocol** designed to eliminate late-payment insolvency under Section 15 of the MSMED Act 2006:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MILESTONE ESCROW FINANCIAL LIFECYCLE                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ 1. AWAITING_FUNDING ]                                                               │
│   • Department deposits 100% of pilot grant corpus into dedicated treasury escrow      │
│   • Escrow contract verified & locked                                                  │
│               │                                                                        │
│               ▼                                                                        │
│  [ 2. FUNDED ]                                                                         │
│   • Tranche 1 (30% Inception Advance) automatically authorized upon contract signing   │
│   • 30-day statutory SLA countdown initialized                                         │
│               │                                                                        │
│               ▼                                                                        │
│  [ 3. TRANCHE_1_RELEASED ]                                                             │
│   • Startup initiates 90-day sandbox deployment                                        │
│   • Telemetry and intermediate milestone logs submitted to Pilot Canvas                │
│               │                                                                        │
│               ▼                                                                        │
│  [ 4. TRANCHE_2_RELEASED ]                                                             │
│   • Mid-term review passed; 40% operational tranche released                           │
│               │                                                                        │
│               ▼                                                                        │
│  [ 5. COMPLETED ]                                                                      │
│   • Final outcome audit verified; final 30% performance tranche released               │
│   • Scale Gate Sanction Order generated for direct onboarding to GeM                   │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Financial Integrity Controls
* **Dual-Key Authorization:** No tranche can be disbursed without cryptographically signed authorizations from both the Department Nodal Officer and the verified Startup Officer.
* **Statutory SLA Enforcement Worker:** A BullMQ cron worker executes periodic sweeps across active pilots. If an approved milestone payment remains unreleased beyond the statutory 30-day limit, automated escalation notices are dispatched to the Directorate of Industries and MSInS leadership.
* **Mathematical Invariant Guarantees:** All milestone tranche formulas ($30\% + 40\% + 30\% = 100\%$) are validated by unit tests (`SandboxEscrow.test.js`), preventing rounding leaks or double-draw vulnerabilities.

---

## 9. Tamper-Evident Forensic Audit Logging

Pragati-GovX maintains an immutable, append-only audit trail implemented in `server/services/audit.service.js` and backed by the `AuditEvent` schema.

```javascript
{
  "_id": "65b8d01f1234567890abcdef",
  "actorId": "65b8c9f2a41234567890abcd",
  "actorRole": "GOVERNMENT_USER",
  "action": "DECISION_RECORDED",
  "entityType": "SUBMISSION",
  "entityId": "65b8c9f2a41234567890abcf",
  "traceId": "req-98f24a10-2b15-4e78-bc91-8840a1b2c3d4",
  "ip": "203.0.113.45",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "status": "SUCCESS",
  "changes": {
    "outcome": "ACCEPTED",
    "grantAmount": 2500000
  },
  "metadata": {
    "district": "Pune",
    "gfrRule": "173(i)"
  },
  "createdAt": "2026-03-30T10:15:30.125Z"
}
```

### 9.1 Sensitive Field Redaction Engine
Before any audit event is persisted to MongoDB, `auditService` executes a recursive redaction filter (`redactSensitiveData`) across all object keys:
* Any key containing `password`, `token`, `jwt`, `authorization`, `secret`, `apiKey`, or `refreshToken` is replaced with `"[REDACTED]"`.
* Eliminates the risk of credential leakage in forensic logs, even during comprehensive administrative audits.

### 9.2 Distributed Request Tracing (`X-Request-ID`)
* Every incoming request receives a unique UUIDv4 trace identifier via `requestMiddleware`.
* The trace identifier is attached to Express `req.id`, emitted in response headers (`X-Request-ID`), recorded in Morgan HTTP access logs, and bound to every BullMQ job and `AuditEvent` record.
* Enables end-to-end audit reconstruction during post-incident reviews or legal vigilance inquiries.

---

## 10. OWASP Top 10 Mitigation Matrix

| OWASP Vulnerability Category | Pragati-GovX Mitigation Architecture |
|---|---|
| **A01: Broken Access Control** | 4-tier middleware gate (`requireAuth`, `requireRole`, `requirePermission`, tenancy checks). Anonymous blind evaluation shielding. |
| **A02: Cryptographic Failures** | Bcrypt (12 rounds) password hashing, SHA-256 evidence integrity hashing, TLS 1.3 in transit, AES-256 S3 server-side encryption at rest. |
| **A03: Injection (SQL / NoSQL / Command)** | Zod schema validation on all inputs, Mongoose parameterized query builders, strict prohibition of `eval()` or unescaped shell execs. |
| **A04: Insecure Design** | Formal 7-stage FSM preventing illegal state jumps, double-blind evaluation protocols, statutory GFR 173(i) automated rule engines. |
| **A05: Security Misconfiguration** | Helmet security headers enabled by default (CSP, HSTS, X-Frame-Options DENY), CORS origin whitelisting, non-root Docker execution. |
| **A06: Vulnerable & Outdated Components** | Minimal external dependency tree, automated npm audit checks, Vitest CI suites (10 suites, 99 tests). |
| **A07: Identification & Authentication Failures** | In-memory access tokens, HttpOnly/SameSite/Secure refresh cookies, refresh token rotation, 5-attempt login rate limiters. |
| **A08: Software & Data Integrity Failures** | In-browser SHA-256 checksums verified upon S3 upload finalization, append-only immutable audit records, multi-model AI consensus verification. |
| **A09: Security Logging & Monitoring Failures** | Centralized `AuditEvent` collection, automated PII/secret redaction, UUIDv4 trace ID propagation, Redis health telemetry. |
| **A10: Server-Side Request Forgery (SSRF)** | Storage uploads use client-to-S3 presigned streaming; backend never issues outbound HTTP requests based on unsanitized user-supplied URLs. |

---

## 11. Security Incident Response & Emergency Procedures

### 11.1 Compromised Account Protocol
1. **Immediate Revocation:** Admin triggers `POST /v1/admin/users/:id/revoke-sessions`, setting `revoked = true` on all active sessions for that user ID.
2. **Account Quarantine:** User status transitioned to `SUSPENDED`, instantly causing all subsequent calls to fail with `403 ACCOUNT_SUSPENDED`.
3. **Audit Log Inspection:** Security officers query `GET /v1/admin/audit-logs?actorId=:id` to identify unauthorized modifications or data accesses.

### 11.2 Compromised Evaluator Protocol
1. If an evaluator's impartiality or credentials are compromised, an administrator invokes the **Emergency Recusal Endpoint**.
2. All pending assignments under that evaluator are transitioned to `RECUSED`.
3. The platform re-queues affected proposals for alternative evaluator assignment, preserving the integrity of the procurement competition.

---

## 12. Verification & Automated Security Tests

All security controls are verified through automated Vitest test suites:
* `test/authValidator.test.js`: Password complexity regex, username bounds, and schema injection defenses.
* `test/transitionGuard.test.js`: Validates that unauthorized roles cannot trigger illegal FSM transitions or bypass evaluation gates.
* `test/evidenceValidator.test.js`: Validates S3 MIME type checking, 25MB file size boundaries, and path traversal sanitization.
* `test/SandboxEscrow.test.js`: Mathematical validation of escrow funds, tranche releases, and milestone security.
* `test/aiPolicy.test.js`: Validates prompt injection sanitization, token length boundaries, and multi-model consensus triggers.

Run the complete security test suite:
```bash
npm run test
```

---

*Pragati-GovX Architecture Document • Maintained by the Pragati-GovX Core Engineering Team • Smart India Hackathon 2026*
