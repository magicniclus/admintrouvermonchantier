import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Onboarding Client - Trouver Mon Chantier",
  description: "Processus d'intégration des nouveaux clients Trouver Mon Chantier. Collecte des informations entreprise, services et création de profil.",
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
