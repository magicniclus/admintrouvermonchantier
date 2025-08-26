import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tableau de bord Admin - Trouver Mon Chantier",
  description: "Interface d'administration pour gérer les clients, prospects et finances de Trouver Mon Chantier. Accès sécurisé aux données commerciales.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
