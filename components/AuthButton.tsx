"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Login with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      {session.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt={session.user.name || "User"}
          className="h-8 w-8 rounded-full border border-slate-200"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          {(session.user.name || "U").slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="max-w-36">
        <p className="truncate text-sm font-medium text-slate-800">{session.user.name || "Google User"}</p>
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Logout
      </button>
    </div>
  );
}
