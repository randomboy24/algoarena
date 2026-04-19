# AlgoArena Submission System - Complete File Mapping

## Frontend Components & Pages

### Code Editor & Submission UI
```
/apps/web/components/CodeEditor.tsx
├── Primary component for code submission
├── Props: template, problemId, contestId
├── Key Functions:
│   ├── submitCode() - Sends code to backend
│   ├── handleRun() - Initiates RUN submission
│   ├── handleReset() - Clears editor
├── Features:
│   ├── Monaco editor integration
│   ├── Language selector (dropdown)
│   ├── RUN & Reset buttons
│   ├── Result dialog modal (PASSED/FAILED)
│   ├── 2-second polling loop
└── Issue: 
    ├── template always "" (empty)
    └── Result dialog shows minimal info

/apps/web/components/TestCases.tsx
├── Displays test cases in tabs
├── Props: testCases array
├── Features:
│   ├── Tab selection for each test case
│   ├── Shows Input/Output/Explanation
│   ├── Mock runTests() function
│   └── testResults state (unused/mock)
└── Issue:
    ├── testResults never populated with real data
    └── Completely disconnected from execution results

/apps/web/components/ResizableLayout.tsx
├── Container for code editor + test cases
├── Props: leftPanel, rightPanel, contestId
├── Features:
│   ├── Horizontal & vertical resizing
│   ├── Passes empty template to CodeEditor
│   └── Passes problem to TestCases
└── Issue:
    └── template={""} hardcoded (line 76)

/apps/web/components/ProblemPanel.tsx
├── Left side: Problem description
├── Props: problem object
├── Features:
│   ├── Title & difficulty badge
│   ├── Description/Solution tabs
│   ├── Examples with explanations
│   ├── Constraints list
└── No issues - display only
```

### Problem Pages
```
/apps/web/app/problems/[title]/page.tsx
├── Regular problem page
├── Fetches problem from database
├── Passes to ResizableLayout
└── Issues:
    ├── Commented mock data (old)
    ├── No starter code retrieval

/apps/web/app/contests/[id]/problems/[order]/page.tsx
├── Contest problem page
├── Features:
│   ├── Contest access control
│   ├── Timer display
│   ├── Problem label (A, B, C...)
│   ├── Score display
│   └── Same issue with template=""
└── Uses ResizableLayout like regular problems
```

### Admin Pages
```
/apps/web/app/admin/problems/components/ProblemEditor.tsx
├── Create/Edit problem form
├── Props: problem, mode, onSuccess
├── Handles:
│   ├── Title, difficulty, description
│   ├── Examples (input/output/explanation)
│   ├── Test cases (input/output/isSample checkbox)
│   └── Constraints
├── Missing:
│   ├── Starter code field
│   └── Starter code language selector
└── API calls:
    ├── POST /api/v1/admin/problems (create)
    └── PUT /api/v1/admin/problems/{id} (edit)
```

---

## Backend APIs

### Submission Creation
```
/apps/web/app/api/v1/submissions/route.ts
├── POST endpoint
├── Receives:
│   ├── code (required)
│   ├── language (required, hardcoded to JAVASCRIPT)
│   ├── problemId (required)
│   └── contestId (optional)
├── Missing:
│   └── type parameter (should be: RUN | SUBMIT)
├── Process:
│   ├── Validate user (via @clerk/nextjs)
│   ├── Validate contest participation (if contestId provided)
│   ├── Create submission in DB
│   ├── Add job to BullMQ queue
│   └── Return submissionId
└── Issues:
    ├── Type never sent/received from frontend
    ├── Type defaults to RUN in schema
    └── No way to submit with type: SUBMIT

/apps/web/app/api/v1/submissions/[jobId]/route.ts
├── GET endpoint - Poll submission status
├── Returns:
│   └── { status: "PENDING" | "PASSED" | "FAILED" }
├── Missing:
│   ├── No detailed results
│   ├── No test case breakdown
│   ├── No error messages
│   └── No execution details
└── Database query: Select only status field
```

