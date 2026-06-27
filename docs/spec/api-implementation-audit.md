# Báo Cáo Audit Triển Khai API (Student-Facing)

> Audit **tĩnh** (so khớp spec ↔ code, không chạy backend), phạm vi **chỉ endpoint cho học viên
> (STUDENT)**. Nguồn spec: `docs/spec/api-spec-*.md`. Kiến trúc FE: `src/constants/api.ts`
> (`ENDPOINTS`) → `src/services/*.service.ts` → hooks/store → màn hình `src/app/*`.
>
> Các endpoint admin/center-manager/instructor/ops nằm ở [Phụ lục](#phụ-lục--endpoint-ngoài-phạm-vi).

## Tóm tắt

| Nhóm | Ý nghĩa | Số mục |
| --- | --- | --- |
| ✅ OK | Đã triển khai và nối UI đúng spec | 10 nhóm endpoint |
| 🐞 C | Bug ở code đã triển khai | 1 |
| 🔌 B | Service đã có nhưng chưa nối UI | 2 |
| 🚧 A | Thiếu hẳn endpoint (không service, không UI) | 5 |

---

## Phần 1 — Đã triển khai & nối UI đúng

| Spec | Endpoint | FE service → UI |
| --- | --- | --- |
| identity | `POST /auth/login`, `/refresh`, `/logout` | `authService` → `auth.store`, màn login |
| user | `GET /users/me`, `PATCH /users/me` | `userService` → profile / profile-edit |
| exam | `GET /exams/available` | `examService.getAvailableExams` → `exam.tsx` |
| exam | `POST/GET /exams/sessions`, `/questions`, `PATCH /answers`, `POST /submit`, `GET /result` | `examService` → `useExamSession`, màn exam-session, history |
| question | `GET /questions/topics`, `/questions/practice`, `POST /questions/:id/report` | `questionService` → màn questions |
| simulation | `GET /simulation/maneuvers`, `/maneuvers/:id`, `/maneuver-errors` | `practiceService` → màn practice |
| analytics | `GET /analytics/me/progress`, `/me/study-streak` | `analyticsService` → home, profile |
| notification | `GET /notifications/me`, `PATCH /:id/read`, `/mark-all-read`, `POST/DELETE /devices`, `GET/PATCH /preferences/me` | `notificationService` / `deviceTokenService` → notifications, profile, push hook |
| media | `POST /media/files/init`, `/:id/complete`, `GET /:id`, `/:id/url` | `mediaService` (upload avatar direct) → profile-edit, `useMediaUrl` |
| course | `GET /courses/:id`, `/courses/:id/lessons/:lessonId`, `GET /enrollments`, `/enrollments/:id`, `POST /enrollments/:id/lessons/:lessonId/complete` | `courseService` → màn courses |

Kiểm tra shape ở vài điểm khớp spec: login dùng `username` (không phải `email`);
`MissedQuestionsQuery` hỗ trợ `limit/size/periodDays/mode`; `markAllRead` trả `{updated}`; luồng
avatar theo đúng init→PUT→complete và lưu `mediaFileId`+`avatarUrl`.

---

## Phần 2 — Phát hiện

### 🐞 Nhóm C — Bug ở code đã triển khai (ưu tiên cao nhất)

**C1. `forgot-password.tsx` là mock không hoạt động và trái hợp đồng backend.**
- File: `src/app/(auth)/forgot-password.tsx`
- Màn này làm luồng 3 bước **email → OTP 6 số → đặt mật khẩu mới**, nhưng **không gọi API nào**
  (không `authService`, không `api.*`).
- Spec `api-spec-identity.md` → `POST /auth/forgot-password` chỉ kích hoạt **email reset của
  Keycloak** kèm link action. **Không tồn tại endpoint verify OTP hay reset bằng OTP** trong bất kỳ
  spec nào. ⇒ Luồng UI hiện tại không thể chạy với backend thật.
- `authService.forgotPassword` (`src/services/auth.service.ts`) đã có nhưng **không màn nào import**.

### 🔌 Nhóm B — Service đã có nhưng CHƯA nối UI

**B1. `examService.getMissedQuestions` (UC32 — ôn câu hay sai).**
- Đã khai báo (`src/services/exam.service.ts`) với model `MissedQuestionsQuery` đầy đủ, nhưng không
  màn nào gọi. Tính năng ôn câu hay sai chưa xuất hiện ở `src/app`.

**B2. `analyticsService.getMyWeakTopics`.**
- Đã khai báo (`src/services/analytics.service.ts`) nhưng không dùng. `GET /analytics/me/progress`
  đã nhúng sẵn `weakTopics` ⇒ method này **có thể thừa**. Cần quyết định: nối view weak-topics
  riêng, hoặc bỏ method và đọc `progress.weakTopics`.

### 🚧 Nhóm A — Thiếu hẳn endpoint (không có trong `ENDPOINTS`, không service, không UI)

**A1. `POST /auth/change-password`** (identity spec, "Endpoint Gap Batch Additions").
- Student-facing ("any logged-in user"). Gap thật, cần bổ sung.

**A2. Self-service khóa học: `POST /courses/:id/enroll`, `/courses/:id/unenroll`,
`POST /enrollments/:id/reset-progress`** (course spec, `STUDENT`).
- Chưa triển khai. **Có vẻ cố ý** — màn Khóa học của tôi hiển thị "Liên hệ trung tâm để được đăng
  ký" và chỉ liệt kê enrollment do trung tâm gán (`src/app/courses/index.tsx`). Cần xác nhận.

**A3. `GET /courses` (duyệt danh mục)** (course spec, JWT).
- Chưa triển khai; nhất quán với A2 (đăng ký do trung tâm xử lý). Có vẻ cố ý.

**A4. Phiên mô phỏng: `POST /simulation/sessions`, `PATCH /sessions/:id/answers`,
`POST /sessions/:id/submit`, `GET /simulation/sessions`, `GET /sessions/:id/result`** (`STUDENT`).
- Chưa triển khai. Tab Luyện Tập hiện chỉ có nội dung (sa hình + danh sách lỗi),
  `src/app/(tabs)/practice.tsx`. Có vẻ thuộc scope tương lai.

**A5. Practice 2D: `POST /simulation/practice2d/sessions`, `/telemetry`, `/end`,
`GET /practice2d/sessions/:id`** (`STUDENT`).
- Chưa triển khai. Scope tương lai.

### Ghi chú (chỉ thông tin)
- **Realtime in-app qua Socket.IO `/notifications`** — spec mô tả kênh socket; FE dùng FCM push
  (`usePushNotifications`) + REST. Fan-out realtime qua socket chưa làm. Tùy chọn nâng cao.
- **`POST /media/files` (upload multipart phía server)** — chưa làm; FE dùng direct-upload (ưu
  tiên). Không cần xử lý.

---

## Phần 3 — Backlog khắc phục (xếp theo độ sẵn sàng)

Ưu tiên gap mà **API backend đã có** (tất cả đều có); mục **FE service cũng đã viết sẵn** là quick-win.

**P1 — chỉ cần nối UI (FE service đã có sẵn):**
1. **C1 + forgotPassword:** thay luồng mock OTP bằng UX "gửi email reset" một bước, gọi
   `authService.forgotPassword`. (Nếu sản phẩm bắt buộc OTP ⇒ là gap backend, không phải việc FE.)
2. **B1:** thêm màn ôn câu hay sai dùng `examService.getMissedQuestions` (entry từ history/kết quả).
3. **B2:** chốt weak-topics — nối view từ `getMyWeakTopics`, hoặc bỏ method và đọc `progress.weakTopics`.

**P2 — thêm endpoint + service + UI (API có; thiếu constant/service FE):**
4. **A1:** thêm `ENDPOINTS.AUTH.CHANGE_PASSWORD` + `authService.changePassword` + màn đổi mật khẩu.
5. **A2/A3:** nếu trong scope — thêm duyệt danh mục + enroll/unenroll/reset-progress.
6. **A4/A5:** nếu trong scope — dựng service + màn cho phiên mô phỏng và practice 2D.

Mục 5–6 gắn cờ "cần xác nhận ý định" — UX hiện tại cho thấy có vẻ là phần cố ý hoãn lại.

---

## Phụ lục — Endpoint ngoài phạm vi
(admin/instructor/ops; cố ý không có trong app học viên)

- **identity:** `/admin/identity-users/*`, `/auth/reset-password`
- **user:** `/admin/users/*` (+ documents)
- **exam:** `/admin/exams/templates/*`, `/admin/exams/sessions`
- **question:** `/admin/questions/*` (+ pool)
- **course:** `/admin/courses/*`, `/admin/enrollments`
- **analytics:** `/analytics/instructor/dashboard`, `/admin/analytics/*`
- **notification:** `/admin/academic-warnings`
- **media:** `/admin/media/*`
- **audit-service:** toàn bộ (ADMIN/CENTER_MANAGER)
- **health-metrics:** toàn bộ endpoint ops public (`/health*`, `/metrics`)
