import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import type { Role } from '@/lib/auth/permissions';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers:
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [GitHub]
      : [],
  callbacks: {
    async session({ session, user }) {
      const roleRows = await prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true },
      });
      session.user.id = user.id;
      session.user.roles = roleRows.map((row) => row.role.name as Role);
      return session;
    },
  },
});
export const { GET, POST } = handlers;
