import { colors, radius } from "@/theme";
import { ms, s, vs } from "@/utils/responsive";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface BottomSheetProps {
	visible: boolean;
	onClose: () => void;
	children: ReactNode;
}

/**
 * Bottom sheet trượt lên từ đáy: overlay mờ + handle + nội dung tùy ý.
 * Tự quản animation theo prop `visible` (spring vào, timing ra) và unmount sau khi đóng.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
	const anim = useRef(new Animated.Value(0)).current;
	const [mounted, setMounted] = useState(visible);

	useEffect(() => {
		if (visible) {
			setMounted(true);
			Animated.spring(anim, {
				toValue: 1,
				useNativeDriver: true,
				tension: 65,
				friction: 11,
			}).start();
		} else if (mounted) {
			Animated.timing(anim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start(() => setMounted(false));
		}
		// `mounted` cố ý không nằm trong deps: chỉ phản ứng theo `visible`.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible]);

	if (!mounted) return null;

	return (
		<Modal visible transparent animationType="none" onRequestClose={onClose}>
			<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
				<Animated.View
					style={[
						styles.sheet,
						{
							transform: [
								{
									translateY: anim.interpolate({
										inputRange: [0, 1],
										outputRange: [vs(400), 0],
									}),
								},
							],
						},
					]}>
					<TouchableOpacity activeOpacity={1}>
						<View style={styles.handle} />
						{children}
					</TouchableOpacity>
				</Animated.View>
			</TouchableOpacity>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: colors.overlay,
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: colors.surface,
		borderTopLeftRadius: ms(radius.sheet),
		borderTopRightRadius: ms(radius.sheet),
		padding: s(20),
		paddingBottom: vs(36),
	},
	handle: {
		width: s(36),
		height: vs(4),
		backgroundColor: colors.border,
		borderRadius: ms(2),
		alignSelf: "center",
		marginBottom: vs(16),
	},
});
