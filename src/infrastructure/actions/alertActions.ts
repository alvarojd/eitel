'use server';

import { db } from '../database/db';
import { alertEmails } from '../database/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAlertEmails() {
  try {
    const emails = await db.select().from(alertEmails).orderBy(alertEmails.createdAt);
    return emails;
  } catch (error) {
    console.error('Error fetching alert emails:', error);
    return [];
  }
}

export async function addAlertEmail(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Correo electrónico inválido' };
    }

    await db.insert(alertEmails).values({ email });
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding alert email:', error);
    // Verificar si es un error de unicidad (ya existe)
    if (error.code === '23505') {
      return { success: false, error: 'Este correo ya está en la lista de alertas' };
    }
    return { success: false, error: 'Error al añadir el correo' };
  }
}

export async function removeAlertEmail(id: string) {
  try {
    await db.delete(alertEmails).where(eq(alertEmails.id, id));
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error removing alert email:', error);
    return { success: false, error: 'Error al eliminar el correo' };
  }
}
