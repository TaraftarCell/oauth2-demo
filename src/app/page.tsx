import Link from "next/link";

import { auth, signIn } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { db } from "@/server/db";

export default async function Home() {
  const session = await auth();

  // Get user with account information if logged in
  let userWithAccount = null;
  if (session?.user?.id) {
    userWithAccount = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
      },
    });
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] text-white">
        <div className="container flex max-w-6xl flex-col items-center justify-center gap-16 px-4 py-16">
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-[6rem]">
              OAuth2{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Demo
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-2xl leading-relaxed text-gray-300">
              Secure authentication demo with{" "}
              <span className="font-semibold text-yellow-400">Fenertalk</span>{" "}
              and <span className="font-semibold text-red-400">Galatalk</span>
            </p>
          </div>

          {!session ? (
            // Login section when not authenticated
            <div className="flex flex-col items-center gap-12">
              <div className="text-center">
                <h2 className="mb-4 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
                  Choose Your Platform
                </h2>
                <p className="text-xl text-gray-400">
                  Secure OAuth2 authentication
                </p>
              </div>

              <div className="grid w-full max-w-2xl grid-cols-1 gap-8 md:grid-cols-2">
                {/* Simple form-based signin for testing */}
                <form
                  action={async () => {
                    "use server";
                    await signIn("fenertalk");
                  }}
                >
                  <button
                    type="submit"
                    className="group relative w-full transform overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                      <span className="mb-4 block text-6xl">🟡</span>
                      <div className="mb-2 text-2xl font-bold">Fenertalk</div>
                      <div className="text-lg font-medium opacity-90">
                        Sign In
                      </div>
                      <div className="mt-2 text-sm opacity-75">
                        Fenerbahçe Community
                      </div>
                    </div>
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await signIn("galatalk");
                  }}
                >
                  <button
                    type="submit"
                    className="group relative w-full transform overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                      <span className="mb-4 block text-6xl">🔴</span>
                      <div className="mb-2 text-2xl font-bold">Galatalk</div>
                      <div className="text-lg font-medium opacity-90">
                        Sign In
                      </div>
                      <div className="mt-2 text-sm opacity-75">
                        Galatasaray Community
                      </div>
                    </div>
                  </button>
                </form>
              </div>

              {/* Features */}
              <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
                  <div className="mb-3 text-3xl">🔒</div>
                  <h3 className="mb-2 text-lg font-semibold">Secure</h3>
                  <p className="text-sm text-gray-400">
                    Industry-standard OAuth2 security
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
                  <div className="mb-3 text-3xl">⚡</div>
                  <h3 className="mb-2 text-lg font-semibold">Fast</h3>
                  <p className="text-sm text-gray-400">
                    Quick and seamless login experience
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
                  <div className="mb-3 text-3xl">🎯</div>
                  <h3 className="mb-2 text-lg font-semibold">Reliable</h3>
                  <p className="text-sm text-gray-400">
                    Built with modern authentication standards
                  </p>
                </div>
              </div>

              {/* Debug Information */}
              <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4 text-center">
                <p className="text-sm text-gray-300">Debug Mode: Development</p>
                <p className="mt-1 text-xs text-gray-400">
                  Check console for authentication logs
                </p>
              </div>
            </div>
          ) : (
            // User dashboard when authenticated
            <div className="flex w-full flex-col items-center gap-12">
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center gap-4">
                  <h2 className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
                    Welcome Back!
                  </h2>
                  <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                    <span className="text-sm font-medium">Authenticated</span>
                  </div>
                </div>
                <p className="text-xl text-gray-300">
                  Authentication successful
                </p>
              </div>

              {/* User Profile Card */}
              <div className="w-full max-w-5xl rounded-3xl border border-white/20 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
                <div className="mb-10 flex items-start gap-8">
                  <div className="flex-shrink-0">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-24 w-24 rounded-full border-4 border-white/20 shadow-xl"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold text-white shadow-xl">
                        {session.user.name?.charAt(0) ?? "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold text-transparent">
                      {session.user.name ?? "Anonymous User"}
                    </h3>
                    <p className="mb-2 text-xl text-gray-300">
                      {session.user.email}
                    </p>
                    {userWithAccount?.emailVerified && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">Email verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connected Accounts */}
                {userWithAccount?.accounts &&
                  userWithAccount.accounts.length > 0 && (
                    <div className="mb-8 border-t border-white/20 pt-8">
                      <h4 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Connected Accounts
                      </h4>
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {userWithAccount.accounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                          >
                            <div className="flex items-center gap-6">
                              <div className="text-4xl">
                                {account.provider === "fenertalk" && "🟡"}
                                {account.provider === "galatalk" && "🔴"}
                              </div>
                              <div>
                                <p className="text-xl font-bold capitalize">
                                  {account.provider}
                                </p>
                                <p className="text-sm text-gray-400">
                                  ID: {account.providerAccountId}
                                </p>
                                {account.scope && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    Scopes: {account.scope}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-100/20 px-3 py-1 text-sm font-medium text-green-400">
                                Active
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* User Additional Information */}
                {(userWithAccount?.givenName ??
                  userWithAccount?.familyName ??
                  userWithAccount?.username) && (
                  <div className="mb-8 border-t border-white/20 pt-8">
                    <h4 className="mb-6 text-2xl font-bold">
                      Profile Information
                    </h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {userWithAccount.givenName && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-1 text-sm text-gray-400">
                            First Name
                          </p>
                          <p className="text-lg font-semibold">
                            {userWithAccount.givenName}
                          </p>
                        </div>
                      )}
                      {userWithAccount.familyName && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-1 text-sm text-gray-400">
                            Last Name
                          </p>
                          <p className="text-lg font-semibold">
                            {userWithAccount.familyName}
                          </p>
                        </div>
                      )}
                      {userWithAccount.username && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-1 text-sm text-gray-400">Username</p>
                          <p className="text-lg font-semibold">
                            @{userWithAccount.username}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* System Information */}
                <div className="border-t border-white/20 pt-8">
                  <h4 className="mb-6 text-2xl font-bold">Account Details</h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-1 text-sm text-gray-400">User ID</p>
                      <p className="font-mono text-sm break-all">
                        {session.user.id}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-1 text-sm text-gray-400">Member Since</p>
                      <p className="font-semibold">
                        {userWithAccount?.createdAt?.toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        ) ?? "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-6">
                <Link
                  href="/api/auth/signout"
                  className="flex transform items-center gap-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/25"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
