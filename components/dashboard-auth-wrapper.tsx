  "use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Loading } from "@/components/ui/loading"
import { Dashboard } from "@/components/dashboard"

export function DashboardAuthWrapper() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
      if (currentUser) {
        // Utilisateur connecté, vérifier son rôle
        const isAdmin = await checkAdminRoleByUid(currentUser.uid)
        
        if (isAdmin) {
          // Utilisateur connecté et admin valide, autoriser l'accès
          setIsAuthenticated(true)
          setLoading(false)
        } else {
          // Utilisateur connecté mais pas admin, déconnecter et rediriger
          await auth.signOut()
          setIsAuthenticated(false)
          router.push("/")
        }
      } else {
        // Aucun utilisateur connecté, rediriger vers l'accueil
        setIsAuthenticated(false)
        router.push("/")
      }
    })

    // Cleanup function
    return () => unsubscribe()
  }, [router])

  // Afficher le loader pendant la vérification
  if (loading) {
    return <Loading />
  }

  // Afficher le dashboard seulement si authentifié
  if (isAuthenticated) {
    return <Dashboard />
  }

  // Fallback - ne devrait pas être atteint grâce aux redirections
  return <Loading />
}
