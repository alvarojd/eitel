import { UserRole } from '../entities/User';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  created_at: Date;
}

export interface UserRepository {
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<{ id: string } | null>;
  getUserById(id: string): Promise<{ username: string; role: UserRole } | null>;
  countAdmins(): Promise<number>;
  createUser(username: string, passwordHash: string, role: UserRole): Promise<void>;
  updateUserPassword(id: string, passwordHash: string): Promise<void>;
  deleteUser(id: string): Promise<void>;
}
