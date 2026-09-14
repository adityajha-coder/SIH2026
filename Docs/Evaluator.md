# Technical Evaluator Architecture and Authorization Guide

## 1. Role Overview and Persona
The Evaluator role (`EVALUATOR`) represents accredited academic experts, senior technical specialists, R&D scientists, and certified public procurement validators. The role is responsible for conducting rigorous, double-blind technical assessments of startup proposals submitted against department challenges. Evaluators operate under statutory recusal mandates, score against departmental rubrics, and deliver objective feedback without commercial bias.

---

## 2. Authentication and Authorization Model

### 2.1 Identity and Session Lifecycle
- Authentication: Secure email/password verification or federated institutional single sign-on.
- Dual-Token Implementation:
  - In-memory Access Token (15 minutes).
  - Secure HTTP-only Refresh Cookie (7 days) with silent refresh rotation.
- Role Identifier: `EVALUATOR`.
- Route Guards: Server-side authorization enforced via `authenticate` and `requireRole(["EVALUATOR", "ADMIN"])`.

### 2.2 Strict Assignment Authorization Scoping
Unlike general administrative roles, an evaluator's data access is tightly constrained:
| Resource | Operation | Access Level | Constraints |
|---|---|---|---|
| Evaluator Credentials | Read / Update | Self | Professional domain taxonomy, designations, and institutional affiliations. |
| Assigned Submissions Queue | Read | Scoped | Only proposals where `assignedEvaluators` explicitly includes the user's ID. |
| Conflict of Interest Protocol | Submit | Mandatory | Must explicitly accept or declare conflict of interest before viewing full proposal dossier. |
| Proposal Technical Dossier | Read (Masked) | Double-Blind | Corporate branding, founder names, and entity identifiers are masked during evaluation. |
| Evaluation Scorecard | Create / Submit | Scoped | Can only evaluate assigned submissions; submission locks after finalization. |
| Competing Evaluator Scores | Forbidden | None | Evaluators cannot view scores or remarks submitted by other validators on the same proposal. |
| Financial / Commercial Terms | Forbidden | Masked | EMD waiver and statutory exemption data are handled upstream; technical focus is maintained. |

---

## 3. Architecture and Data Flow

### 3.1 High-Level Flow
```
[Technical Evaluator Client]
             |
             | 1. Authentication (JWT / Session)
             v
[API Gateway / Route Guards] -> requireRole(["EVALUATOR"])
             |
             +---> [Evaluator Queue]          -> Filter Assigned Pending Proposals
             |
             +---> [Recusal & COI Protocol]   -> Mandatory Conflict-of-Interest Declaration
             |
             +---> [Double-Blind Review Room] -> Anonymized Technical Evidence & Architecture
             |
             +---> [Rubric Scoring Engine]    -> Multi-Pillar Numerical & Qualitative Review
             |
             +---> [Audit & Lock Pipeline]    -> Immutable Scorecard Commitment
```

### 3.2 Evaluation Lifecycle States
```
[ASSIGNED] ------------> [COI_DECLARED] ------------> [EVALUATING] ------------> [COMPLETED]
    |                          |
    | (Conflict detected)      | (Conflict verified)
    +--------------------------+--------------------> [RECUSED]
```
- ASSIGNED: Department nodal officer allocates proposal to the evaluator.
- COI_DECLARED: Evaluator verifies absence of financial, advisory, or familial relationships with the applicant.
- EVALUATING: Double-blind review room active; evidence vault documents accessible.
- COMPLETED: Numerical scores and justification remarks submitted; scorecard locked against edits.
- RECUSED: Evaluator recuses from scoring; proposal returned to department queue for reassignment.

---

## 4. Core Functional Modules

### 4.1 Evaluations Queue (`/evaluator/queue`)
- Central workspace listing all pending, in-progress, and completed technical assessments.
- Real-time SLA tracking: statutory 14-day evaluation countdown per assigned submission.
- Quick indicators: Problem statement reference, submission date, review status, and assigned date.

### 4.2 Conflict of Interest & Recusal Gate
- Statutory compliance checkpoint presented prior to opening any proposal technical dossier.
- Declaration options:
  - Formal Certification: "I certify that I have no financial interest, prior employment, advisory role, or personal relationship with the applicant entity."
  - Formal Recusal: "I declare a potential conflict of interest and recuse myself from evaluating this proposal."
- Submitting a recusal automatically unassigns the evaluator, logs the event in the forensic audit ledger, and notifies the department nodal desk.

### 4.3 Double-Blind Technical Review Room (`/evaluator/evaluate/:submissionId`)
- Anonymized Presentation:
  - Startup company name, registration numbers, founders, and contact details are masked.
  - Solution title, technical abstract, system architecture diagrams, and milestone schedules are presented objectively.
- Evidence Vault Inspection:
  - Evaluator downloads and inspects verified technical blueprints, benchmark test reports, and lab data.
  - Cryptographic verification: Client displays SHA-256 integrity verification confirming files have not been altered since initial submission.
  - Interactive external links: Direct access to live prototypes, code repositories, or video demonstrations.

### 4.4 Multi-Pillar Rubric Scoring Engine
Evaluators grade proposals against four standardized statutory evaluation criteria:
1. Technical Architecture and Feasibility (0 to 35 Points):
   - Structural design, API scalability, compute throughput, and latency SLA compliance (<250ms).
   - Compatibility with Maharashtra State Data Centre (SDC) guidelines and sovereign data residency.
2. Innovation and Distinct Novelty (0 to 25 Points):
   - IP strength, algorithmic uniqueness, and superiority over existing commercial alternatives.
3. Statutory and Operational Readiness (0 to 20 Points):
   - Security standards (ISO 27001, CERT-In compliance), reliability, and maintainability.
4. 90-Day Field Sandbox Pilot Viability (0 to 20 Points):
   - Feasibility of completing proposed milestone deliverables within the 90-day sandbox compact period.
- Minimum passing threshold: Configurable by department (default: 70/100 aggregate points).
- Qualitative Justification: Mandatory point-wise narrative justifying the score awarded for each pillar, including recommendations for nodal officer scrutiny.

---

## 5. API Surface

| Method | Endpoint | Description | Authorization |
|---|---|---|---|
| GET | `/api/v1/evaluations/queue` | List submissions assigned to the authenticated evaluator | EVALUATOR |
| GET | `/api/v1/evaluations/submission/:id` | Fetch anonymized submission dossier and rubric criteria | EVALUATOR (Assigned) |
| POST | `/api/v1/evaluations/submission/:id/recuse` | Submit formal recusal declaration | EVALUATOR (Assigned) |
| POST | `/api/v1/evaluations` | Submit finalized rubric score and qualitative assessment | EVALUATOR (Assigned) |
| GET | `/api/v1/evaluations/:id` | View submitted scorecard (read-only) | EVALUATOR (Author) |

---

## 6. Security, Immutability, and Audit

1. Blind Review Protocol: Evaluators cannot access applicant corporate identifiers. This prevents bias toward established vendors or known personal contacts.
2. Independent Scoring Isolation: Evaluators operate in blind isolation; neither scores nor notes from co-evaluators are accessible during the evaluation period.
3. Scorecard Immutability: Once `POST /api/v1/evaluations` is completed, the scorecard record is locked. Edits or modifications cannot be performed without formal administrative review and audit trail logging.
4. Audit Trail Recording: Every view, file download, recusal, and score submission generates a timestamped log containing user identity, IP address, request trace ID, and cryptographic checksums.
