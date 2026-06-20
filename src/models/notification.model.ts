export type NotificationType = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';

export interface NotificationPreferences {
	inAppEnabled: boolean;
	emailEnabled: boolean;
	pushEnabled: boolean;
	smsEnabled: boolean;
	studyReminderEnabled: boolean;
	examReminderEnabled: boolean;
	courseUpdateEnabled: boolean;
	academicWarningEnabled: boolean;
}

export type UpdateNotificationPreferencesRequest = Partial<NotificationPreferences>;
export type NotificationStatus = 'QUEUED' | 'DELIVERED' | 'FAILED';

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	eventType: string | null;
	title: string;
	body: string;
	data: Record<string, unknown>;
	status: NotificationStatus;
	retryCount: number;
	errorMessage: string | null;
	isRead: boolean;
	readAt: string | null;
	sentAt: string | null;
	deliveredAt: string | null;
	createdAt: string;
	updatedAt: string;
}
