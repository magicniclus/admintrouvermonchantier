import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Création de compte - Trouver Mon Chantier",
  description: "Finalisation de la création de compte client Trouver Mon Chantier. Récupération des données prospect et transfert vers l'espace client.",
}

export default function CreationDeCompteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
