# Government Official Architecture and Authorization Guide

## 1. Role Overview and Persona
The Government Official role (`GOVERNMENT_USER`) represents authorized departmental nodal officers, ministry administrators, public procurement authorities, and mission directors. The role is designed to formulate civic challenges, enforce General Financial Rules (GFR Rule 173(i)) exemptions, establish technical evaluation rubrics, assign domain evaluators, analyze candidate applications using Explainable AI, and monitor 90-day sovereign sandbox field pilots.

---

## 2. Authentication and Authorization Model

### 2.1 Identity and Session Security
- Authentication: Secure local password authentication or authorized government identity federation via Google Workspace OAuth 2.0.
- Session Management:
  - Access Token: Short-lived in-memory JWT (15 minutes).
  - Refresh Token: Secure HTTP-only cookie with strict session validation against the `Session` model.
  - Revocation: Administrative or user-triggered logout immediately invalidates the database session.
- Role Identifier: `GOVERNMENT_USER`.
- Route Protection: Enforced via `authenticate` and `requireRole(["GOVERNMENT_USER", "ADMIN"])`.

### 2.2 Authorization Matrix
| Resource | Operation | Access Level | Constraints |
|---|---|---|---|
| Department Profile | Read / Update | Department Nodal | Scoped to affiliated department or ministry. |
| Challenge Statements | Create / Update | Department Nodal | Only drafts belonging to the officer's department can be edited. |
| Challenge Publication | Publish | Department Nodal | Moves challenge from DRAFT to PUBLISHED state; activates public visibility. |
| Evaluation Rubrics | Create / Update | Department Nodal | Configures weight distribution across technical, statutory, and pilot feasibility pillars. |
| Candidate Submissions | Read | Department Nodal | View proposals submitted against the department's challenges. |
| Evaluator Assignment | Assign | Department Nodal | Allocates accredited technical evaluators to candidate proposals. |
| Explainable AI Matching | Execute / Read | Department Nodal | Triggers LLM-assisted multi-dimensional alignment analysis. |
| Pilot Compacts | Approve / Verify | Department Nodal | Approves pilot milestones, verifies sensor evidence, and clears disbursements. |

---

## 3. Architecture and Data Flow

### 3.1 High-Level Flow
```
[Department Officer Client]
          |
          | 1. Authentication (JWT / Session)
          v
[API Gateway / Route Guards] -> requireRole(["GOVERNMENT_USER"])
          |
          +---> [Department Command Center]  -> Metrics, Pipeline Donut, Sector Analytics
          |
          +---> [Challenge Studio]           -> Problem Statement Formulation & Publishing
          |
          +---> [Rubric Service]             -> Weighted Scoring Criteria Definition
          |
          +---> [Matching Service (AI)]      -> Explainable Point-Wise Alignment Engine
          |
          +---> [Assignment Service]         -> Evaluator Allocation & Recusal Tracking
          |
          +---> [Pilot Verification]         -> 90-Day Field Sandbox & Milestone Approvals
```

### 3.2 Challenge Lifecycle Management
Department challenges proceed through three primary statutory phases:
```
[DRAFT] -----------> [PUBLISHED] -----------> [CLOSED]
   |                      |                      |
Formulate statement,   Active on catalog,     Deadline passed;
define rubric weights, accept startup         scoring and pilot
set budget & SLA.      proposals.             compacting active.
```

---

## 4. Core Functional Modules

### 4.1 Department Command Center (`/government/dashboard`)
- Executive Metrics:
  - Published Challenges (Active volume versus draft preparation).
  - Candidate Submissions (Aggregate proposals received across problem statements).
  - Pending Evaluation (Queue count awaiting double-blind technical review).
  - Active Field Pilots (Live sandbox deployments under departmental supervision).
- Challenges by Sector Focus:
  - Proportional bar chart displaying strategic domain allocation across GovTech, Defense, Health, Agriculture, and Urban Infrastructure.
- Applicant Pipeline Lifecycle:
  - Donut chart with centered volume indicator and structured legend list.
  - Real-time distribution across lifecycle states: Submitted, Under Review, Evaluated, Pilot Active, Pilot Completed, and Rejected.
- Challenge Statements Table: Quick actions for Rubric Configuration, AI Candidate Matching, and Challenge Publishing.
- Candidate Submissions Desk: Filter proposals by specific challenge statements, assign evaluators, and inspect evaluation scorecards.

