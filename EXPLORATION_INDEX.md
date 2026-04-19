# AlgoArena Submission System - Exploration Index

This directory now contains a complete analysis of the AlgoArena submission system.

## Documents Overview

### 1. **QUICK_SUMMARY.txt** (START HERE - 5 min read)
Quick reference guide with:
- Status of each feature (✅ ❌ ⚠️)
- RUN flow overview
- Starter code gaps
- Problem model fields
- Post-submission display info
- Worker execution details
- Status tracking
- Critical gaps summary
- Implementation roadmap for starter code

**Best for:** Getting a high-level understanding quickly

---

### 2. **SUBMISSION_SYSTEM_ANALYSIS.md** (15 min read)
Comprehensive technical analysis including:
- **RUN Submission Flow** - Complete step-by-step process from UI to execution
- **Starter Code Mechanism** - What's missing and why
- **Problem Model Schema** - Current fields and what's needed
- **Submissions Page/Component** - Current display capabilities
- **Worker Execution** - Docker-based testing logic
- **Status Tracking & Results Display** - Database + frontend tracking
- **Key Findings Summary Table** - Status of each feature
- **Submission API Flow Diagram** - Visual flow of data
- **Database Connections** - Model relationships

**Best for:** Understanding technical details and architecture

---

### 3. **FILE_MAPPING.md** (20 min read - MOST DETAILED)
Complete file-by-file breakdown:
- **Frontend Components** - CodeEditor, TestCases, ResizableLayout, ProblemPanel
- **Problem Pages** - Regular problems, contest problems, admin pages
- **Backend APIs** - Submission creation, status polling, problem management
- **Worker & Queue** - Job processing, execution logic
- **Database Schema** - Full Prisma model definitions with annotations
- **Data Flow Summary** - Complete submission flow diagram
- **Broken/Incomplete Flows** - What doesn't work yet
- **Critical Integration Points** - How components connect
- **Language Support Issue** - Frontend vs backend mismatch

**Best for:** Deep technical investigation and implementation planning

---

## Key Findings at a Glance

| Component | Status | Notes |
|-----------|--------|-------|
| RUN Feature | ✅ Working | Sample tests only, 2-second polling |
| Starter Code | ❌ Missing | No DB field, no UI, no API |
| Test Results Display | ⚠️ Partial | Only PASS/FAIL shown, not details |
| Worker Isolation | ✅ Robust | Docker containers with resource limits |
| Contest Integration | ✅ Working | Score tracking on first solve |
| Error Messages | ❌ Missing | Failures not explained to users |
| Test Case Breakdown | ❌ Missing | Can't see which test failed |

---

## Quick Facts

### RUN Submission Flow
```
User Code → POST /api/v1/submissions → BullMQ Queue → Worker (Docker)
                                                      ↓
                                           Sample Tests Execution
                                                      ↓
                                           PASSED/FAILED Status Update
                                                      ↓
                                           Frontend Polling (2s interval)
                                                      ↓
                                           Result Dialog Shown
```

### Starter Code Implementation Checklist
- [ ] Add `starterCode: String?` to Problem model (schema.prisma)
- [ ] Run Prisma migration
- [ ] Add textarea field to ProblemEditor.tsx
- [ ] Update admin API to include starterCode
- [ ] Fetch starterCode in problem queries
- [ ] Pass to CodeEditor component
- [ ] Initialize editor with template || starterCode

### Files to Modify for Starter Code
1. `/packages/database/prisma/schema.prisma` - Add field
2. `/apps/web/app/admin/problems/components/ProblemEditor.tsx` - Add UI
3. `/apps/web/app/api/v1/admin/problems/[id]/route.ts` - Handle in API
4. `/apps/web/app/problems/[title]/page.tsx` - Fetch it
5. `/apps/web/app/contests/[id]/problems/[order]/page.tsx` - Fetch it
6. `/apps/web/components/ResizableLayout.tsx` - Pass to CodeEditor

---

## Architecture Layers

### Frontend (React/Next.js)
- CodeEditor.tsx - User input & submission
- TestCases.tsx - Test case display (disconnected)
- ResizableLayout.tsx - Container layout
- ProblemPanel.tsx - Problem description

