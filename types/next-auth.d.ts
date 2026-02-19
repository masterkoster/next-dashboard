import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      emailVerified?: Date | null;
      role?: string;
      tier?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username?: string | null;
    emailVerified?: Date | null;
    role?: string;
    tier?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    emailVerified?: Date | null;
    role?: string;
    tier?: string;
  }
}
