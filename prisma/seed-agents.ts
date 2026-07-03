import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const agents = [
    { email: 'agent1@lifac.org', password: 'Password123!', name: 'Agent Un' },
    { email: 'agent2@lifac.org', password: 'Password456!', name: 'Agent Deux' },
    { email: 'agent3@lifac.org', password: 'Password789!', name: 'Agent Trois' },
  ];

  for (const agent of agents) {
    const hashedPassword = await bcrypt.hash(agent.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: agent.email },
      update: { password: hashedPassword, role: 'VOLUNTEER' },
      create: {
        email: agent.email,
        password: hashedPassword,
        name: agent.name,
        role: 'VOLUNTEER',
      },
    });
    
    console.log(`---`);
    console.log(`Agent créé avec succès :`);
    console.log(`Email : ${user.email}`);
    console.log(`Password : ${agent.password}`);
    console.log(`ID : ${user.id}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
