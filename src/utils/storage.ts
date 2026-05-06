import { AUTH_CONFIG } from '@/constants';
import * as SecureStore from 'expo-secure-store';

import type { User } from '@/models/user.model';

export const getStorageItem = async <T = unknown>(
	key: string,
	defaultValue: T | null = null,
): Promise<T | null> => {
	try {
		const item = await SecureStore.getItemAsync(key);
		if (item) {
			try {
				return JSON.parse(item) as T;
			} catch {
				return item as unknown as T;
			}
		}
		return defaultValue;
	} catch (error) {
		console.warn(`Error reading SecureStore key "${key}":`, error);
		return defaultValue;
	}
};

export const setStorageItem = async (key: string, value: unknown): Promise<boolean> => {
	try {
		const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
		await SecureStore.setItemAsync(key, stringValue);
		return true;
	} catch (error) {
		console.warn(`Error writing to SecureStore key "${key}":`, error);
		return false;
	}
};

export const removeStorageItem = async (key: string): Promise<boolean> => {
	try {
		await SecureStore.deleteItemAsync(key);
		return true;
	} catch (error) {
		console.warn(`Error removing SecureStore key "${key}":`, error);
		return false;
	}
};

export const clearStorageItems = async (keys: string[]): Promise<boolean> => {
	try {
		await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
		return true;
	} catch (error) {
		console.warn('Error clearing SecureStore items:', error);
		return false;
	}
};

export const isStorageAvailable = async (): Promise<boolean> => {
	try {
		const test = '__storage_test__';
		await SecureStore.setItemAsync(test, test);
		await SecureStore.deleteItemAsync(test);
		return true;
	} catch {
		return false;
	}
};

export const clearStorage = async (): Promise<boolean> => {
	try {
		const keys = [
			AUTH_CONFIG.ACCESS_TOKEN_KEY,
			AUTH_CONFIG.REFRESH_TOKEN_KEY,
			AUTH_CONFIG.USER_KEY,
			AUTH_CONFIG.ONBOARDING_KEY,
		];
		await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
		return true;
	} catch (error) {
		console.warn('Error clearing all SecureStore:', error);
		return false;
	}
};

// Auth token helpers
export const getAuthToken = (): Promise<string | null> =>
	getStorageItem<string>(AUTH_CONFIG.ACCESS_TOKEN_KEY, null);

export const setAuthToken = (token: string): Promise<boolean> =>
	setStorageItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, token);

export const removeAuthToken = (): Promise<boolean> =>
	removeStorageItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);

// Refresh token helpers
export const getRefreshToken = (): Promise<string | null> =>
	getStorageItem<string>(AUTH_CONFIG.REFRESH_TOKEN_KEY, null);

export const setRefreshToken = (token: string): Promise<boolean> =>
	setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, token);

export const removeRefreshToken = (): Promise<boolean> =>
	removeStorageItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

// User data helpers
export const getUserData = (): Promise<User | null> =>
	getStorageItem<User>(AUTH_CONFIG.USER_KEY, null);

export const setUserData = (user: User): Promise<boolean> =>
	setStorageItem(AUTH_CONFIG.USER_KEY, user);

export const removeUserData = (): Promise<boolean> =>
	removeStorageItem(AUTH_CONFIG.USER_KEY);

// Onboarding helpers
export const getOnboardingSeen = async (): Promise<boolean> => {
	const value = await getStorageItem<string>(AUTH_CONFIG.ONBOARDING_KEY, null);
	return value === 'true';
};

export const saveOnboardingSeen = (): Promise<boolean> =>
	setStorageItem(AUTH_CONFIG.ONBOARDING_KEY, 'true');

export const clearOnboardingSeen = (): Promise<boolean> =>
	removeStorageItem(AUTH_CONFIG.ONBOARDING_KEY);
