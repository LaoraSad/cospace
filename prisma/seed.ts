import { PrismaClient, Role, SpaceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seed...');

  // 1. Limpiar datos existentes (opcional para reiniciar estado limpio)
  await prisma.booking.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear Administrador 
  const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin CoSpace',
      email: 'admin@cospace.com',
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(` Administrador creado: ${admin.email}`);

  // 3. Crear Usuario de prueba
  const hashedUserPassword = await bcrypt.hash('User123!', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Coder Tester',
      email: 'user@cospace.com',
      password: hashedUserPassword,
      role: Role.USER,
    },
  });
  console.log(`Usuario de prueba creado: ${user.email}`);

  // 4. Crear Espacios iniciales 
  const spaces = [
    {
      name: 'Escritorio Dedicado A-01',
      description: 'Espacio individual ergonómico con monitor secundario, luz natural y conexión cableada de alta velocidad.',
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 15.0,
      imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      name: 'Sala de Juntas Innovación',
      description: 'Sala ejecutiva para reuniones de equipo equipada con pantalla 4K, pizarra inteligente y videollamada.',
      type: SpaceType.MEETING_ROOM,
      capacity: 8,
      pricePerHour: 60.0,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      name: 'Cabina Acústica Focus 01',
      description: 'Cabina insonorizada ideal para llamadas privadas, entrevistas remotas y grabaciones de audio cortas.',
      type: SpaceType.BOOTH,
      capacity: 1,
      pricePerHour: 20.0,
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      name: 'Escritorio Flexible B-12',
      description: 'Puesto flexible en zona compartida con acceso a tomas de corriente y cafetería ilimitada.',
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 10.0,
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  ];

  for (const space of spaces) {
    await prisma.space.create({ data: space });
  }

  console.log(` ${spaces.length} espacios creados exitosamente.`);
  console.log(' Seed completado.');
}

main()
  .catch((e) => {
    console.error(' Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });