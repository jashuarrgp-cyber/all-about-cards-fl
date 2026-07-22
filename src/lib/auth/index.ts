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
  events: {
    // First-time owner bootstrap, no command line needed: when the account
    // whose email matches INITIAL_OWNER_EMAIL is created, it is granted the
    // OWNER role automatically. Everyone else starts with no role (they land
    // on the "account needs enabling" page) until an owner grants access.
    // Guarded by an env var and an exact email match, so a random visitor
    // can never become owner.
    async createUser({ user }) {
      const ownerEmail = process.env.INITIAL_OWNER_EMAIL?.trim().toLowerCase();
      if (!ownerEmail || !user.id) return;
      if (user.email?.trim().toLowerCase() !== ownerEmail) return;

      const ownerRole = await prisma.role.findUnique({
        where: { name: 'OWNER' },
      });
      if (!ownerRole) return; // roles not seeded yet — nothing to grant

      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: ownerRole.id } },
        create: { userId: user.id, roleId: ownerRole.id },
        update: {},
      });
    },
  },
});
export const { GET, POST } = handlers;
