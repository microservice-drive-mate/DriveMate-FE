import { Notification } from "@/models/notification.model";
import { notificationService } from "@/services/notification.service";
import { create } from "zustand";

interface NotificationsState {
	notifications: Notification[];
	isLoading: boolean;
}

interface NotificationsActions {
	markAsRead: (id: string) => void;
	refresh: () => Promise<void>;
}

export const useNotificationsStore = create<
	NotificationsState & NotificationsActions
>((set, get) => ({
	notifications: [],
	isLoading: false,

	markAsRead: async (id) => {
		set((state) => ({
			notifications: state.notifications.map((n) =>
				n.id === id ? { ...n, isRead: true } : n,
			),
		}));
		await notificationService.markAsRead(id);
	},

	refresh: async () => {
		set({ isLoading: true });
		const result = await notificationService.getMine({ size: 50 });
		if (result.success) {
			set({ notifications: result.data.items, isLoading: false });
		} else {
			set({ isLoading: false });
		}
	},
}));
