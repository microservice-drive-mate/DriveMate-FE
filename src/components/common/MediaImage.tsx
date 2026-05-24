import { AUTH_UI } from "@/constants/auth-ui";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { ms, vs } from "@/utils/responsive";
import { Image } from "expo-image";
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native";

interface MediaImageProps {
	mediaFileId?: string | null;
	// Stable blob URL fallback; only renders directly if container is public.
	imageUrl?: string | null;
	style?: ViewStyle;
}

// Renders an image stored in media-service. Prefers a presigned URL fetched via
// mediaFileId (private-container safe); falls back to imageUrl when no id.
export function MediaImage({ mediaFileId, imageUrl, style }: MediaImageProps) {
	const { url, isLoading } = useMediaUrl(mediaFileId);
	const uri = mediaFileId ? url : imageUrl ?? null;

	if (!uri && !isLoading) return null;

	return (
		<View style={[styles.wrap, style]}>
			{uri ? (
				<Image source={{ uri }} style={styles.image} contentFit="contain" />
			) : (
				<ActivityIndicator color={AUTH_UI.colors.accent} />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: {
		width: "100%",
		height: vs(180),
		borderRadius: ms(AUTH_UI.radius.lg),
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	image: { width: "100%", height: "100%" },
});
