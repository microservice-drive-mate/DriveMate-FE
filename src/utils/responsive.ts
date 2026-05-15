import { Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const BASE_W = 390;
const BASE_H = 844;

/** Horizontal scale: paddingHorizontal, marginHorizontal, width, gap, icon size */
export const s = (n: number): number => (W / BASE_W) * n;

/** Vertical scale: height, paddingVertical, marginTop/Bottom, translateY */
export const vs = (n: number): number => (H / BASE_H) * n;

/** Moderate scale (factor 0.4): fontSize, lineHeight, borderRadius */
export const ms = (n: number, f = 0.4): number => n + (s(n) - n) * f;
