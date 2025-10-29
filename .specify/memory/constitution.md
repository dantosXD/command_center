<!--
Sync Impact Report
Version change: 1.0.0 -> 1.0.1
Modified principles: none
Added sections: none
Removed sections: none
Templates requiring updates:
- ✅ .specify/templates/tasks-template.md (tests now mandatory per constitution)
- ✅ .specify/templates/plan-template.md (no change)
- ✅ .specify/templates/spec-template.md (no change)
Follow-up TODOs: none
-->

# Command Center Constitution

## Core Principles

### I. Deterministic Correctness

- All changes MUST start from executable requirements: failing tests or documented defects.
- Business rules MUST be encoded in automated tests before implementation (red-green-refactor).
- Production incidents MUST yield regression coverage before fixes ship.

### II. Defense-in-Depth with Row-Level Security

- Row-Level Security MUST protect every data store or view that surfaces user data; no table ships without explicit policies.
- Secrets and credentials MUST stay in managed vaults; repositories and CI logs remain secret-free.
- Security reviews MUST cover threat models for each new surface prior to rollout.

### III. Accessible by Default

- User experiences MUST meet WCAG 2.2 AA, validated by automated and manual audits.
- New UI work MUST include accessibility acceptance criteria and a keyboard-only success path.
- Accessibility regressions block release until resolved.

### IV. Incremental Delivery Behind Feature Flags

- Net-new capabilities ship behind reversible feature flags with staged rollout plans.
- Flags MUST support per-tenant overrides and automatic rollback triggers.
- Retire flags within one milestone after general availability, documenting sunset steps.

### V. Idempotent and Recoverable Operations

- Background jobs, queues, and workflows MUST be idempotent and safely retryable.
- Persistent operations MUST rely on strongly consistent transactions or compensating actions.
- Disaster recovery drills MUST validate restore procedures quarterly.

### VI. Reproducible Build & Release Pipeline

- Builds MUST be deterministic through pinned dependencies and hermetic toolchains.
- CI/CD pipelines MUST capture artifact provenance and replay the same commit with identical outputs.
- Infrastructure as Code MUST ship with validation proving idempotent apply results.

### VII. Comprehensive Test Discipline

- Every change MUST provide unit, contract, and row-level security tests plus e2e smoke coverage in CI before merge.
- CI pipelines MUST fail when mandatory suites are missing or skipped.
- Test ownership MUST be documented so failures are triaged within one business day.

## Quality Gates & Testing Mandates

- Definition of Done includes passing unit, contract, RLS, and e2e smoke suites plus accessibility audits for UI work.
- Code review checklists MUST confirm tests fail before implementation and pass afterward.
- Security and privacy impact assessments MUST be logged for features touching personal or regulated data.

## Delivery Workflow & Compliance

- Work items progress in small, mergeable increments protected by feature flags.
- Each architectural decision MUST be recorded as an ADR in `/docs/adr` before merge, citing relevant principles.
- Release notes MUST enumerate active feature flags, rollout status, and recovery procedures.

## Governance

- This constitution supersedes other practices; exceptions require documented approval.
- Amendments demand an ADR with rationale, version update, and approval from engineering and security leads.
- Versioning follows semantic rules: MAJOR for principle rewrites/removals, MINOR for additions, PATCH for clarifications.
- Compliance audits occur quarterly; findings enter the backlog with accountable owners.

**Version**: 1.0.1 | **Ratified**: 2025-10-27 | **Last Amended**: 2025-10-28
