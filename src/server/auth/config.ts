import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import { db } from "@/server/db";
import { env } from "@/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      provider?: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * OAuth2 profile interface for TaraftarCell API
 */
interface TaraftarCellProfile {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  preferred_username?: string;
  email_verified?: boolean;
  picture?: string;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    // Custom Fenertalk OAuth2 Provider
    {
      id: "fenertalk",
      name: "Fenertalk",
      type: "oauth" as const,
      clientId: env.AUTH_FENERTALK_CLIENT_ID,
      clientSecret: env.AUTH_FENERTALK_CLIENT_SECRET,

      // ✅ Issuer'ı belirtin (hata çözümü için kritik)
      issuer: `${env.TARAFTARCELL_OAUTH_URL}/`,

      // ✅ Well-known endpoint'i belirtin
      wellKnown: `${env.TARAFTARCELL_OAUTH_URL}/.well-known/openid-configuration`,

      authorization: {
        url: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/authorize`,
        params: {
          scope: "profile email fenertalk.read fenertalk.write",
          response_type: "code",
        },
      },
      token: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/token`,
      userinfo: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/userinfo`,

      // ✅ Checks parametresi - sadece PKCE kullanın
      checks: ["pkce"],

      // ✅ Client konfigürasyonu
      client: {
        authorization_signed_response_alg: undefined,
        id_token_signed_response_alg: undefined,
        issuer_validation: false, // ✅ Bu eksikti!
      },

      profile(profile: TaraftarCellProfile) {
        return {
          id: profile.sub,
          name:
            profile.name ??
            (profile.given_name || profile.family_name
              ? `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim()
              : null),
          email: profile.email ?? null,
          image: profile.picture ?? null,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    },

    // Custom Galatalk OAuth2 Provider
    {
      id: "galatalk",
      name: "Galatalk",
      type: "oauth" as const,
      clientId: env.AUTH_GALATALK_CLIENT_ID,
      clientSecret: env.AUTH_GALATALK_CLIENT_SECRET,

      // ✅ Issuer'ı belirtin (hata çözümü için kritik) - Trailing slash ekleyin!
      issuer: `${env.TARAFTARCELL_OAUTH_URL}/`,

      // ✅ Well-known endpoint'i belirtin
      wellKnown: `${env.TARAFTARCELL_OAUTH_URL}/.well-known/openid-configuration`,

      authorization: {
        url: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/authorize`,
        params: {
          scope: "profile email galatalk.read galatalk.write",
          response_type: "code",
        },
      },
      token: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/token`,
      userinfo: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/userinfo`,

      // ✅ Checks parametresi - sadece PKCE kullanın
      checks: ["pkce"],

      // ✅ Client konfigürasyonu
      client: {
        authorization_signed_response_alg: undefined,
        id_token_signed_response_alg: undefined,
        issuer_validation: false, // ✅ Bu da eksikti!
      },

      profile(profile: TaraftarCellProfile) {
        return {
          id: profile.sub,
          name:
            profile.name ??
            (profile.given_name || profile.family_name
              ? `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim()
              : null),
          email: profile.email ?? null,
          image: profile.picture ?? null,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    },
  ],
  adapter: PrismaAdapter(db),

  // ✅ Bu çok önemli - HTTP'ye izin ver
  trustHost: true,

  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    async signIn({ user, account, profile }) {
      try {
        if (
          account &&
          profile &&
          (account.provider === "fenertalk" || account.provider === "galatalk")
        ) {
          const typedProfile = profile as TaraftarCellProfile;

          // Update user with additional OAuth2 information
          await db.user.update({
            where: { id: user.id },
            data: {
              givenName: typedProfile.given_name ?? null,
              familyName: typedProfile.family_name ?? null,
              username: typedProfile.preferred_username ?? null,
            },
          });
        }
        return true;
      } catch (error) {
        console.error("Error updating user with OAuth2 data:", error);
        // Continue with sign-in even if additional data update fails
        return true;
      }
    },
  },
  session: {
    strategy: "database" as const,
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;
