const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting the test...');

    console.log('🌟 Checking if user already exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ethanabbou24@gmail.com' },
    });

    if (existingUser) {
      console.log('⚠️ User already exists:', existingUser);
    } else {
      console.log('🌟 Adding a new user...');
      const newUser = await prisma.user.create({
        data: {
          name: 'Etens',
          email: 'ethanabbou24@gmail.com',
          image: 'https://lh3.googleusercontent.com/a/ACg8ocLQRQZMirPm1TdFKuhtQGWXmVpVvY3TbypioCQSGOxOGSBG4H3t2Q=s96-c',
          emailVerified: new Date()
        }
      });
      console.log('✅ New user added:', newUser);
    }

    console.log('🔍 Fetching all users...');
    const users = await prisma.user.findMany();
    console.log('✅ All users:', users);
  } catch (error) {
    console.error('❌ Error connecting to the database', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔒 Disconnected from the database');
  }
}

main();
