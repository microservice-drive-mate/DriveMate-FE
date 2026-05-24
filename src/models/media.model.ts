export interface MediaFile {
	id: string;
	storageKey: string;
	originalName: string;
	mimeType: string;
	fileSize: number;
	bucketName: string;
	uploadedById: string;
	isPublic: boolean;
	createdAt: string;
}

export interface InitUploadRequest {
	originalName: string;
	mimeType: string;
	fileSize: number;
}

export interface InitUploadResponse {
	mediaFileId: string;
	uploadUrl: string;
	publicUrl: string;
	expiresAt: string;
}

export interface MediaUrlResponse {
	url: string;
	expiresAt: string;
}

// Domain limits mirrored from media-service (validate client-side before upload).
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_MIME = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
];
