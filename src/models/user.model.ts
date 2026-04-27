export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'admin';
  avatar?: string;
}
