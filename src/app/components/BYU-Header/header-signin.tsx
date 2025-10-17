"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { CircleUserRound, Loader2 } from "lucide-react"; // Import a spinner icon

export default function HeaderSignin() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false); // <-- new state

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user?.expiresAt) return;

    const expireAt = DateTime.fromSeconds(Number(session.user.expiresAt));
    if (!expireAt.isValid) {
      console.warn("Invalid expireAt value", session.user.expiresAt);
      return;
    }

    const now = DateTime.local();
    const timeUntilExpiration = expireAt.diff(now).as("milliseconds");

    if (timeUntilExpiration <= 1000) {
      console.log("Session expired or about to expire, re-signing in...");
      signIn("byu-pkce");
      return;
    }

    const timer = setTimeout(() => {
      console.log("Session about to expire, re-signing in...");
      signIn("byu-pkce");
    }, timeUntilExpiration);

    return () => clearTimeout(timer);
  }, [session?.user?.expiresAt, status]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn("byu-pkce");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="ml-auto flex items-center space-x-4 text-white">
      {status === "authenticated" ? (
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{session.user?.firstName}</span>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 py-1 pr-8 font-medium hover:underline transition"
          >
            <CircleUserRound className="w-6 h-6" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="flex items-center space-x-2 py-1 pr-8 font-medium hover:underline transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-semibold">Signing In...</span>
            </>
          ) : (
            <>
              <CircleUserRound className="w-6 h-6" />
              <span className="font-semibold">Sign In</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}