# Frontend API Spec Gap Report

Date: 2026-05-24

This report compares the current frontend code with the latest API specs in `docs/spec`.
Scope focuses on API contracts that can affect frontend runtime behavior, typed models,
service calls, and screens already present in the app.

## Summary

| ID | Severity | Area | Status |
| --- | --- | --- | --- |
| GAP-01 | High | Auth/error handling | `403` domain errors can force logout |
| GAP-02 | High | Error code mapping | Many new spec error codes are missing in frontend constants |
| GAP-03 | High | Exam model | Exam template/session/question models are behind the updated spec |
| GAP-04 | High | Exam runtime | Autosave timeout response is ignored |
| GAP-05 | Medium | Exam history/review | New history filters and missed-question review endpoint are missing |
| GAP-06 | Medium | Exam preview | Preview still reads local mock data instead of API/spec data |
| GAP-07 | Medium | Notification | Notification spec exists, but frontend still uses mock store/model |
| GAP-08 | Medium | Simulation/practice | Simulation spec exists, but practice screens still use mock data |
| GAP-09 | Medium | Analytics/home | Analytics spec exists, but home dashboard is hardcoded |
| GAP-10 | Medium | Course/enrollment | Course spec exists, but frontend has no course/enrollment API layer |
| GAP-11 | Low | Audit/admin APIs | Audit spec exists, but frontend has no client integration yet |
| GAP-12 | Low | TypeScript health | Current typecheck fails before API gap work is complete |

## Detailed Gaps

### GAP-01: `403` Domain Errors Can Force Logout

**Spec**

Several services use `403` for valid domain/authorization failures:

- `EXAM_SESSION_UNAUTHORIZED`
- `STUDENT_LICENSE_MISMATCH`
- `FORBIDDEN`

Reference:

- `docs/spec/api-spec-exam.md`, authentication/error table
- `docs/spec/api-spec-course.md`, enrollment license mismatch behavior

**Code**

`shouldLogout` returns true for every `403` status and for `FORBIDDEN`:

- `src/utils/error.ts`
- `src/lib/api.ts`

**Current behavior risk**

If a student starts an exam/course with the wrong license tier, or accesses an exam session they do not own,
the app can clear local auth and route to login instead of showing the domain error message.

**Recommended fix**

Logout only on authentication/session invalidation, mainly `401`.
Do not logout on generic `403`; show the backend error message instead.

### GAP-02: Missing Error Codes From Specs

**Spec**

The updated specs define many error codes not present in frontend constants, including:

- Exam: `INVALID_EXAM_TEMPLATE`, `INVALID_EXAM_SESSION`, `EXAM_SESSION_QUESTION_NOT_FOUND`,
  `EXAM_TEMPLATE_VERSION_CONFLICT`, `EXAM_TEMPLATE_IN_USE`, `EXAM_TEMPLATE_INACTIVE`,
  `EXAM_SESSION_NOT_FINISHED`, `INSUFFICIENT_QUESTION_POOL`
- Course: `COURSE_NOT_FOUND`, `COURSE_NOT_ACTIVE`, `COURSE_HAS_NO_LESSON`,
  `ENROLLMENT_ALREADY_EXISTS`, `ENROLLMENT_NOT_FOUND`, `ENROLLMENT_ALREADY_COMPLETED`,
  `COURSE_CAPACITY_EXCEEDED`, `STUDENT_LICENSE_NOT_ASSIGNED`
- Audit: `AUDIT_LOG_NOT_FOUND`
- Question: `QUESTION_TOPIC_NOT_FOUND`, `QUESTION_NOT_FOUND`, `QUESTION_DUPLICATE`,
  `QUESTION_VERSION_CONFLICT`, `QUESTION_ALREADY_DELETED`

**Code**

Frontend constants only define a smaller subset:

- `src/constants/api.ts`

`parseError` downgrades unknown backend codes to `INTERNAL_ERROR`:

- `src/utils/error.ts`

**Current behavior risk**

The backend can return a precise code/message, but the frontend may treat it as `INTERNAL_ERROR`
and show a generic message.

**Recommended fix**

Add all backend domain codes used by active frontend flows. For inactive/admin-only specs,
add codes when adding those UI flows.

### GAP-03: Exam Models Are Behind The Updated Spec

**Spec**

`ExamTemplate` now includes:

- `description`
- `criticalQuestions`
- `maxCriticalMistakes`
- `shuffleQuestions`
- Admin/full shape also includes `topicDistribution`, `isActive`, `isDeleted`, `version`,
  `createdById`, `createdAt`, `updatedAt`

`ExamSession` now includes:

- `criticalMistakes`
- `maxCriticalMistakes`

