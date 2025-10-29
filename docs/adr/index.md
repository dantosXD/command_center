# Architectural Decision Records (ADRs)

This directory contains architectural decisions made during the development of Command Center MVP.

ADRs document the reasoning behind significant technical decisions that affect the system's architecture, design, or operations.

## ADR Index

| # | Title | Status | Date | Component |
|---|-------|--------|------|-----------|
| 001 | Central Hub Architecture | Accepted | 2025-10-28 | Core |
| 002 | Row-Level Security Strategy | Accepted | 2025-10-28 | Security |
| 003 | Notification Outbox Pattern | Accepted | 2025-10-28 | Backend |
| (TBD) | [More decisions to be added] | - | - | - |

---

## Recent ADRs

### ADR-001: Central Hub Architecture

**Status**: Accepted
**Date**: 2025-10-28

Establishes the architecture for the central hub feature that aggregates tasks and events across domains.

**Key Decisions**:
- Use Supabase PostgREST for hub aggregation RPC
- Implement feature flags for incremental rollout
- Realtime subscriptions for live updates

**See**: [001-central-hub-architecture.md](./001-central-hub-architecture.md)

---

### ADR-002: Row-Level Security Strategy

**Status**: Accepted
**Date**: 2025-10-28

Defines how Row-Level Security (RLS) is implemented to enforce data isolation between workspaces and domains.

**Key Decisions**:
- RLS on all tables (mandatory per Constitution)
- Workspace and domain scoping
- Audit logging of RLS violations

**See**: [002-row-level-security.md](./002-row-level-security.md)

---

### ADR-003: Notification Outbox Pattern

**Status**: Accepted
**Date**: 2025-10-28

Implements the outbox pattern for reliable, idempotent notification delivery.

**Key Decisions**:
- pg_cron scheduler for job processing
- Outbox table for persistence
- Edge Functions for dispatch
- Support for email, Slack, in-app channels

**See**: [003-notification-outbox.md](./003-notification-outbox.md)

---

## How to Add an ADR

1. Copy [0000-template.md](./0000-template.md)
2. Rename to `00N-short-title.md` (increment the number)
3. Fill in the decision document
4. Update this index
5. Commit with message: `docs(adr): ADR-00N - [Title]`

## ADR Naming Convention

- File: `00N-short-kebab-case-title.md`
- Link text: `ADR-00N: Full Title`
- Example: `001-central-hub-architecture.md` → ADR-001: Central Hub Architecture

## Constitution Alignment

All ADRs must align with the 7 core principles in `.specify/memory/constitution.md`:

1. Deterministic Correctness
2. Defense-in-Depth Security
3. Accessible by Default
4. Incremental Delivery
5. Idempotent Operations
6. Reproducible Builds
7. Comprehensive Testing

---

## Review Process

ADRs are reviewed and approved through:

1. **Proposal**: Document decision and rationale
2. **Discussion**: Architecture team review
3. **Approval**: Tech lead sign-off
4. **Implementation**: Commit to codebase
5. **Closure**: Mark as Accepted or Superseded

---

## Status Meanings

- **Proposed**: Under discussion, not yet final
- **Accepted**: Approved and ready for implementation
- **Deprecated**: Superseded by newer ADR, kept for historical reference
- **Superseded by ADR-###**: Replaced by newer decision

---

Last Updated: 2025-10-28
