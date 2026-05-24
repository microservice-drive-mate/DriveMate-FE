export type NotificationType = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	body: string;
	data: Record<string, unknown>;
	isRead: boolean;
	readAt: string | null;
	sentAt: string | null;
	createdAt: string;
}
