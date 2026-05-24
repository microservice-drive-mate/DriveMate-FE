import { useEffect, useState } from "react";
import { mediaService } from "@/services/media.service";

interface CacheEntry {
	url: string;
	expiresAt: number;
}

// Presigned URLs are short-lived (SAS). Cache per mediaFileId and reuse until
// ~60s before expiry, then re-fetch. Mirrors media-service-flow guidance.
const cache = new Map<string, CacheEntry>();
const REFRESH_MARGIN_MS = 60_000;

const cachedUrl = (mediaFileId: string): string | null => {
	const entry = cache.get(mediaFileId);
	return entry && entry.expiresAt - Date.now() > REFRESH_MARGIN_MS ? entry.url : null;
};

export function useMediaUrl(mediaFileId?: string | null): {
	url: string | null;
	isLoading: boolean;
} {
	const [url, setUrl] = useState<string | null>(() =>
		mediaFileId ? cachedUrl(mediaFileId) : null,
	);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;

		if (!mediaFileId) {
			setUrl(null);
			return;
		}

		const fromCache = cachedUrl(mediaFileId);
		if (fromCache) {
			setUrl(fromCache);
			return;
		}

		setIsLoading(true);
		mediaService.getFileUrl(mediaFileId).then((result) => {
			if (cancelled) return;
			if (result.success) {
				cache.set(mediaFileId, {
					url: result.data.url,
					expiresAt: new Date(result.data.expiresAt).getTime(),
				});
				setUrl(result.data.url);
			} else {
				setUrl(null);
			}
			setIsLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, [mediaFileId]);

	return { url, isLoading };
}
