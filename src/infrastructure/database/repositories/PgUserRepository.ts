import { UserRepository, User, UserCredentials } from '../../../core/repositories/UserRepository';
import { UserRole } from '../../../core/entities/User';
import { db } from '../db';
import { users } from '../schema';
import { eq, asc, count } from 'drizzle-orm';

export class PgUserRepository implements UserRepository {
  async getUsers(): Promise<User[]> {
    const rows = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      created_at: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.username));
    
    return rows as User[];
  }

  async getUserByUsername(username: string): Promise<{ id: string } | null> {
    const rows = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
    return rows.length > 0 ? (rows[0] as { id: string }) : null;
  }

  async getUserById(id: string): Promise<{ username: string; role: UserRole } | null> {
    const rows = await db.select({ username: users.username, role: users.role }).from(users).where(eq(users.id, id));
    return rows.length > 0 ? (rows[0] as { username: string; role: UserRole }) : null;
  }

  async countAdmins(): Promise<number> {
    const result = await db.select({ count: count() }).from(users).where(eq(users.role, 'ADMIN'));
    return result[0].count;
  }

  async createUser(username: string, passwordHash: string, role: UserRole): Promise<void> {
    await db.insert(users).values({
      username,
      passwordHash,
      role,
    });
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<void> {
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserCredentialsByUsername(username: string): Promise<UserCredentials | null> {
    const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (rows.length === 0) return null;
    const user = rows[0];
    return {
      id: user.id,
      username: user.username,
      role: user.role as UserRole,
      created_at: user.createdAt as Date,
      passwordHash: user.passwordHash
    };
  }
}