### 4.2 Challenge Studio (`/government/challenges/new`)
- Problem Statement Formulation: Title, objective, short summary, detailed background, and expected public outcomes.
- Sector and Geographic Scope: Multi-sector tagging and Maharashtra district mapping (all 36 districts supported).
- Procurement Terms: Estimated budget range, procurement scale (R&D Grant, Challenge Procurement, Direct Pilot, Scale-Up), and statutory deadline.
- Statutory Exemption Flags: Explicit GFR Rule 173(i) clauses declaring 100% EMD waiver and prior turnover exemption for verified startups.

### 4.3 Evaluation Rubric Engine
- Configurable scoring rubrics attached to specific problem statements.
- Pillars evaluated:
  - Technical Capability and Architecture Alignment (Weight: 35%).
  - Innovation and Novelty of Approach (Weight: 25%).
  - Statutory and Public Procurement Compliance (Weight: 20%).
  - 90-Day Field Sandbox Pilot Feasibility (Weight: 20%).
- Maximum aggregate score: 100 points, mapped to passing thresholds for pilot shortlisting.

### 4.4 Explainable AI Candidate Matching (`/government/challenges/:id/matching`)
- Objective: Explainable technical decision support synthesizing deterministic scoring with generative analysis.
- Dimensions Covered:
  - Executive Evaluation Synthesis: Narrative summarizing readiness, scoring rationale, and sandbox viability.
  - Technical Architecture Alignment: Point-wise analysis of candidate tech stack, API throughput, and state data residency.
  - Statutory Compliance (GFR 173(i)): Verification of EMD waiver standing and DPIIT certification.
  - 90-Day Sandbox Pilot Viability: Milestone feasibility, testing environment dependencies, and municipal ingestion readiness.
  - Committee Scrutiny Items: Recommended interrogation questions for departmental scrutiny meetings.
  - Procurement Directives: Actionable next steps regarding pilot compact execution.
- Deterministic Pillars: 4-pillar progress breakdown comparing Technical Capability (35%), TRL Readiness (25%), Statutory Compliance (20%), and Deployment Feasibility (20%).

### 4.5 Evaluator Allocation
- Modal interface permitting officers to select accredited domain specialists from the platform registry.
- Enforces blind assignment protocols: evaluators are assigned without access to applicant corporate identities until recusal declarations are submitted.

---

## 5. API Surface

| Method | Endpoint | Description | Authorization |
|---|---|---|---|
| GET | `/api/v1/problems/department` | List department-specific challenges | GOVERNMENT_USER |
| POST | `/api/v1/problems` | Create new problem statement draft | GOVERNMENT_USER |
| PUT | `/api/v1/problems/:id` | Update challenge statement | GOVERNMENT_USER (Owner) |
| POST | `/api/v1/problems/:id/publish` | Publish challenge to public catalog | GOVERNMENT_USER (Owner) |
| POST | `/api/v1/problems/:id/rubrics` | Configure evaluation rubric criteria | GOVERNMENT_USER (Owner) |
| GET | `/api/v1/submissions/department` | List all candidate submissions | GOVERNMENT_USER |
| POST | `/api/v1/submissions/:id/assign-evaluator` | Assign evaluator to proposal | GOVERNMENT_USER |
| GET | `/api/v1/matching/:problemId` | Run Explainable AI matching analysis | GOVERNMENT_USER |
| POST | `/api/v1/pilots/:id/milestones/:mId/verify` | Verify milestone evidence and authorize payment | GOVERNMENT_USER |

---

## 6. Security, Audit, and Compliance

1. Departmental Data Segregation: Government officers are scoped strictly to their own ministry or departmental boundaries. Challenge formulation and proposal reviews cannot be modified by other departments.
2. Forensic Audit Trail: Every administrative action (challenge modification, publication, evaluator assignment, rubric weighting, and pilot approval) writes an immutable record to the audit logging system (`auditModel`).
3. GFR Rule 173(i) Compliance: Automatic statutory validation guarantees that qualifying startups are never excluded from procurement considerations due to turnover or prior operating history constraints.
4. Procurement Integrity: Double-blind scoring safeguards guarantee that officer interventions and evaluator scores remain independent and auditable throughout technical evaluation proceedings.