### API Layer (Next.js Route Handlers)
- POST /api/v1/submissions - Create submission
- GET /api/v1/submissions/{id} - Poll status
- PUT /api/v1/admin/problems/{id} - Update problem
- GET /api/v1/problems/{id} - Fetch problem details

### Job Queue (BullMQ + Redis)
- Queue name: "submission-queue"
- Host: localhost:6379
- Concurrency: 5 workers

### Background Worker (Node.js)
- Listens to submission-queue
- Executes code in Docker (node:18)
- Updates submission status
- Updates contest scores

### Database (PostgreSQL + Prisma)
- Submission model - Stores code & status
- Problem model - Problem definition (needs starterCode field)
- TestCase model - Input/output pairs
- ContestParticipant model - Score tracking

---

## Critical Gaps

### 1. Backend Doesn't Receive Submission Type
- Frontend encodes it but doesn't send
- Backend always defaults to RUN
- Workaround: Add type to API payload

### 2. Test Results Not Captured
- Only status (PASS/FAIL) stored
- No details about which test failed
- No error output captured
- TestCases component shows mock data

### 3. Starter Code Completely Missing
- No database field
- No admin UI to set it
- No API endpoint
- Users always start with blank editor

### 4. Result Display Minimal
- Only generic success/failure message
- No execution details
- No test case breakdown
- No error explanation

### 5. Language Support Broken
- Frontend shows 5 languages
- Backend only supports JavaScript
- Worker only executes JavaScript
- Other languages appear to work but fail silently

---

## Next Steps

### If Adding Starter Code:
1. See QUICK_SUMMARY.txt "NEXT STEPS FOR STARTER CODE FEATURE"
2. Detailed implementation guide in FILE_MAPPING.md
3. All required files listed above

### If Improving Test Results Display:
1. Modify worker to capture detailed results
2. Add testCaseResults field to Submission model
3. Update API to return detailed results
4. Connect TestCases.tsx to real data

### If Fixing Language Support:
1. Add language enums to backend
2. Create language-specific Docker images
3. Modify worker to use correct image
4. Send language selection to backend

---

## Document Quick Links

- **Implementation Details**: See FILE_MAPPING.md sections:
  - "CodeEditor ↔ Problem Data"
  - "CodeEditor ↔ Backend"
  - "Worker ↔ Database"
  - "TestCases ↔ Results"

- **Complete Flow**: See SUBMISSION_SYSTEM_ANALYSIS.md:
  - "SUBMISSION API FLOW DIAGRAM"
  - "Complete Submission Flow" in FILE_MAPPING.md

- **Database Schema**: See FILE_MAPPING.md:
  - "Prisma Schema" section with full model definitions

- **Status Tracking**: See SUBMISSION_SYSTEM_ANALYSIS.md:
  - "POST-SUBMISSION STATUS TRACKING & RESULTS DISPLAY"

---

## Files Analyzed

### Frontend
- /apps/web/components/CodeEditor.tsx (210 lines)
- /apps/web/components/TestCases.tsx (125 lines)
- /apps/web/components/ResizableLayout.tsx (103 lines)
- /apps/web/components/ProblemPanel.tsx (167 lines)

### Backend APIs
- /apps/web/app/api/v1/submissions/route.ts (111 lines)
- /apps/web/app/api/v1/submissions/[jobId]/route.ts (53 lines)
- /apps/web/app/api/v1/admin/problems/[id]/route.ts (112 lines)
- /apps/web/app/api/v1/users/[id]/stats/route.ts (175 lines)

### Worker
- /apps/worker/src/index.ts (219 lines)
- /packages/queue/src/index.ts (8 lines)

### Database
- /packages/database/prisma/schema.prisma (150 lines)

### Pages
- /apps/web/app/problems/[title]/page.tsx (173 lines)
- /apps/web/app/contests/[id]/problems/[order]/page.tsx (263 lines)
- /apps/web/app/admin/problems/components/ProblemEditor.tsx (453 lines)

**Total Lines Analyzed**: 2,542 lines

---

## How to Use These Documents

1. **For a 5-minute overview**: Read QUICK_SUMMARY.txt
2. **For implementation planning**: Use FILE_MAPPING.md as reference
3. **For deep technical understanding**: Study SUBMISSION_SYSTEM_ANALYSIS.md
4. **For code changes**: Locate files in "Files Analyzed" section above

---

**Analysis Date**: April 19, 2026
**Status**: Complete - Ready for implementation
