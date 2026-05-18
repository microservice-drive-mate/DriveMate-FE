export interface ApiResponse<T> {
	success: boolean;
	code: string;
	message: string;
	timestamp?: string;
	path?: string;
	data: T;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	size: number;
}
