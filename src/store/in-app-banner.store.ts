import { create } from 'zustand';

export interface BannerMessage {
	title: string;
	body: string;
	data?: Record<string, unknown>;
}

interface InAppBannerState {
	message: BannerMessage | null;
	show: (message: BannerMessage) => void;
	hide: () => void;
}

export const useInAppBannerStore = create<InAppBannerState>((set) => ({
	message: null,
	show: (message) => set({ message }),
	hide: () => set({ message: null }),
}));