### Problem APIs
```
/apps/web/app/api/v1/admin/problems/[id]/route.ts
├── PUT endpoint - Update problem
├── Receives: title, description, difficulty, constraints[], examples[], testCases[]
├── Missing:
│   └── starterCode field in payload
├── Handles:
│   ├── Upsert constraints
│   ├── Upsert examples
│   └── Upsert test cases
└── File also missing starterCode processing

/apps/web/app/api/v1/problems/route.ts
└── Likely GET endpoint (not examined in detail)

/apps/web/app/api/v1/problems/[id]/route.ts
└── Likely problem detail endpoint (not examined in detail)
```

### User Stats
```
/apps/web/app/api/v1/users/[id]/stats/route.ts
├── GET endpoint - User statistics
├── Key Filter:
│   └── where: { type: "SUBMIT" } (line 30)
├── Calculations:
│   ├── Total solved (unique problems with PASSED status)
│   ├── By difficulty (EASY/MEDIUM/HARD)
│   ├── Acceptance rate
│   ├── Recent submissions (last 10)
│   └── Contest stats
└── Note: RUN submissions excluded from stats
```

---

## Worker & Queue

### Background Job Worker
```
/apps/worker/src/index.ts
├── BullMQ Worker listening to "submission-queue"
├── Job Data:
│   └── { submissionId: string }
├── Process:
│   ├── 1. Fetch submission
│   ├── 2. Check submission.type:
│   │   ├── If "RUN" → fetch SAMPLE test cases (isSample: true)
│   │   └── If "SUBMIT" → fetch ALL test cases
│   ├── 3. Wrap user code with I/O handling
│   ├── 4. Execute each test case in Docker
│   ├── 5. Compare outputs (JSON.stringify)
│   ├── 6. Update submission.status (PASSED/FAILED)
│   └── 7. If contest: update ContestParticipant scores
├── Docker Execution:
│   ├── Image: node:18
│   ├── Memory: 128m
│   ├── CPU: 0.5 cores
│   ├── Timeout: 5000ms
│   └── Assumes user function named solve()
├── Missing:
│   ├── Error capture
│   ├── Output capture on failure
│   ├── Execution time tracking
│   └── Memory usage tracking
└── Contest Integration:
    └── updateContestScore() function (lines 156-219)
        ├── Updates score (add points from ContestProblem)
        ├── Updates solvedProblems array
        ├── Updates lastSolveTime
        └── Only updates on first solve per problem
```

### Queue Setup
```
/packages/queue/src/index.ts
├── BullMQ Queue configuration
├── Queue Name: "submission-queue"
├── Connection:
│   ├── Host: localhost
│   └── Port: 6379 (Redis)
└── No retry/error handling config
```

---

## Database

### Prisma Schema
```
/packages/database/prisma/schema.prisma

Submission Model (lines 38-51)
├── id (cuid, PK)
├── problemId (FK)
├── submittedBy (FK to User)
├── language (LANGUAGES enum: JAVASCRIPT only)
├── code (String - user's code)
├── status (STATUS enum: PENDING, FAILED, PASSED)
├── type (SUBMISSIONTYPE enum: RUN, SUBMIT) 
├── createdAt (DateTime)
├── contestId (FK, optional)
├── Relations:
│   ├── user (submittedBy)
│   ├── problem (problemId)
│   └── contest (contestId)
└── Missing:
    ├── executionTime
    ├── executionOutput
    ├── errorMessage
    └── testResultDetails

Problem Model (lines 25-36)
├── id, title, description, isPublic, difficulty
├── Relations: testCases, constraints, examples, submissions, contest
└── Missing: starterCode, starterCodeLanguage

TestCase Model (lines 53-60)
├── id, problemId, input, output, isSample
└── Working as intended

Example Model (lines 69-76)
├── id, input, output, explanation, problemId
└── Working as intended

Constraints Model (lines 62-67)
├── id, description, problemId
└── Working as intended

ContestParticipant Model (lines 105-118)
├── id, userId, contestId, score, rank
├── solvedProblems (String array - stores problem IDs)
├── registeredAt, lastSolveTime
└── Used to track contest progress

STATUS Enum (lines 120-124)
├── PENDING - Submission queued/processing
├── FAILED - One or more tests failed
├── PASSED - All tests passed
└── Missing: TIMEOUT, ERROR, COMPILATION_ERROR

SUBMISSIONTYPE Enum (lines 141-144)
├── RUN - Execute sample test cases only
├── SUBMIT - Execute all test cases
└── Missing: PRACTICE (if distinguishing from SUBMIT)

LANGUAGES Enum (lines 131-133)
├── JAVASCRIPT only
└── Missing: Python, Java, C++, TypeScript, etc.
   (Note: Frontend dropdown shows these, but backend doesn't support)

DIFFICULTY Enum (lines 135-139)
├── EASY, MEDIUM, HARD
└── Working as intended

CONTESTSTATUS Enum (lines 146-150)
├── UPCOMING, ACTIVE, ENDED
└── Working as intended
```

