export type UserRole = 'ADMIN' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt?: Date;
}

export interface AuthSession {
  user: User;
  token: string;
}
