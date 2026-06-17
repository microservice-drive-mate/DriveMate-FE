import { Notification } from "@/models/notification.model";
import { notificationService } from "@/services/notification.service";
import { create } from "zustand";

const PAGE_SIZE = 20;

interface NotificationsState {
	notifications: Notification[];
	isLoading: boolean;
	isRefreshing: boolean;
	isLoadingMore: boolean;
	page: number;
	size: number;
	total: number;
	hasMore: boolean;
}

interface NotificationsActions {
	markAsRead: (id: string) => Promise<void>;
	markAllRead: () => Promise<void>;
	refresh: () => Promise<void>;
	loadMore: () => Promise<void>;
	clear: () => void;
}

const initialState: NotificationsState = {
	notifications: [],
	isLoading: false,
	isRefreshing: false,
	isLoadingMore: false,
	page: 1,
	size: PAGE_SIZE,
	total: 0,
	hasMore: false,
};

export const useNotificationsStore = create<
	NotificationsState & NotificationsActions
>((set, get) => ({
	...initialState,

	markAsRead: async (id) => {
		set((state) => ({
			notifications: state.notifications.map((n) =>
				n.id === id ? { ...n, isRead: true } : n,
			),
		}));
		await notificationService.markAsRead(id);
	},

	markAllRead: async () => {
		set((state) => ({
			notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
		}));
		await notificationService.markAllRead();
	},

	refresh: async () => {
		const { notifications } = get();
		set(notifications.length === 0 ? { isLoading: true } : { isRefreshing: true });
		const result = await notificationService.getMine({ page: 1, size: PAGE_SIZE });
		if (result.success) {
			const { items, total } = result.data;
			set({
				notifications: items,
				page: 1,
				total,
				hasMore: items.length < total,
				isLoading: false,
				isRefreshing: false,
			});
		} else {
			set({ isLoading: false, isRefreshing: false });
		}
	},

	loadMore: async () => {
		const { hasMore, isLoadingMore, isLoading, isRefreshing, page } = get();
		if (!hasMore || isLoadingMore || isLoading || isRefreshing) return;

		set({ isLoadingMore: true });
		const nextPage = page + 1;
		const result = await notificationService.getMine({ page: nextPage, size: PAGE_SIZE });
		if (result.success) {
			set((state) => {
				const notifications = [...state.notifications, ...result.data.items];
				return {
					notifications,
					page: nextPage,
					total: result.data.total,
					hasMore: notifications.length < result.data.total,
					isLoadingMore: false,
				};
			});
		} else {
			set({ isLoadingMore: false });
		}
	},

	clear: () => set({ ...initialState }),
}));
