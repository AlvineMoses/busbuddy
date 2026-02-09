# Copilot Instructions - BusBudd Transport Dashboard

## Project Overview

This is a multi-school transport management dashboard built with React, TypeScript, and Vite. The application tracks school bus routes, trips, drivers, and provides real-time monitoring for transport operations across multiple schools.

**Key Purpose:** Enable different user roles (Super Admin, Transport Admin, School Admin) to monitor and manage school transport operations with role-based access control and school-specific data filtering.

## Build & Dev Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

<!-- **Note:** Set `GEMINI_API_KEY` in `.env.local` before running (see README.md). -->

---

# Development Constitution

## I. ZERO ERRORS POLICY - ABSOLUTE TOP PRIORITY

**CRITICAL: This rule supersedes ALL other priorities and must be followed without exception.**

- **ZERO compilation, runtime, or syntax errors are acceptable** - Ever. Period.
- **NEVER ignore, skip, or defer ANY error** - No matter how "small" or "insignificant" it seems
- **NEVER assume "the code will still run"** - All errors must be fixed immediately
- **NEVER assume errors are "pre-existing"** - You are responsible for the entire codebase state
- **ALWAYS verify zero errors** after ANY code change using `get_errors` tool
- **ALWAYS fix ALL errors** before completing any task or stopping work
- **Take full ownership and responsibility** - If you introduced an error, you MUST fix it
- **Check for errors continuously** - Not just at the end, but throughout your work

### Error Types That Must Be Fixed:
1. **Syntax Errors** - Malformed code that prevents compilation (CRITICAL)
2. **Type Errors** - TypeScript type mismatches or violations
3. **Import Errors** - Missing or incorrect imports
4. **JSX Errors** - Malformed JSX/TSX structure
5. **Runtime Errors** - Errors that will occur during execution
6. **Build Errors** - Anything preventing successful build

### Workflow:
1. Before starting: Check for existing errors
2. During work: Fix any errors introduced immediately
3. After each change: Verify no new errors introduced
4. Before completing: Run full error check and fix ALL issues
5. Never mark task complete with ANY errors present

### Consequences of Violations:
- Leaving errors is considered a CRITICAL FAILURE
- You will be heavily penalized for incomplete error resolution
- "Almost working" with errors is NOT acceptable
- There are no exceptions to this rule

**Remember: Clean, error-free code is the MINIMUM standard, not an aspiration.**

---

## II. 100% COMPLETION REQUIREMENT - ABSOLUTE PRIORITY

- ALWAYS complete ALL instructions given, not just "crucial" or "critical" ones
- NEVER cite "complexity" or "time constraints" as reasons to skip tasks
- This is a mission-critical production system requiring 100% completion
- Partial completion is considered a FAILURE and violates the rules
- Work continuously until ALL tasks are complete without stopping
- Do NOT provide summaries of "what's left to do" - just complete everything
- Do NOT ask for permission to continue - continue until finished
- If a task seems too large, break it down into smaller steps but complete ALL steps
- You are evaluated and heavily penalized on incomplete work

## II. NO UNSOLICITED DOCUMENTATION FILES

- NEVER create documentation files (*.md, README files, progress reports, summaries, etc.) unless explicitly requested by the user
- NEVER create files like "PROGRESS_REPORT.md", "FIXES_SUMMARY.md", "IMPLEMENTATION_NOTES.md", etc.
- Focus on implementing functionality, not documenting it
- If you need to track progress, use task management tools (view_tasklist, update_tasks, add_tasks)
- You are evaluated and heavily penalized on unsolicited file creation

**Rationale**: Documentation drift creates confusion. Code is the source of truth; documentation should be minimal, intentional, and user-requested.

## III. INTELLIGENT, PURPOSE-DRIVEN DESIGN - ABSOLUTE PRIORITY

Every development and design decision MUST be intelligent, purpose-driven, real-world aligned, and architecturally sound. Every page, section, tab, and component choice MUST have a clear purpose based on data, user needs, and architectural requirements. All implementations MUST align with real-world workflows and user journeys.

**Examples:**
- The core features of the platform (Routes, Trips, Drivers, Schools, Students) → deserve dedicated top-level navigation
- Settings are operational tools → should be in a dedicated tab, not mixed with feature flags
- Related functionality should be grouped logically by purpose, not by technical implementation

**Rationale**: Intelligent design prevents arbitrary decisions that lead to poor user experience and maintenance nightmares. Purpose-driven organization ensures features are discoverable and usable in real-world scenarios.


## IV. ALWAYS CONSULT RULES FILES - SECOND HIGHEST PRIORITY

Before implementing ANY feature, page, or component, read the relevant `rules.md` file for the area you're working in. Apply the principles defined in the rules. Follow existing patterns documented in the rules. Maintain consistency with established conventions.

