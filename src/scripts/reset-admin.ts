import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local de forma explícita antes de cargar cualquier otro módulo
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('\n==================================================');
  console.log('🛡️  HEXASENSE - RESTABLECIMIENTO DE ADMINISTRADOR  🛡️');
  console.log('==================================================\n');

  try {
    // Importaciones dinámicas para garantizar que dotenv se ha ejecutado antes
    const { db } = await import('../infrastructure/database/db');
    const { users } = await import('../infrastructure/database/schema');
    const { hashPassword } = await import('../lib/auth');
    const { eq } = await import('drizzle-orm');
    const crypto = await import('crypto');

    // Analizar argumentos de línea de comandos
    // npm run reset-admin -> username='admin', password=random
    // npm run reset-admin <password> -> username='admin', password=<password>
    // npm run reset-admin <username> <password> -> username=<username>, password=<password>
    let targetUsername = 'admin';
    let newPassword = '';

    const args = process.argv.slice(2);

    if (args.length === 1) {
      // Un solo argumento se asume que es la nueva contraseña para el usuario 'admin'
      newPassword = args[0];
    } else if (args.length >= 2) {
      // Dos o más argumentos: primero es el usuario, segundo la contraseña
      targetUsername = args[0];
      newPassword = args[1];
    }

    // Si no se especificó contraseña, generar una aleatoria y segura
    if (!newPassword) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
      newPassword = '';
      for (let i = 0; i < 14; i++) {
        newPassword += chars.charAt(crypto.randomInt(0, chars.length));
      }
    }

    if (newPassword.length < 8) {
      console.error('❌ Error: La contraseña debe tener al menos 8 caracteres.');
      process.exit(1);
    }

    console.log(`🔍 Buscando usuario "${targetUsername}" en la base de datos...`);
    const [user] = await db.select().from(users).where(eq(users.username, targetUsername));

    const hashedPassword = await hashPassword(newPassword);

    if (user) {
      // Si el usuario existe, actualizar su contraseña
      console.log(`⚙️  Usuario encontrado. Actualizando contraseña para "${targetUsername}"...`);
      await db.update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.id, user.id));
      
      console.log('✅ ¡Contraseña actualizada exitosamente!');
    } else {
      // Si el usuario no existe, preguntar/crearlo como ADMIN por defecto
      console.log(`⚠️  El usuario "${targetUsername}" no existe.`);
      console.log(`⚙️  Creando nuevo usuario administrador "${targetUsername}"...`);
      
      await db.insert(users).values({
        username: targetUsername,
        passwordHash: hashedPassword,
        role: 'ADMIN',
      });

      console.log('✅ ¡Usuario administrador creado exitosamente!');
    }

    console.log('\n==================================================');
    console.log('🎉  ACCESO CREDENCIALES ACTUALIZADAS');
    console.log('--------------------------------------------------');
    console.log(`👤  Usuario:    \x1b[36m${targetUsername}\x1b[0m`);
    console.log(`🔑  Contraseña: \x1b[32m${newPassword}\x1b[0m`);
    console.log('==================================================');
    console.log('💡 Consejo: Guarda esta contraseña en un lugar seguro.');
    console.log('==================================================\n');

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error inesperado durante el proceso:\n');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
