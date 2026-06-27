export interface PasswordRules {
	minLength: boolean;
	upperLower: boolean;
	hasNumber: boolean;
	hasSpecial: boolean;
}

// Quy tắc mật khẩu dùng chung cho màn Quên mật khẩu và Đổi mật khẩu.
export function checkPasswordRules(password: string): PasswordRules {
	return {
		minLength: password.length >= 8,
		upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecial: /[^A-Za-z0-9]/.test(password),
	};
}

export function isPasswordValid(password: string): boolean {
	return Object.values(checkPasswordRules(password)).every(Boolean);
}
