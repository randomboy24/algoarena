# AlgoArena Submission System - Comprehensive Analysis

## 1. CURRENT RUN SUBMISSION FLOW

### Submission Creation Process:
1. **User Interface** (CodeEditor.tsx)
   - User enters code in Monaco editor
   - Clicks "RUN" button
   - CodeEditor calls `submitCode()` with `type: "RUN"`

2. **Backend API** (submissions/route.ts)
   - Endpoint: `POST /api/v1/submissions`
   - Receives: `{ code, language, problemId, contestId }`
   - **NOTE**: The `type: "RUN"` parameter is NOT being sent to the backend
   - Creates submission with hardcoded `status: "PENDING"` and implicit `type: "RUN"` (default from schema)
   - Adds job to BullMQ queue: `submission-queue`
   - Returns: `{ submissionId }`

3. **Background Worker** (worker/src/index.ts)
   - Listens to "submission-queue" jobs
   - Retrieves submission from database
   - **Key Logic**: Checks `submission.type`:
     - If `type == "RUN"`: Runs only SAMPLE test cases (`isSample: true`)
     - If `type == "SUBMIT"`: Runs ALL test cases
   
4. **Test Case Execution**
   - Wraps user code with input/output handling
   - Uses Docker container (node:18) with resource limits:
     - Memory: 128m
     - CPU: 0.5 cores
     - Timeout: 5000ms
   - Execution: `docker run --rm -i node:18 node -e '<wrapped_code>'`
   - For each test case:
     - Writes input to stdin
     - Compares JSON-stringified output
     - If any test fails → status: "FAILED"
     - If all pass → status: "PASSED"

5. **Post-Execution Updates**
   - Updates submission status in database
   - If contest submission: Updates ContestParticipant score/rank (only on first successful solve)
   - Clears interval polling on frontend

### Frontend Poll Loop:
- CodeEditor sets interval of 2000ms
- Polls: `GET /api/v1/submissions/{submissionId}`
- Returns only: `{ status: "PENDING" | "FAILED" | "PASSED" }`
- Stops polling when status !== "PENDING"
- Shows dialog with status and simple message

---

## 2. STARTER CODE MECHANISM - CURRENTLY DOES NOT EXIST

### Evidence:
- **Problem Model**: NO `starterCode` field in Prisma schema
- **CodeEditor.tsx**: 
  - Accepts `template` prop (line 9)
  - `ResizableLayout` passes empty string: `template={""}`
  - User starts with blank editor
- **Problem Editor**: No fields for managing starter code
- **Database**: No storage mechanism for starter code

### Blockers:
1. No database field to store starter code
2. No admin interface to set starter code when creating problems
3. No API endpoint to retrieve starter code
4. Frontend always initializes with empty template

---

## 3. PROBLEM MODEL - DATABASE SCHEMA

### Current Fields:
```prisma
model Problem {
  id          String           @id @default(cuid())
  title       String           @unique
  description String
  isPublic    Boolean          @default(true)
  difficulty  DIFFICULTY       // EASY | MEDIUM | HARD
  testCases   TestCase[]
  constraints Constraints[]
  examples    Example[]
  submissions Submission[]
  contest     ContestProblem[]
}
```

### Missing Fields:
- ❌ `starterCode` or `template` (STRING)
- ❌ `language` (to support language-specific starters)

### Related Models:
- **TestCase**: `{ id, problemId, input, output, isSample }`
- **Example**: `{ id, input, output, explanation, problemId }`
- **Constraints**: `{ id, description, problemId }`

---

## 4. SUBMISSIONS PAGE/COMPONENT - WHAT'S DISPLAYED AFTER SUBMISSION

### Current Display (CodeEditor.tsx):
1. **Loading State**:
   - Shows "Running..." with spinner
   - RUN button disabled
   - Polls every 2 seconds

2. **Result Dialog** (lines 110-144):
   - Shows modal with PASSED/FAILED status
   - Status badge with color coding:
     - PASSED: Emerald (green)
     - FAILED: Rose (red)
   - Generic message:
     - "Your code ran successfully." (PASSED)
     - "Your code failed. Please review and try again." (FAILED)
   - Close button to dismiss

3. **Test Cases Panel** (TestCases.tsx):
   - Shows list of test cases with tabs
   - Has mock `runTests()` function with random results
   - Shows Input/Output/Explanation for each case
   - **NOT connected to actual execution results** - completely local mock data

### Missing Information:
- ❌ No display of which test cases passed/failed
- ❌ No actual output shown from execution
- ❌ No detailed error messages
- ❌ No execution time/memory usage
- ❌ No submission ID/timestamp in UI
- ❌ No complete submission history view
- ❌ Test results panel never populated with real data

---

