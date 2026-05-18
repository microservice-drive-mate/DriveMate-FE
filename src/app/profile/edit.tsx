import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { useAuthStore } from "@/store/auth.store";
import { Gender, UpdateProfileRequest } from "@/models/user.model";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
	{ label: "Nam", value: Gender.MALE },
	{ label: "Nữ", value: Gender.FEMALE },
	{ label: "Khác", value: Gender.OTHER },
];

export default function EditProfileScreen() {
	const router = useRouter();
	const { user, updateProfile } = useAuthStore();

	const [fullName, setFullName] = useState(user?.fullName ?? "");
	const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
	const [dateOfBirth, setDateOfBirth] = useState(
		user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
	);
	const [gender, setGender] = useState<Gender | undefined>(user?.gender ?? undefined);
	const [address, setAddress] = useState(user?.address ?? "");
	const [notes, setNotes] = useState(user?.studentDetail?.notes ?? "");
	const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl ?? null);
	const [loading, setLoading] = useState(false);

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setAvatarUri(result.assets[0].uri);
			// TODO: Upload to media-service to get mediaFileId + permanent avatarUrl
			// After media-service API is available, replace local URI with the returned avatarUrl
		}
	};

	const getInitials = (name: string) => {
		if (!name) return "?";
		const parts = name.trim().split(" ");
		if (parts.length === 1) return parts[0][0].toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	};

	const handleSave = async () => {
		if (!fullName.trim()) {
			Alert.alert("Thông báo", "Họ tên không được để trống.");
			return;
		}

		const payload: UpdateProfileRequest = {};
		if (fullName !== user?.fullName) payload.fullName = fullName.trim();
		if (phoneNumber !== (user?.phoneNumber ?? "")) payload.phoneNumber = phoneNumber.trim() || undefined;
		if (dateOfBirth !== (user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : ""))
			payload.dateOfBirth = dateOfBirth || undefined;
		if (gender !== (user?.gender ?? undefined)) payload.gender = gender;
		if (address !== (user?.address ?? "")) payload.address = address.trim() || undefined;
		if (notes !== (user?.studentDetail?.notes ?? "")) payload.notes = notes.trim() || undefined;

		setLoading(true);
		try {
			await updateProfile(payload);
			router.back();
		} catch {
			Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			edges={["top", "bottom"]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name="arrow-back" size={ms(22)} color={AUTH_UI.colors.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
				<View style={styles.backBtn} />
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>
				<TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
					<View style={styles.avatar}>
						{avatarUri ? (
							<Image source={{ uri: avatarUri }} style={styles.avatarImage} />
						) : (
							<Text style={styles.avatarText}>{getInitials(fullName)}</Text>
						)}
					</View>
					<View style={styles.avatarEditBadge}>
						<Ionicons name="camera-outline" size={ms(14)} color={AUTH_UI.colors.accentText} />
					</View>
				</TouchableOpacity>

				{avatarUri && avatarUri !== user?.avatarUrl && (
					<Text style={styles.avatarNote}>
						Ảnh đã chọn. Upload sẽ hoàn thiện khi tích hợp media-service.
					</Text>
				)}

				<Text style={styles.sectionLabel}>Thông tin cơ bản</Text>

				<InputField
					leftIcon="person-outline"
					placeholder="Họ và tên"
					value={fullName}
					onChangeText={setFullName}
				/>

				<InputField
					leftIcon="call-outline"
					placeholder="Số điện thoại"
					value={phoneNumber}
					onChangeText={setPhoneNumber}
					keyboardType="phone-pad"
				/>

				<InputField
					leftIcon="calendar-outline"
					placeholder="Ngày sinh (YYYY-MM-DD)"
					value={dateOfBirth}
					onChangeText={setDateOfBirth}
				/>

				<InputField
					leftIcon="location-outline"
					placeholder="Địa chỉ"
					value={address}
					onChangeText={setAddress}
				/>

				<Text style={styles.sectionLabel}>Giới tính</Text>
				<View style={styles.genderRow}>
					{GENDER_OPTIONS.map((opt) => (
						<TouchableOpacity
							key={opt.value}
							style={[
								styles.genderOption,
								gender === opt.value && styles.genderOptionSelected,
							]}
							onPress={() => setGender(opt.value)}>
							<Text
								style={[
									styles.genderOptionText,
									gender === opt.value && styles.genderOptionTextSelected,
								]}>
								{opt.label}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{user?.studentDetail !== undefined && (
					<>
						<Text style={styles.sectionLabel}>Ghi chú học viên</Text>
						<InputField
							leftIcon="document-text-outline"
							placeholder="Ghi chú"
							value={notes}
							onChangeText={setNotes}
							multiline
							containerStyle={styles.notesInput}
						/>
					</>
				)}

				<Button
					variant="primary"
					label="Lưu thay đổi"
					onPress={handleSave}
					loading={loading}
					disabled={loading}
					style={styles.saveBtn}
				/>
			</ScrollView>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: s(16),
		paddingVertical: vs(12),
	},
	backBtn: { width: s(36) },
	headerTitle: {
		fontSize: ms(17),
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
	},
	scrollContent: {
		paddingHorizontal: s(16),
		paddingBottom: vs(40),
	},
	avatarContainer: {
		alignSelf: "center",
		marginBottom: vs(20),
		marginTop: vs(8),
	},
	avatar: {
		width: s(88),
		height: s(88),
		borderRadius: ms(22),
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	avatarImage: { width: "100%", height: "100%" },
	avatarText: {
		color: AUTH_UI.colors.accentText,
		fontWeight: "800",
		fontSize: ms(28),
	},
	avatarEditBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: s(26),
		height: s(26),
		borderRadius: ms(13),
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: AUTH_UI.colors.background,
	},
	avatarNote: {
		fontSize: ms(11),
		color: AUTH_UI.colors.textMuted,
		textAlign: "center",
		marginTop: -vs(12),
		marginBottom: vs(12),
	},
	sectionLabel: {
		fontSize: ms(12),
		fontWeight: "600",
		color: AUTH_UI.colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 0.6,
		marginBottom: vs(8),
		marginTop: vs(4),
	},
	genderRow: {
		flexDirection: "row",
		gap: s(8),
		marginBottom: vs(12),
	},
	genderOption: {
		flex: 1,
		paddingVertical: vs(10),
		borderRadius: ms(10),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.surface,
	},
	genderOptionSelected: {
		borderColor: AUTH_UI.colors.accent,
		backgroundColor: AUTH_UI.colors.accent,
	},
	genderOptionText: {
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
		fontWeight: "600",
	},
	genderOptionTextSelected: {
		color: AUTH_UI.colors.accentText,
	},
	notesInput: { height: vs(80), alignItems: "flex-start", paddingTop: vs(12) },
	saveBtn: { marginTop: vs(20) },
});
