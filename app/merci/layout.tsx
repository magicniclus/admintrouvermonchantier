import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Merci - Inscription réussie | Trouver Mon Chantier",
  description: "Confirmation d'inscription réussie sur Trouver Mon Chantier. Votre demande a été enregistrée et sera traitée dans les plus brefs délais.",
}

export default function MerciLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
