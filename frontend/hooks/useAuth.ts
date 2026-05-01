"use client"

import { useAuthContext } from "@/components/auth/AuthProvider"

export function useAuth() {
  const { user, idToken, isLoading, linkMessage, signInWithGoogle, signOut } =
    useAuthContext()
  return { user, idToken, isLoading, linkMessage, signInWithGoogle, signOut }
}
