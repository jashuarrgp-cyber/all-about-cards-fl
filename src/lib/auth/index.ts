import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import type { Role } from '@/lib/auth/permissions';

// Each provider only turns on when its credentials are present, so the app
// builds and runs fine before any of them are configured (e.g. in CI). The
// UI reads these flags to decide which sign-in buttons to show.
export const isGoogleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);
export const isGitHubConfigured = Boolean(
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
);
export const isAnyProviderConfigured = isGoogleConfigured || isGitHubConfigured;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  pages: { signIn: '/sign-in' },
  providers: [
    ...(isGoogleConfigured ? [Google] : []),
    ...(isGitHubConfigured ? [GitHub] : []),
  ],
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
