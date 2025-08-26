import type { Metadata } from "next"
import { AuthWrapper } from "@/components/auth-wrapper"

export const metadata: Metadata = {
  title: "Connexion Admin - Trouver Mon Chantier",
  description: "Accès sécurisé à l'interface d'administration de Trouver Mon Chantier. Connexion réservée aux administrateurs pour la gestion des prospects et clients.",
}

export default function Home() {
  return <AuthWrapper />
}
