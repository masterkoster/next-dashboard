# Lint/Type Error Remediation Plan

## Overview
Create a concise, verifiable plan to fix all ESLint and TypeScript errors across the repo without changing source code during planning. This plan sequences work to reduce risk and rework while keeping frontend and backend scopes clear.

## Project Type
WEB (Next.js app with Node/TS tooling)

## Scope
- In scope: All ESLint rule violations and TypeScript type errors across app, scripts, hooks, middleware, and config files covered by current ESLint/TS config.
- Out of scope: Feature changes, refactors unrelated to lint/type, dependency upgrades unless required to resolve lint/type, and any runtime behavior changes not needed to satisfy lint/type rules.

## Success Criteria
- `npm run lint` reports zero errors.
- `npx tsc --noEmit` reports zero type errors (or project-specific typecheck command if defined).
- No changes to runtime behavior beyond fixes required to satisfy lint/type checks.

## Tech Stack
- Next.js 16.x, React 19, TypeScript 5, ESLint 9 with `eslint-config-next` (core-web-vitals + typescript).
- Rationale: Matches current repo tooling (package.json + eslint.config.mjs).

## File Structure (Planning Artifacts)
```
./lint-fix-plan.md
```

## Priorities by Rule Category
1. **TypeScript correctness (P0)**
   - Rules: `@typescript-eslint/*`, TS compiler errors (type mismatches, missing types, unreachable code).
   - Rationale: Type errors often cascade into lint errors and runtime risk.
2. **Next.js/React correctness (P0/P1)**
   - Rules: `react-hooks/*`, Next-specific `@next/next/*` (e.g., image/link usage, head usage).
   - Rationale: Directly affects runtime and framework compliance.
3. **Error-preventing ESLint rules (P1)**
   - Rules: `no-unused-vars`, `no-undef`, `no-redeclare`, `no-fallthrough`.
   - Rationale: Prevents bugs and aligns with compiler assumptions.
4. **Code quality/style (P2)**
   - Rules: `prefer-const`, `no-console` (if enforced), stylistic rules.
   - Rationale: Lowest risk, can be cleaned after correctness.

## Sequencing (Frontend vs Backend)
1. **Shared/Config First**
   - Fix TypeScript config errors and shared types to prevent cascading issues.
2. **Frontend (App/UI)**
   - Resolve React/Next lint and TS issues in `app/`, `components/`, `hooks/`.
3. **Backend/Server**
   - Address lint/type errors in `scripts/`, `middleware.ts`, `prisma/`, and any API routes.
4. **Cleanup Pass**
   - Resolve remaining stylistic/low-priority lint warnings.

## Task Breakdown
### Task 1: Establish baseline error inventory
- **task_id:** T1
- **name:** Capture ESLint + TypeScript error lists
- **agent:** test-engineer (or developer)
- **priority:** P0
- **dependencies:** None
- **INPUT → OUTPUT → VERIFY:**
  - Input: Current repo state, lint/type scripts
  - Output: Saved error summaries grouped by category and path
  - Verify: Error counts captured for both ESLint and tsc
- **Rollback:** N/A (read-only)

### Task 2: Classify errors by rule category and location
- **task_id:** T2
- **name:** Categorize errors (TS, React/Next, error-preventing, style)
- **agent:** frontend-specialist
- **priority:** P0
- **dependencies:** T1
- **INPUT → OUTPUT → VERIFY:**
  - Input: Error inventory
  - Output: Categorized list with path mapping (frontend vs backend)
  - Verify: Every error mapped to category + area
- **Rollback:** N/A (planning)

### Task 3: Fix TypeScript correctness (shared/config)
- **task_id:** T3
- **name:** Resolve P0 TS errors in shared/config
- **agent:** backend-specialist
- **priority:** P0
- **dependencies:** T2
- **INPUT → OUTPUT → VERIFY:**
  - Input: TS error list (shared/config)
  - Output: Updated typings/config to zero TS errors in shared/config
  - Verify: `npx tsc --noEmit` shows reductions/zero in shared/config
- **Rollback:** Revert targeted files if type changes cascade

### Task 4: Fix frontend React/Next lint + TS errors
- **task_id:** T4
- **name:** Resolve P0/P1 frontend issues in app/components/hooks
- **agent:** frontend-specialist
- **priority:** P1
- **dependencies:** T3
- **INPUT → OUTPUT → VERIFY:**
  - Input: Frontend error list
  - Output: Updated frontend code with zero P0/P1 errors
  - Verify: `npm run lint` shows only backend/style errors (if any)
- **Rollback:** Revert file-level changes, keep shared fixes

### Task 5: Fix backend/server lint + TS errors
- **task_id:** T5
- **name:** Resolve backend issues in scripts/middleware/prisma
- **agent:** backend-specialist
- **priority:** P1
- **dependencies:** T3
- **INPUT → OUTPUT → VERIFY:**
  - Input: Backend error list
  - Output: Updated backend code with zero P0/P1 errors
  - Verify: `npm run lint` shows only style warnings (if any)
- **Rollback:** Revert backend-specific files

### Task 6: Style/quality cleanup
- **task_id:** T6
- **name:** Resolve remaining P2 style rules
- **agent:** frontend-specialist
- **priority:** P2
- **dependencies:** T4, T5
- **INPUT → OUTPUT → VERIFY:**
  - Input: Remaining lint warnings
  - Output: Zero lint warnings
  - Verify: `npm run lint` passes cleanly
- **Rollback:** Revert stylistic edits if needed

## Phase X: Verification
- [ ] Run `npm run lint` → zero errors
- [ ] Run `npx tsc --noEmit` → zero errors
- [ ] Spot-check impacted files for no unintended behavior changes

## ✅ PHASE X COMPLETE
- Lint: ☐ Pass
- Typecheck: ☐ Pass
- Date: __________
