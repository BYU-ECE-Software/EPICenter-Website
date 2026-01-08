import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string;
    email?: string;
    expiresAt: number;
    firstName: string;
    lastName?: string;
    netId?: string;
    accessToken?: string;
    byuId?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
    accessToken?: string;
    expiresAt?: number;
    firstName?: string;
  }
}
