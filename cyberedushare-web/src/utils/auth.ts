import type { User } from '../types';

export const getToken = (): string | null => localStorage.getItem('token');

export const getUser = (): User | null => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const saveAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isLoggedIn = (): boolean => !!getToken();

export const getRole = (): string | null => getUser()?.role ?? null;

export const isAdmin = (): boolean => getRole() === 'admin';
export const isFaculty = (): boolean => getRole() === 'faculty';
export const isModerator = (): boolean => getRole() === 'moderator';
export const isStudent = (): boolean => getRole() === 'student';

// Redirect based on role
export const getRoleHomePath = (role: string): string => {
  switch (role) {
    case 'admin':     return '/admin/dashboard';
    case 'faculty':   return '/faculty/dashboard';
    case 'moderator': return '/moderator/queue';
    default:          return '/student/home';
  }
};