Student-facing questions explicitly exclude:

- `isCritical`
- `correctOptionId`
- `options[].isCorrect`
- explanation/scoring metadata

References:

- `docs/spec/api-spec-exam.md`

**Code**

Current frontend model:

- `src/models/examSession.model.ts`

Problems:

- `ExamTemplate` only has `id`, `name`, `licenseCategory`, `totalQuestions`, `passingScore`, `durationMinutes`.
- `ExamSession` does not model `criticalMistakes` or `maxCriticalMistakes`.
- `ExamSessionQuestion.isCritical` is required, but the student-facing spec says it is not returned.

**Current behavior risk**

- UI cannot display new template/session data without weakening types.
- Code can accidentally depend on `question.isCritical`, even though backend omits it for student payloads.
- Strict TypeScript work later may fail once API payloads are typed more accurately.

**Recommended fix**

Update the exam models:

- Add new template/session fields.
- Make `ExamSessionQuestion.isCritical` optional or remove it from the student-facing model.
- Use aggregate session fields (`failedByCritical`, `criticalMistakes`, `maxCriticalMistakes`)
  for fatal-question outcome UI.

### GAP-04: Autosave Timeout Response Is Ignored

**Spec**

`PATCH /exams/sessions/:id/answers` can lazily finalize an expired session as `TIMED_OUT`.
The submitted answer is not applied, and response returns the finalized session state.

Reference:

- `docs/spec/api-spec-exam.md`

**Code**

`saveAnswer` returns `ApiResponse<unknown>`:

- `src/services/exam.service.ts`

The take screen calls autosave but ignores the response:

- `src/app/exam-session/take/[id].tsx`

**Current behavior risk**

If the server finalizes the session as `TIMED_OUT`, the UI can keep showing the active exam screen
until local timer/submit catches up. The user may continue interacting with a session that is already finished.

**Recommended fix**

Type `saveAnswer` as returning `ExamSession`.
When response status is `TIMED_OUT` or `COMPLETED`, navigate to result screen or show a completion alert.

### GAP-05: Exam History Filters And Missed Review Endpoint Are Missing

**Spec**

Student history now supports:

- `page`
- `size`
- `status`
- `isPassed`
- `from`
- `to`

New endpoint:

- `GET /exams/review/missed-questions?limit=20`

Admin endpoint:

- `GET /admin/exams/sessions`

Reference:

- `docs/spec/api-spec-exam.md`

**Code**

`listSessions` only accepts:

- `page`
- `size`
- `status`

Current history service fetches `size: 100` then filters finished sessions client-side:

- `src/services/exam.service.ts`
- `src/services/history.service.ts`

No frontend service method exists for:

- `/exams/review/missed-questions`
- `/admin/exams/sessions`

**Current behavior risk**

History filtering/pagination can diverge from backend behavior and become inefficient.
The missed-question review workflow cannot use the new backend endpoint.

**Recommended fix**

Extend `listSessions` params and move filters to backend query params.
Add a `getMissedQuestions(limit)` service method and model.
Add admin session client only when admin screens are implemented.

### GAP-06: Exam Preview Still Uses Mock Data

**Spec**

The active student exam flow is based on:

- `GET /exams/available`
- `POST /exams/sessions`
- session questions/result endpoints

Student-facing question snapshots come from the exam session APIs.

**Code**

Preview screen still reads `MOCK_EXAMS`:

- `src/app/exam-session/preview/[id].tsx`
- `src/data/exams.mock.ts`

**Current behavior risk**

The preview page can show no data or stale mock content for real template IDs returned by
`GET /exams/available`.

**Recommended fix**

Either remove preview for real templates, or create an API-backed preview flow.
If backend does not expose template questions before session start, the UI should not present preview
as if it reflects the real exam.

### GAP-07: Notification Spec Exists, Frontend Still Uses Mock Store

**Spec**

Notification APIs:

- `GET /notifications/me`
- `PATCH /notifications/:id/read`
- `POST /admin/academic-warnings`

Notification shape includes:

- `id`
- `userId`
- `type`
- `title`
- `body`
- `data`
- `isRead`
- `readAt`
- `sentAt`
- `createdAt`

Reference:

- `docs/spec/api-spec-notification.md`

**Code**

Current notification model is local/UI-only:

- `src/models/notification.model.ts`

Current store uses mock data:

- `src/store/notifications.store.ts`
- `src/data/notifications.mock.ts`

**Current behavior risk**

Notifications screen cannot show backend notifications or persist read status.
Model names (`category`, `preview`, `detail`, `timeAgo`) do not match API response.

**Recommended fix**