---

## Data Flow Summary

### Complete Submission Flow
```
User Types Code
    ↓
CodeEditor.tsx: Click "RUN" button
    ↓
submitCode({ type: "RUN", code })
    ↓
POST /api/v1/submissions
    {
      code: string,
      language: "JAVASCRIPT",
      problemId: string,
      submittedBy: userId,     ← NOT sent! Extracted from auth
      contestId?: string
    }
    ↓
Backend (submissions/route.ts):
    ├── Validate user (Clerk auth)
    ├── Validate problem + contest (if applicable)
    └── Create Submission {
        code, language, status: PENDING,
        problemId, submittedBy, contestId,
        type: RUN (default)
      }
    ↓
Add to Queue:
    queue.add("execute", { submissionId })
    ↓
Frontend immediately returns submissionId
    ↓
CodeEditor: Start polling loop (interval: 2000ms)
    GET /api/v1/submissions/{submissionId}
    ↓
Worker processes job:
    ├── Fetch submission
    ├── Fetch sample test cases (because type: RUN)
    ├── For each test case:
    │   ├── Execute code in Docker
    │   ├── Compare output
    │   └── If mismatch: break
    ├── Update submission.status → PASSED or FAILED
    └── If contest: update score
    ↓
Frontend polling sees status !== PENDING
    ├── Clear interval
    ├── Show result dialog
    └── Close on user action
```

### Broken/Incomplete Flows
```
1. SUBMIT Type Flow:
   User wants to submit for real evaluation
   ├── Frontend: No SUBMIT button exists
   ├── Backend: type parameter never sent
   └── Result: Always uses RUN (sample tests only)

2. Starter Code Flow:
   Admin sets starter code for problem
   ├── Admin: No field in ProblemEditor
   ├── Database: No starterCode column
   └── Frontend: Always receives empty template

3. Detailed Results Flow:
   User wants to see which test failed
   ├── Backend: No detailed results stored
   ├── API: Only returns status
   └── Frontend: Can't display details
```

---

## Critical Integration Points

### 1. CodeEditor ↔ Problem Data
```
Problem (from [title]/page.tsx or contest/page.tsx)
    ↓
ResizableLayout
    ↓
CodeEditor: receives template=""
            receives problemId
    ↓
User can't see starter code (if it existed)
```

### 2. CodeEditor ↔ Backend
```
submitCode() sends:
  {code, language, problemId, submittedBy?, contestId?}
  
But should send:
  {code, language, problemId, contestId?, type: "RUN"|"SUBMIT"}
  
(submittedBy determined from auth header, not body)
```

### 3. Worker ↔ Database
```
Submission stored with minimal data:
  {code, status, language, problemId, submittedBy, type, contestId, createdAt}
  
Missing:
  {executionTime, stderr, stdout, testCaseResults, etc.}
  
Result: Can't show user what went wrong
```

### 4. TestCases ↔ Results
```
Component expects: testResults prop (boolean array)
Currently: Unused mock data

Should be populated by:
  Actual execution results from worker
  Sent via API endpoint
  Displayed in real-time or after polling

Currently: Dead code (never updates)
```

---

## Language Support Issue

Frontend dropdown shows:
- JavaScript
- TypeScript
- Python
- Java
- C++

Backend supports:
- JAVASCRIPT only

Worker executes:
- JavaScript only (node:18 Docker image)

Result:
- Users can't submit in other languages
- UI misleads users
- Frontend selection ignored
```
