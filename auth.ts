import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "byu-pkce",
      name: "BYU Authentication",
      type: "oauth",
      wellKnown: `${process.env.BYU_ISSUER}/.well-known/openid-configuration`,
      authorization: {
        url: `${process.env.BYU_ISSUER}/authorize`,
        params: {
          scope: "openid",
        },
      },
      token: `${process.env.BYU_ISSUER}/token`,
      userinfo: `${process.env.BYU_ISSUER}/userinfo`,
      issuer: "https://api.byu.edu",
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      clientId: process.env.BYU_CLIENT_ID,
      profile(profile, tokens) {
        console.log("BYU Profile:", profile);
        console.log("BYU Tokens:", tokens);
        return {
          id: profile.sub,
          netId: profile.net_id,
          firstName: profile.preferred_first_name,
          lastName: profile.surname,
          accessToken: tokens.access_token,
          expiresAt: profile.exp,
          tokenType: tokens.token_type,
          byuId: profile.byu_id,

        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
        };
        token.accessToken = account?.access_token;
        token.expiresAt = Number(user.expiresAt);
        token.firstName = user.firstName;
        token.netId = user.netId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as typeof session.user;
      session.user.expiresAt = token.expiresAt as number;
      session.user.firstName = token.firstName as string;
      session.user.id = token.netId as string;

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      const urlOrigin = new URL(url).origin;
      const baseOrigin = new URL(baseUrl).origin;
      const issuerOrigin = new URL(process.env.BYU_ISSUER!).origin;

      if (urlOrigin === baseOrigin) return url;
      if (urlOrigin === issuerOrigin) return url;

      return baseUrl;
    },
  },
  session: {
    maxAge: 60 * 60,
    strategy: "jwt",
    updateAge: 60 * 60,
  },
  pages: {
    signIn: `/api/auth/login`,
    signOut: `/api/auth/logout`,
    error: `/api/auth/error`,
  },
});
