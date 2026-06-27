# Quy trình Phát hành & Cập nhật DriveMate Mobile

Hệ thống CI/CD của dự án được chia làm 2 luồng độc lập: **Phát hành bản cài đặt (APK)** và **Cập nhật ngầm (OTA Update)**.

## 1. Phát hành Android APK (`release-apk.yml`)

Workflow này dùng để build ra file `.apk` cài đặt gốc. Sử dụng khi có thay đổi về Native Code (cài thêm thư viện mới) hoặc cần xuất bản mốc phiên bản chính thức. Workflow này build bằng Gradle sau `expo prebuild`, chạy hoàn toàn trên GitHub Runner, không dùng Expo cloud build và **không cần `EXPO_TOKEN`**.

**Cách 1: Chạy workflow thủ công (Khuyến nghị)**

1. Vào **GitHub > Actions > Release Mobile APK > Run workflow**.
2. Nhập `version`, ví dụ `1.0.0` hoặc `v1.0.0`.
3. Tuỳ chọn `target_ref` nếu muốn release từ branch/commit cụ thể; bỏ trống thì dùng ref đang chọn.
4. Workflow sẽ tự tạo tag, chạy lint/typecheck/test, prebuild Android, build APK local trên GitHub runner, rồi đính kèm file `DriveMate-v1.0.0.apk` vào GitHub Release.

**Cách 2: Push tag từ máy local**
Đảm bảo bạn đang ở nhánh `main` và đã cập nhật code mới nhất:

```bash
git checkout main
git pull
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

Ngay khi tag được push, hệ thống CI sẽ tự động kích hoạt tiến trình build. APK release sẽ nằm trong tab **GitHub > Releases**.

---

## 2. Cập nhật ngầm OTA (`eas-update.yml`)

Workflow này sử dụng `expo-updates` để đẩy thẳng code JavaScript/UI mới xuống máy người dùng mà không cần họ tải lại ứng dụng. Phù hợp để sửa lỗi chính tả, fix bug logic rẽ nhánh, thay đổi màu sắc... (Chỉ hoạt động khi **không** có sự thay đổi về Native modules). Workflow này yêu cầu bắt buộc phải có **`EXPO_TOKEN`** trong GitHub Secrets.

**Quy trình thực hiện:**

1. Vào **GitHub > Actions > EAS Update (OTA) > Run workflow**.
2. Chọn **Channel** phát hành:
   - **`preview`**: Dùng để test nội bộ. Bản vá sẽ được đẩy lên kênh thử nghiệm, team QA có thể lấy máy đang cài bản preview (hoặc dùng Expo Go quét mã) để kiểm tra xem lỗi đã được fix thật chưa.
   - **`production`**: Bắn thẳng bản vá xuống máy của tất cả học viên đang sử dụng app. Chỉ chọn kênh này sau khi đã test kỹ ở môi trường preview.
3. Nhập **Message**: Ghi chú ngắn gọn về bản cập nhật này (VD: _"Fix lỗi crash màn hình thi sa hình"_). Ghi chú này sẽ được lưu trên lịch sử hệ thống của Expo Dashboard.
4. Bấm **Run workflow**. Trong vòng vài phút, mã nguồn JS sẽ được đẩy lên đám mây. Lần tiếp theo người dùng mở app, phần ruột ứng dụng sẽ tự động tải bản vá và cập nhật giao diện ngay lập tức.
