"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  linkWithCredential,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextValue {
  user: User | null
  idToken: string | null
  isLoading: boolean
  linkMessage: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_REFRESH_MS = 55 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [linkMessage, setLinkMessage] = useState<string | null>(null)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshToken = useCallback(async (u: User) => {
    const token = await u.getIdToken(true)
    setIdToken(token)
    return token
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const token = await u.getIdToken()
        setIdToken(token)

        refreshIntervalRef.current = setInterval(
          () => refreshToken(u),
          TOKEN_REFRESH_MS,
        )
      } else {
        setIdToken(null)
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [refreshToken])

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      setLinkMessage(null)
    } catch (err: unknown) {
      const error = err as { code?: string; customData?: { email?: string }; credential?: unknown }
      if (
        error.code === "auth/account-exists-with-different-credential" &&
        error.credential
      ) {
        try {
          if (auth.currentUser) {
            await linkWithCredential(
              auth.currentUser,
              error.credential as Parameters<typeof linkWithCredential>[1],
            )
            setLinkMessage(
              "We linked your Google account to your existing account.",
            )
          }
        } catch {
          throw new Error("Please sign in to continue.")
        }
      } else {
        throw err
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setLinkMessage(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, idToken, isLoading, linkMessage, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
  return ctx
}
