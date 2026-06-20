# Release Android APK

Workflow release nằm ở `.github/workflows/release-apk.yml`. Workflow này chạy khi push tag dạng `v*`, hoặc có thể chạy thủ công trong GitHub Actions để tự tạo tag rồi build APK và tạo GitHub Release.

## Cách khuyến nghị: chạy workflow thủ công

1. Vào **GitHub > Actions > Release Mobile APK > Run workflow**.
2. Nhập `version`, ví dụ `1.0.0` hoặc `v1.0.0`.
3. Tuỳ chọn `target_ref` nếu muốn release từ branch/commit cụ thể; bỏ trống thì dùng ref đang chọn.
4. Workflow sẽ tạo tag `v1.0.0`, chạy lint/typecheck/test, prebuild Android, build APK local trên GitHub runner, rồi attach file `DriveMate-v1.0.0.apk` vào GitHub Release.

## Cách push tag từ máy local

```bash
git checkout main
git pull
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

APK release sẽ nằm trong **GitHub > Releases** và artifact của workflow run. Workflow này build bằng Gradle sau `expo prebuild`, không dùng Expo cloud build và không cần `EXPO_TOKEN`.
