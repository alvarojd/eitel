import { UserRepository, User } from '../../../core/repositories/UserRepository';
import { UserRole } from '../../../core/entities/User';
import { sql } from '../db';

export class PgUserRepository implements UserRepository {
  async getUsers(): Promise<User[]> {
    const { rows } = await sql`
      SELECT id, username, role, created_at 
      FROM users 
      ORDER BY username ASC
    `;
    return rows as User[];
  }

  async getUserByUsername(username: string): Promise<{ id: string } | null> {
    const { rows } = await sql`SELECT id FROM users WHERE username = ${username}`;
    return rows.length > 0 ? (rows[0] as { id: string }) : null;
  }

  async getUserById(id: string): Promise<{ username: string; role: UserRole } | null> {
    const { rows } = await sql`SELECT username, role FROM users WHERE id = ${id}`;
    return rows.length > 0 ? (rows[0] as { username: string; role: UserRole }) : null;
  }

  async countAdmins(): Promise<number> {
    const { rows } = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`;
    return parseInt(rows[0].count, 10);
  }

  async createUser(username: string, passwordHash: string, role: UserRole): Promise<void> {
    await sql`
      INSERT INTO users (username, password_hash, role)
      VALUES (${username}, ${passwordHash}, ${role})
    `;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<void> {
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`;
  }

  async deleteUser(id: string): Promise<void> {
    await sql`DELETE FROM users WHERE id = ${id}`;
  }
}
