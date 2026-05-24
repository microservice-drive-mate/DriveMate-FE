import { AUTH_UI } from "@/constants/auth-ui";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface AvatarProps {
	name?: string | null;
	size: number;
	borderRadius?: number;
	mediaFileId?: string | null;
	avatarUrl?: string | null;
	// Locally picked image not yet uploaded — shown as immediate preview.
	localUri?: string | null;
}

function getInitials(name?: string | null): string {
	if (!name) return "?";
	const parts = name.trim().split(" ").filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0][0].toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
	name,
	size,
	borderRadius,
	mediaFileId,
	avatarUrl,
	localUri,
}: AvatarProps) {
	// Skip presigned fetch while previewing a freshly picked local image.
	const { url: presignedUrl } = useMediaUrl(localUri ? null : mediaFileId);

	let uri: string | null = null;
	if (localUri) uri = localUri;
	else if (mediaFileId) uri = presignedUrl; // null while loading -> show initials
	else if (avatarUrl) uri = avatarUrl;

	const radius = borderRadius ?? Math.round(size * 0.25);

	return (
		<View
			style={[
				styles.avatar,
				{ width: size, height: size, borderRadius: radius },
			]}>
			{uri ? (
				<Image source={{ uri }} style={styles.image} contentFit="cover" />
			) : (
				<Text style={[styles.text, { fontSize: Math.round(size * 0.4) }]}>
					{getInitials(name)}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	avatar: {
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	image: { width: "100%", height: "100%" },
	text: {
		color: AUTH_UI.colors.accentText,
		fontWeight: "800",
	},
});
