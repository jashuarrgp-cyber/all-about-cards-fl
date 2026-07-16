import type { DefaultSession } from 'next-auth';
import type { Role } from '@/lib/auth/permissions';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roles: Role[];
    };
  }

  interface User {
    roles?: Role[];
  }
}
