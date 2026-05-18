import { ENDPOINTS } from "@/constants";
import { apiService as api } from "@/lib/api";
import type { UpdateProfileRequest, User } from "@/models/user.model";
import type { ApiResponse } from "@/types/api.types";
import { withErrorHandling } from "@/utils";

export const userService = {
	getMe: withErrorHandling(() =>
		api.get<ApiResponse<User>>(ENDPOINTS.USERS.GET_ME),
	),

	updateMe: withErrorHandling((data: UpdateProfileRequest) =>
		api.patch<ApiResponse<User>>(ENDPOINTS.USERS.UPDATE_ME, data),
	),
};
