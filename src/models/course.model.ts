import type { LicenseCategory } from '@/models/examSession.model';

export type CourseStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  fileUrl: string;
  mediaFileId?: string | null;
  type: string;
  createdAt: string;
}

export interface CourseRequirement {
  id: string;
  minAge: number;
  prerequisites?: string | null;
  attendanceRate: number;
  minPassScore: number;
  requiredExams: number;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  licenseCategory: LicenseCategory;
  totalLessons: number;
  duration: string;
  tuitionFee: number;
  capacity: number;
  status: CourseStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  instructorIds: string[];
  requirement: CourseRequirement | null;
  materials: CourseMaterial[];
  courseCode?: string | null;
  version?: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
}

/** View model ghép enrollment với course detail cho màn danh sách. */
export interface EnrolledCourse {
  enrollment: Enrollment;
  course: Course;
}