Add `notification.service.ts` with `getMine` and `markAsRead`.
Update model to API shape, then derive UI fields such as preview/timeAgo in the screen layer.

### GAP-08: Simulation Spec Exists, Practice Screens Still Use Mock Data

**Spec**

Simulation APIs:

- `GET /simulation/maneuvers`
- `GET /simulation/maneuvers/:id`
- `GET /simulation/maneuver-errors`
- `POST /simulation/sessions`
- `PATCH /simulation/sessions/:id/answers`
- `POST /simulation/sessions/:id/submit`

Reference:

- `docs/spec/api-spec-simulation.md`

**Code**

Practice service still reads static mock data:

- `src/services/practice.service.ts`
- `src/data/practice.mock.ts`

Current model names are not API-aligned:

- `CircuitExercise`
- `ExerciseStep`
- `CommonError`

**Current behavior risk**

Practice screens will not reflect seeded backend maneuver/checkpoint/error content.
No backend session state is created or submitted.

**Recommended fix**

Add simulation models/service methods.
Map `Maneuver` and `ManeuverCheckpoint` into the current screen view models, or rename the frontend domain to match the API.

### GAP-09: Analytics Spec Exists, Home Dashboard Is Hardcoded

**Spec**

Analytics APIs:

- `GET /analytics/me/progress`
- `GET /admin/analytics/students/:studentId/progress`

Dashboard shape:

- `completionPct`
- `studiedCount`
- `attemptCount`
- `passRate`
- `totalStudyMinutes`
- `avgExamScore`
- `trend`
- `weakTopics`
- `lastActivityAt`

Reference:

- `docs/spec/api-spec-analytics.md`

**Code**

Home dashboard uses hardcoded arrays and values:

- `src/app/(tabs)/index.tsx`

No analytics service/model exists.

**Current behavior risk**

Home metrics, weak topics, and recent stats will not match backend progress.

**Recommended fix**

Add `analytics.model.ts` and `analytics.service.ts`.
Replace static dashboard values with `GET /analytics/me/progress`, with empty-state handling
for zero-value projections.

### GAP-10: Course/Enrollment API Layer Is Missing

**Spec**

Course and enrollment APIs include:

- Public/authenticated course list/detail
- Student enrollment
- Enrollment list/detail
- Lesson completion
- Progress reset
- Course archive/admin operations

Updated spec adds:

- `CourseStatus = DRAFT | ACTIVE | ARCHIVED`
- `DELETE /admin/courses/:id`
- `POST /enrollments/:id/reset-progress`
- license-tier enforcement with `STUDENT_LICENSE_NOT_ASSIGNED` and `STUDENT_LICENSE_MISMATCH`

Reference:

- `docs/spec/api-spec-course.md`

**Code**

No course/enrollment frontend service or models were found in:

- `src/services`
- `src/models`

**Current behavior risk**

Course screens cannot be wired to backend specs yet.
Course-related profile/home UI remains static or partial.

**Recommended fix**

Add course and enrollment models/service only when implementing the course UI.
Include the new archive/progress-reset behavior if admin/student screens need those actions.

### GAP-11: Audit/Admin APIs Are Not Integrated

**Spec**

Audit APIs:

- `GET /admin/audit-logs`
- `GET /admin/audit-logs/:id`

Reference:

- `docs/spec/api-spec-audit.md`

**Code**

No audit client or admin audit screen exists.

**Current behavior risk**

No current student app runtime risk.
This is a future admin-dashboard integration gap.

**Recommended fix**

Defer until admin audit/history screens are planned.

### GAP-12: TypeScript Check Currently Fails

Command:

```powershell
npx tsc --noEmit
```

Current errors:

- `src/app/(tabs)/profile.tsx`: `ROUTES.PROFILE_EDIT` route type does not match Expo Router typed route union.
- `src/components/screen-wrapper.tsx`: missing module `@/hooks/use-color-scheme`.
- `src/components/screen-wrapper.tsx`: theme index access is typed as `any`.

**Current behavior risk**

These errors are not direct API-spec mismatches, but they block using typecheck as a clean verification gate
after API contract fixes.

**Recommended fix**

Fix these type errors before or alongside API alignment work.

## Suggested Fix Order

1. Fix logout behavior for `403`.
2. Add missing error codes/messages used by active student flows.
3. Update exam models and `examService.saveAnswer` response typing.
4. Handle `TIMED_OUT` autosave response in the exam take screen.
5. Add exam history filters and missed-question review service.
6. Replace notification mock store with API service.
7. Add analytics service and wire the home dashboard.
8. Add simulation service and map practice screens to API data.
9. Add course/enrollment service when course screens are implemented.
10. Defer audit/admin clients until admin UI scope is active.
