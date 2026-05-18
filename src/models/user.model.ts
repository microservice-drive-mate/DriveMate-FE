export enum UserRole {
	ADMIN = 'ADMIN',
	CENTER_MANAGER = 'CENTER_MANAGER',
	INSTRUCTOR = 'INSTRUCTOR',
	STUDENT = 'STUDENT',
}

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

export enum LicenseTier {
	A1 = 'A1',
	A2 = 'A2',
	B1 = 'B1',
	B2 = 'B2',
	C = 'C',
	D = 'D',
	E = 'E',
	F = 'F',
}

export interface StudentDetail {
	licenseTier: LicenseTier | null;
	enrolledAt: string | null;
	notes: string | null;
}

export interface User {
	id: string;
	fullName: string;
	email: string;
	phoneNumber: string | null;
	dateOfBirth: string | null;
	avatarUrl: string | null;
	mediaFileId: string | null;
	gender: Gender | null;
	address: string | null;
	role: UserRole;
	isActive: boolean;
	createdAt: string;
	studentDetail: StudentDetail | null;
}

export interface UpdateProfileRequest {
	fullName?: string;
	phoneNumber?: string;
	dateOfBirth?: string;
	gender?: Gender;
	address?: string;
	avatarUrl?: string;
	mediaFileId?: string;
	notes?: string;
}
