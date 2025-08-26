"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditProspectModal } from "@/components/edit-prospect-modal"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronDown,
  Briefcase,
} from "lucide-react"

interface Prospect {
  id: string
  Nom: string
  Prenom: string
  Email: string
  Téléphone: number | string
  Entreprise: string
  Metier?: string
  Etape: string
  Date: Date | Timestamp
  RGPD: boolean
  Commentaire?: string
}

export function ProspectsTab() {
  const [prospectSearchTerm, setProspectSearchTerm] = useState("")
  const [prospectSortBy, setProspectSortBy] = useState("date-desc")
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [prospectsLoading, setProspectsLoading] = useState(true)
  const [prospectsError, setProspectsError] = useState<string | null>(null)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Edit prospect
  const handleEditProspect = (prospect: Prospect) => {
    setEditingProspect(prospect)
    setIsEditModalOpen(true)
  }

  const handleProspectUpdated = (updatedProspect: Prospect) => {
    setProspects(prev => prev.map(p => (p.id === updatedProspect.id ? updatedProspect : p)))
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingProspect(null)
  }

  const handleProspectConverted = () => {
    // Recharger la liste des prospects après conversion
    setProspects(prev => prev.filter(p => p.id !== editingProspect?.id))
    setIsEditModalOpen(false)
    setEditingProspect(null)
    
    // Rediriger vers l'onglet clients
    if (typeof window !== 'undefined') {
      // Utiliser l'URL pour changer d'onglet
      const url = new URL(window.location.href)
      url.searchParams.set('tab', 'clients')
      window.history.pushState({}, '', url.toString())
      
      // Déclencher un événement pour changer l'onglet actif
      window.dispatchEvent(new CustomEvent('tabChange', { detail: 'clients' }))
    }
  }

  // Fetch prospects
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setProspectsLoading(true)
        const prospectsRef = collection(db, "prospects")
        const querySnapshot = await getDocs(prospectsRef)
        const prospectsData: Prospect[] = []
        querySnapshot.forEach((d) => {
          prospectsData.push({
            id: d.id,
            ...(d.data() as Omit<Prospect, "id">),
          })
        })
        setProspects(prospectsData)
        setProspectsError(null)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        setProspectsError(msg)
      } finally {
        setProspectsLoading(false)
      }
    }
    fetchProspects()
  }, [])

  // Filter + sort prospects
  const filteredAndSortedProspects = prospects
    .filter((prospect) => {
      if (!prospectSearchTerm.trim()) return true
      const fullName = `${prospect.Prenom || ""} ${prospect.Nom || ""}`.toLowerCase()
      const searchLower = prospectSearchTerm.toLowerCase()
      return (
        fullName.includes(searchLower) ||
        (prospect.Email || "").toLowerCase().includes(searchLower) ||
        (prospect.Entreprise || "").toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      switch (prospectSortBy) {
        case "date-desc":
          return (b.Date instanceof Timestamp ? b.Date.toDate().getTime() : (b.Date?.getTime() || 0)) - (a.Date instanceof Timestamp ? a.Date.toDate().getTime() : (a.Date?.getTime() || 0))
        case "date-asc":
          return (a.Date instanceof Timestamp ? a.Date.toDate().getTime() : (a.Date?.getTime() || 0)) - (b.Date instanceof Timestamp ? b.Date.toDate().getTime() : (b.Date?.getTime() || 0))
        case "name-asc":
          return `${a.Prenom || ""} ${a.Nom || ""}`.localeCompare(`${b.Prenom || ""} ${b.Nom || ""}`)
        case "name-desc":
          return `${b.Prenom || ""} ${b.Nom || ""}`.localeCompare(`${a.Prenom || ""} ${a.Nom || ""}`)
        case "status":
          const order: Record<string, number> = { "A contacter": 3, "Terbong": 2, "Froid": 1 }
          return (order[b.Etape] || 0) - (order[a.Etape] || 0)
        default:
          return 0
      }
    })

  const formatDate = (firebaseDate: Date | Timestamp) => {
    if (!firebaseDate) return "Date inconnue"
    try {
      const date = firebaseDate instanceof Timestamp ? firebaseDate.toDate() : firebaseDate
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {
      return "Date invalide"
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un prospect..."
                value={prospectSearchTerm}
                onChange={(e) => setProspectSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={prospectSortBy}
                onChange={(e) => setProspectSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-md px-4 py-2 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="date-desc">Plus récent</option>
                <option value="date-asc">Plus ancien</option>
                <option value="name-asc">Nom A-Z</option>
                <option value="name-desc">Nom Z-A</option>
                <option value="status">Par statut</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-10 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau prospect
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {prospectsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des prospects...</p>
            </div>
          ) : prospectsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">{prospectsError}</p>
            </div>
          ) : filteredAndSortedProspects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun prospect trouvé</p>
              <div className="text-xs text-gray-400">Total prospects chargés: {prospects.length}</div>
            </div>
          ) : (
            filteredAndSortedProspects.map((prospect, index) => (
              <motion.div
                key={prospect.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {`${prospect.Prenom?.[0] || ""}${prospect.Nom?.[0] || ""}`.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{`${prospect.Prenom || ""} ${prospect.Nom || ""}`.trim()}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {prospect.Email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {prospect.Téléphone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {prospect.Entreprise}
                            </span>
                            {prospect.Metier && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {prospect.Metier}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(prospect.Date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            prospect.Etape === "A contacter"
                              ? "bg-red-100 text-red-800"
                              : prospect.Etape === "Terbong"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {prospect.Etape}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleEditProspect(prospect)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Edit Prospect Modal */}
      <EditProspectModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        prospect={editingProspect}
        onProspectUpdated={handleProspectUpdated}
        onProspectConverted={handleProspectConverted}
      />
    </>
  )
}
