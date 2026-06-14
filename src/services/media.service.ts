import { apiService as api } from "@/lib/api";
import { ENDPOINTS, ERROR_CODES, ERROR_MESSAGES } from "@/constants";
import type { ApiResponse } from "@/types/api.types";
import type {
	InitUploadRequest,
	InitUploadResponse,
	MediaFile,
	MediaUrlResponse,
} from "@/models/media.model";
import { ALLOWED_IMAGE_MIME, MAX_FILE_SIZE } from "@/models/media.model";
import { withErrorHandling } from "@/utils";

// Minimal subset of expo-image-picker's ImagePickerAsset we rely on.
export interface PickedImageAsset {
	uri: string;
	fileName?: string | null;
	mimeType?: string | null;
	fileSize?: number | null;
}

type UploadResult =
	| { success: true; mediaFileId: string; publicUrl: string }
	| { success: false; error: string; code: string };

const guessMimeFromUri = (uri: string): string => {
	const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
	switch (ext) {
		case "png":
			return "image/png";
		case "gif":
			return "image/gif";
		case "webp":
			return "image/webp";
		case "svg":
			return "image/svg+xml";
		default:
			return "image/jpeg";
	}
};

const extFromMime = (mime: string): string => {
	if (mime === "image/png") return "png";
	if (mime === "image/gif") return "gif";
	if (mime === "image/webp") return "webp";
	if (mime === "image/svg+xml") return "svg";
	return "jpg";
};

export const mediaService = {
	initUpload: withErrorHandling((body: InitUploadRequest) =>
		api.post<ApiResponse<InitUploadResponse>>(ENDPOINTS.MEDIA.FILES_INIT, body),
	),

	getFileUrl: withErrorHandling((id: string) =>
		api.get<ApiResponse<MediaUrlResponse>>(ENDPOINTS.MEDIA.FILE_URL(id)),
	),

	getFile: withErrorHandling((id: string) =>
		api.get<ApiResponse<MediaFile>>(ENDPOINTS.MEDIA.FILE(id)),
	),

	completeUpload: withErrorHandling((id: string) =>
		api.post<ApiResponse<MediaFile>>(ENDPOINTS.MEDIA.FILE_COMPLETE(id), {}),
	),

	// Direct upload flow: init metadata -> PUT bytes straight to Azure (NOT through
	// apiService, which targets the Kong base URL and attaches our Bearer token).
	// Returns mediaFileId + publicUrl for the caller to persist on the business entity.
	uploadAvatar: async (asset: PickedImageAsset): Promise<UploadResult> => {
		const mimeType = asset.mimeType ?? guessMimeFromUri(asset.uri);
		if (!ALLOWED_IMAGE_MIME.includes(mimeType)) {
			return {
				success: false,
				error: ERROR_MESSAGES.INVALID_MIME_TYPE,
				code: ERROR_CODES.INVALID_MIME_TYPE,
			};
		}

		let blob: Blob;
		try {
			const fileResponse = await fetch(asset.uri);
			blob = await fileResponse.blob();
		} catch {
			return {
				success: false,
				error: ERROR_MESSAGES.FILE_UPLOAD_FAILED,
				code: ERROR_CODES.FILE_UPLOAD_FAILED,
			};
		}

		const fileSize = asset.fileSize ?? blob.size;
		if (fileSize > MAX_FILE_SIZE) {
			return {
				success: false,
				error: ERROR_MESSAGES.FILE_TOO_LARGE,
				code: ERROR_CODES.FILE_TOO_LARGE,
			};
		}

		const initResult = await mediaService.initUpload({
			originalName: asset.fileName ?? `avatar.${extFromMime(mimeType)}`,
			mimeType,
			fileSize,
		});
		if (!initResult.success) {
			return { success: false, error: initResult.error, code: initResult.code };
		}

		const { mediaFileId, uploadUrl, publicUrl } = initResult.data;

		try {
			const putResponse = await fetch(uploadUrl, {
				method: "PUT",
				headers: {
					"Content-Type": mimeType,
					"x-ms-blob-type": "BlockBlob",
				},
				body: blob,
			});
			if (!putResponse.ok) {
				return {
					success: false,
					error: ERROR_MESSAGES.FILE_UPLOAD_FAILED,
					code: ERROR_CODES.FILE_UPLOAD_FAILED,
				};
			}
		} catch {
			return {
				success: false,
				error: ERROR_MESSAGES.FILE_UPLOAD_FAILED,
				code: ERROR_CODES.FILE_UPLOAD_FAILED,
			};
		}

		const completeResult = await mediaService.completeUpload(mediaFileId);
		if (!completeResult.success) {
			return {
				success: false,
				error: completeResult.error,
				code: completeResult.code,
			};
		}

		return { success: true, mediaFileId, publicUrl };
	},
};
