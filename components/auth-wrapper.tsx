"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Loading } from "@/components/ui/loading"
import { LoginForm } from "@/components/login-form"

export function AuthWrapper() {
  const [loading, setLoading] = useState(true)
  const [, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Vérifie le rôle en lisant admins/{uid}
  const checkAdminRoleByUid = async (uid: string) => {
    try {
      const ref = doc(db, "admins", uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        return false
      }

      const data = snap.data() as { role?: string }
      return data?.role === "Super Admin"
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle:", error)
      return false
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Utilisateur connecté, vérifier son rôle
        const isAdmin = await checkAdminRoleByUid(currentUser.uid)
        
        if (isAdmin) {
          // Utilisateur connecté et admin valide, rediriger vers dashboard
          router.push("/dashboard")
        } else {
          // Utilisateur connecté mais pas admin, déconnecter
          await auth.signOut()
          setLoading(false)
        }
      } else {
        // Aucun utilisateur connecté, afficher le formulaire de connexion
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return <Loading />
  }

  return <LoginForm />
}