## 5. WORKER - TEST CASE EXECUTION HANDLING

### Location: `/apps/worker/src/index.ts`

### Execution Logic:

```typescript
// 1. Fetch submission details
const submission = await prisma.submission.findUnique({
  where: { id: submissionId }
})

// 2. Determine which test cases to run
if (submission.type == "RUN") {
  testCases = await prisma.testCase.findMany({
    where: {
      problemId: submission.problemId,
      isSample: true  // Only sample/example cases
    }
  })
} else {
  testCases = await prisma.testCase.findMany({
    where: { problemId: submission.problemId }
    // All cases, including hidden ones
  })
}

// 3. Wrap code with I/O handling
const wrapped = `${userCode}
  const fs = require("fs");
  const args = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
  const result = solve(...args)
  console.log(JSON.stringify(result))
`

// 4. Execute in Docker
for (const tc of testCases) {
  const cmd = `docker run --rm -i --memory="128m" --cpus="0.5" node:18 node -e '${wrapped}'`
  const output = await exec(cmd, { timeout: 5000 })
  
  // 5. Compare results
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    status = "FAILED"
    return
  }
}

// 6. All passed
status = "PASSED"
```

### Key Limitations:
- ✅ Properly isolates execution
- ✅ Resource limits enforced
- ✅ Timeout protection
- ❌ No error details captured
- ❌ No execution time tracked
- ❌ No output captured on failure
- ❌ No memory usage tracking
- ❌ Assumptions: User function is named `solve()`, takes args as array

---

## 6. POST-SUBMISSION STATUS TRACKING & RESULTS DISPLAY

### Status Updates:
```prisma
enum STATUS {
  PENDING    // Submission queued/running
  FAILED     // Test(s) failed
  PASSED     // All tests passed
}

enum SUBMISSIONTYPE {
  RUN        // Sample test cases only
  SUBMIT     // All test cases
}
```

### Current Tracking:
1. **Database Updates**:
   - Submission.status updated to PASSED/FAILED
   - ContestParticipant.score updated (contest submissions only)
   - ContestParticipant.solvedProblems array updated

2. **Frontend Tracking**:
   - Polls submission status every 2 seconds
   - Stops when status !== "PENDING"
   - Shows simple dialog (no detailed results)

3. **User Stats** (stats/route.ts):
   - Counts "SUBMIT" type submissions only (not RUN)
   - Calculates solved problems (unique + PASSED status)
   - Tracks acceptance rate per difficulty
   - Shows last 10 submissions

### Missing Implementation:
- ❌ Detailed test case results not stored in DB
- ❌ Error messages not captured
- ❌ Execution details not stored
- ❌ No submission details endpoint (only status)
- ❌ No way to view what happened on each test case
- ❌ No execution logs/error output

---

## KEY FINDINGS SUMMARY

| Feature | Status | Details |
|---------|--------|---------|
| **RUN Feature** | ✅ Implemented | Sample test cases only, polls every 2s, generic feedback |
| **Starter Code** | ❌ Missing | No DB field, no admin UI, no API |
| **Test Results Storage** | ❌ Missing | Only status (PASS/FAIL) stored, no details |
| **Result Display** | ⚠️ Partial | Simple dialog only, no test case breakdown |
| **Execution Isolation** | ✅ Good | Docker containers with resource limits |
| **Error Handling** | ❌ Weak | No error capture, no details returned |
| **Type System** | ✅ Implemented | RUN vs SUBMIT distinction in place |
| **Contest Integration** | ✅ Implemented | Score tracking, rank calculation |

---

## SUBMISSION API FLOW DIAGRAM

```
Frontend (CodeEditor)
  ↓
  User clicks "RUN" with code
  ↓
POST /api/v1/submissions
  {code, language, problemId, contestId}
  (NOTE: type: "RUN" NOT sent)
  ↓
Backend (route.ts)
  1. Create submission (status: PENDING, type defaults to RUN)
  2. Add job to BullMQ queue
  3. Return submissionId
  ↓
Frontend Poll Loop (every 2s)
  GET /api/v1/submissions/{submissionId}
  ↓
Worker (background job)
  1. Fetch submission + sample test cases
  2. Execute code in Docker
  3. Compare outputs
  4. Update submission.status to PASSED/FAILED
  5. If contest: update score
  ↓
Frontend Receives Status Update
  Stop polling
  Show result dialog (generic)
```

---

## DATABASE CONNECTIONS

### Submission Relations:
- `Submission.user` → User (submittedBy)
- `Submission.problem` → Problem
- `Submission.contest` → Contest (optional)

### What's Currently NOT Stored:
- Test case execution results
- Error messages
- Execution time
- Memory usage
- Detailed output
- Failure reason

---