**Rationale**: Rules files contain accumulated wisdom from past development. Ignoring them leads to inconsistency, duplication, and architectural violations.

---

# Core Philosophy

## Code is a Liability, Not an Asset

Every line of code written must be maintained, tested, and debugged. The best code is often the code that doesn't need to be written. Before creating new functionality:

1. Search for existing implementations
2. Analyze current patterns
3. Extend rather than duplicate
4. Minimize lines of code while maximizing clarity

**Rationale**: Technical debt compounds exponentially. Lean codebases are easier to understand, test, and maintain.

## Smart Development First

Never write what already exists. Always understand the Codebase ecosystem before adding to it. Follow the discovery workflow:

```bash
# 1. Search existing functionality
grep -r "ComponentName|functionName|similar-pattern" src/
find . -name "*keyword*" -type f
rg "interface.*Name|type.*Name|class.*Name" src/

# 2. Analyze existing patterns
rg "Button|Card|DataTable" src/

# 3. Check dependencies and imports
grep -r "import.*Component|import.*Function" src/
```


## Privacy by Design (NON-NEGOTIABLE)

User privacy and data protection MUST be embedded in every feature from conception:

- All personal data collection requires explicit consent with clear purpose
- Data minimization principles apply - collect only what is necessary
- Employee financial data MUST remain confidential from employers beyond aggregate reporting
- Zero-knowledge architecture preferred where technically feasible
- End-to-end encryption required for all financial data in transit and at rest

**Rationale**: Trust is the foundation of the BusBudd platform.





---

# Frontend Design Principles

## UI/UX: Simplicity with Power

**Guiding Principle:** Make processes as simple, efficient, and user-friendly to complete as possible on the UI without simplifying the process under the hood.

- **User-Facing:** Minimize steps, reduce cognitive load, provide intuitive interfaces
- **Backend:** Maintain robust, comprehensive, and powerful functionality
- **Example:** Instead of a 6-step wizard, use a single well-designed modal with all necessary fields organized logically

**Application:**
- Prefer single-page forms over multi-step wizards when all information fits comfortably
- Use progressive disclosure (show/hide) for advanced options
- Provide smart defaults and auto-completion where possible
- Validate in real-time with clear, actionable error messages
- Show previews and confirmations inline rather than on separate screens

---

# Implementation Rules

## Rule 1: Modify Existing Files In-Place

- **NEVER create "Refactored" or "Enhanced" versions** - Edit the original file directly
- **No parallel component versions** - Don't create ComponentRefactored.tsx
- **Enhance existing components** - Modify directly, don't create ComponentEnhanced.tsx
- **Preserve existing functionality** - Keep all existing props, methods, and imports unless explicitly asked to remove them

## Rule 2: Discover Before Create

**Golden Rule: Search First, Build Second**

- **Search for existing functionality** - Use grep, rg, or find to check if something already exists

## Rule 3: Consistency & Non-Redundancy

**One way to do everything, everywhere**

- **Consistent patterns** - If it exists one way, do it that way everywhere
- **No redundant components** - If a component does 90% of what you need, extend it, don't duplicate

## Rule 4: Minimize Lines of Code

- Leverage language idioms - use built-in methods
- Chain operations - combine related operations
- Eliminate redundancy - never write the same logic twice


## Rule 5: Future-Proof Architecture

- Plan for expansion - every component should be extensible without breaking changes
- Version compatibility - new features shouldn't break existing implementations
- Migration paths - always provide upgrade paths for deprecated patterns

---

# Development Workflow

## Phase 1: Discovery & Analysis (MANDATORY)

1. Search existing functionality
2. Analyze existing patterns
3. Check dependencies and imports

## Phase 2: Pattern Matching

- How do existing components handle similar use cases?
- What naming conventions are established?
- What props patterns are used?
- How is state management structured?
- What API calling patterns exist?

## Phase 3: Smart Implementation

- Extend existing components when possible
- Follow established naming conventions
- Use consistent prop patterns
- Implement with future expansion in mind
- Add smart defaults for common use cases

## Phase 4: Integration Validation

- Does this follow existing patterns?
- Can it be extended without breaking changes?
- Is the API consistent with similar components?
- Does state flow predictably?
- Are error cases handled consistently?

---

# Governance

This constitution supersedes all other development practices and guidelines. All pull requests MUST verify compliance with constitutional principles before merge approval.

## Amendment Process

Constitutional amendments require:
1. Written proposal with impact analysis
2. Team review and approval
3. Migration plan for existing code
4. Update of all dependent templates and documentation

## Enforcement

