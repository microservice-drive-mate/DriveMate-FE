import { User, UpdateProfileRequest } from '@/models/user.model';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import {
	clearStorage,
	getAuthToken,
	getOnboardingSeen,
	getRefreshToken,
	saveOnboardingSeen,
	setAuthToken,
	setRefreshToken,
	clearOnboardingSeen,
} from '@/utils/storage';
import { create } from 'zustand';

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	hasSeenOnboarding: boolean;
}

interface AuthActions {
	initialize: () => Promise<void>;
	setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
	setUser: (user: User) => void;
	fetchUser: () => Promise<void>;
	updateProfile: (data: UpdateProfileRequest) => Promise<void>;
	completeOnboarding: () => Promise<void>;
	resetOnboardingForDev: () => Promise<void>;
	logout: () => Promise<void>;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
	user: null,
	accessToken: null,
	refreshToken: null,
	isAuthenticated: false,
	isLoading: true,
	hasSeenOnboarding: false,

	initialize: async () => {
		try {
			const [accessToken, refreshToken, hasSeenOnboarding] = await Promise.all([
				getAuthToken(),
				getRefreshToken(),
				getOnboardingSeen(),
			]);

			set({
				accessToken,
				refreshToken,
				hasSeenOnboarding,
				isAuthenticated: !!accessToken,
			});
		} finally {
			set({ isLoading: false });
		}
	},

	setTokens: async (accessToken, refreshToken) => {
		await Promise.all([setAuthToken(accessToken), setRefreshToken(refreshToken)]);
		set({ accessToken, refreshToken, isAuthenticated: true });
	},

	setUser: (user) => set({ user }),

	fetchUser: async () => {
		const result = await userService.getMe();
		if (result.success) {
			set({ user: result.data });
		}
	},

	updateProfile: async (data: UpdateProfileRequest) => {
		const result = await userService.updateMe(data);
		if (result.success) {
			set({ user: result.data });
		} else {
			throw new Error(result.error);
		}
	},

	completeOnboarding: async () => {
		await saveOnboardingSeen();
		set({ hasSeenOnboarding: true });
	},

	resetOnboardingForDev: async () => {
		if (!__DEV__) {
			return;
		}
		await clearOnboardingSeen();
		set({ hasSeenOnboarding: false });
	},

	logout: async () => {
		try {
			const currentRefreshToken = await getRefreshToken();
			if (currentRefreshToken) {
				await authService.logout(currentRefreshToken);
			}
		} catch {
			// Logout locally even if API call fails
		} finally {
			await clearStorage();
			set({
				user: null,
				accessToken: null,
				refreshToken: null,
				isAuthenticated: false,
			});
		}
	},

	clearAuth: () => {
		set({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
		});
	},
}));