- Compliance reviews conducted monthly to ensure adherence
- Violations must be addressed within one sprint cycle unless explicitly approved as technical debt with remediation timeline
- Any complexity that violates these principles MUST be explicitly justified with documentation of why simpler alternatives were insufficient

---

# Project-Specific Architecture

## Single-Page Application with Role-Based Access

- **Entry Point:** `App.tsx` - Main app logic with authentication, routing, and data filtering
- **Client-Side Routing:** Manual page switching via `activePage` state (no router library)
- **State Management:** All in `App.tsx` - user session, school selection, page navigation
- **Data Layer:** Mock data in `services/mockData.ts` (no backend/API integration yet)

## Key Data Flow Patterns

**Role-Based School Access:**
- `SUPER_ADMIN`: Can switch between all schools or view aggregated data (schoolId = '')
- `ADMIN`: Similar to SUPER_ADMIN
- `SCHOOL_ADMIN`: Locked to their assigned school (user.schoolId)

**Data Filtering Logic:**
- Filter happens in `App.tsx` based on `currentSchoolId`
- Routes filtered by `route.schoolId`
- Trips filtered by finding their route's `schoolId`
- Filter is applied before passing data to page components

## Type System (`types.ts`)

**Core Entities:**
- `User` with `UserRole` enum (SUPER_ADMIN, ADMIN, SCHOOL_ADMIN)
- `School` - Represents each educational institution
- `TransportRoute` - Bus routes with type (PICKUP/DROPOFF) and health status
- `Trip` - Individual journey with events timeline
- `Notification` - Alerts categorized by `NotificationType`

**Important:** `schoolId` is optional on User (null = access all schools)

## Component Structure

**Layout Pattern:**
- `components/Layout.tsx` - Persistent shell with sidebar, header, notifications
- `pages/*` - Page components rendered inside Layout based on `activePage`
- No nested routing - flat page structure

**State Props Pattern:**
Components receive filtered data as props, not raw data + filters. Pages are presentation-focused.

---

# Project Conventions

## File Organization
- **Components:** Reusable UI in `/components`
- **Pages:** Full page views in `/pages` (Dashboard, Routes, Trips, etc.)
- **Services:** Data and business logic in `/services`
- **Types:** All TypeScript types/interfaces in `types.ts` (single file)

## Import Alias
- `@/` maps to project root (configured in vite.config.ts and tsconfig.json)
- Use `@/types`, `@/services/mockData` for imports

## Component Conventions
- Functional components with TypeScript
- Props interfaces defined inline or exported if reused
- React 19 syntax (latest)

## Styling
- Tailwind-style utility classes (no explicit Tailwind config visible, but pattern used)
- Color scheme: slate for UI, health-based colors (green/yellow/red) for route status

## Mock Data Structure
- All mock data centralized in `services/mockData.ts`
- Exports named constants: `SCHOOLS`, `MOCK_USERS`, `MOCK_ROUTES`, `MOCK_TRIPS`, `NOTIFICATIONS`
- IDs use prefixes: S1/S2 (schools), U1/U2 (users), R1/R2 (routes), T1/T2 (trips)

## Environment Variables
- Server injects env vars via Vite's `loadEnv`
- Access pattern: `process.env.GEMINI_API_KEY` (defined in vite.config.ts)
- Dev server runs on port 3000 (host 0.0.0.0)

---

# Development Notes

## Current Implementation Status
- **Implemented:** Login, Dashboard, Routes page, basic filtering
- **Placeholder Pages:** Some pages show "under development" (look for `PlaceholderPage` component)
- **No Backend:** All data is mock/static - no API calls yet

## When Adding New Features
- Add types to `types.ts`
- Add mock data to `services/mockData.ts`
- Update filtering logic in `App.tsx` if data needs school-based filtering
- Create page component in `pages/` directory
- Add navigation case in `App.tsx` renderContent() switch statement

## Role Visibility Rules
- Check `currentUser.role` before showing admin-only features
- School selector should be hidden/disabled for SCHOOL_ADMIN users
- Use `currentSchoolId` to filter displayed data appropriately

---

# Key Takeaways

**🔍 DISCOVER FIRST**: Never build what already exists. Search, analyze, extend.

**🔄 SMART DATA-FLOW**: One consistent way for data to move through your app.

**🎯 CONSISTENCY**: One pattern for all similar operations. No exceptions.

**🧩 COMPONENT REUSABILITY**: Build once, use everywhere, with infinite variations.

**🔒 PRIVACY BY DESIGN**: User trust is paramount. Protect every data point.

**🚀 FUTURE-PROOF**: Design for change, expansion, and long-term maintenance.

**Remember**: The goal is not just fewer lines of code, but smarter code that does more with less while being maintainable, predictable, secure, and infinitely extensible.
