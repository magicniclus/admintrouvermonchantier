"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronDown,
} from "lucide-react"
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { EditClientModal } from "@/components/edit-client-modal"

interface Client {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  entreprise?: string
  ville?: string
  StatutClient?: string
  DateConversionClient?: Timestamp
  [key: string]: any
}

export function ClientsTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("date-desc")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch clients from Firebase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const clientsRef = collection(db, "clients")
        const q = query(clientsRef, orderBy("DateConversionClient", "desc"))
        const querySnapshot = await getDocs(q)
        
        const clientsData: Client[] = []
        querySnapshot.forEach((doc) => {
          clientsData.push({
            id: doc.id,
            ...doc.data()
          } as Client)
        })
        
        setClients(clientsData)
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Filter and sort clients
  const filteredAndSortedClients = clients
    .filter(client => {
      const searchLower = searchTerm.toLowerCase()
      const fullName = `${client.Prenom || client.prenom || ''} ${client.Nom || client.nom || ''}`.toLowerCase()
      return (
        fullName.includes(searchLower) ||
        (client.Email || client.email)?.toLowerCase().includes(searchLower) ||
        (client.Entreprise || client.entreprise)?.toLowerCase().includes(searchLower) ||
        (client.Ville || client.ville)?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (b.DateConversionClient?.seconds || 0) - (a.DateConversionClient?.seconds || 0)
        case "date-asc":
          return (a.DateConversionClient?.seconds || 0) - (b.DateConversionClient?.seconds || 0)
        case "name-asc":
          return `${a.Prenom || a.prenom || ''} ${a.Nom || a.nom || ''}`.localeCompare(`${b.Prenom || b.prenom || ''} ${b.Nom || b.nom || ''}`)
        case "name-desc":
          return `${b.Prenom || b.prenom || ''} ${b.Nom || b.nom || ''}`.localeCompare(`${a.Prenom || a.prenom || ''} ${a.Nom || a.nom || ''}`)
        default:
          return 0
      }
    })

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsEditModalOpen(true)
  }

  const handleClientUpdated = () => {
    // Refresh clients list
    const fetchClients = async () => {
      try {
        const clientsRef = collection(db, "clients")
        const q = query(clientsRef, orderBy("DateConversionClient", "desc"))
        const querySnapshot = await getDocs(q)
        
        const clientsData: Client[] = []
        querySnapshot.forEach((doc) => {
          clientsData.push({
            id: doc.id,
            ...doc.data()
          } as Client)
        })
        
        setClients(clientsData)
      } catch (error) {
        console.error("Erreur lors du rechargement des clients:", error)
      }
    }

    fetchClients()
    setIsEditModalOpen(false)
    setEditingClient(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 h-12">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Plus récents</SelectItem>
              <SelectItem value="date-asc">Plus anciens</SelectItem>
              <SelectItem value="name-asc">Nom A-Z</SelectItem>
              <SelectItem value="name-desc">Nom Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAndSortedClients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? "Aucun client trouvé pour cette recherche" : "Aucun client pour le moment"}
          </div>
        ) : (
          filteredAndSortedClients.map((client) => (
            <motion.div key={client.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {`${(client.Prenom || client.prenom)?.[0] || ''}${(client.Nom || client.nom)?.[0] || ''}`}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {`${client.Prenom || client.prenom || ''} ${client.Nom || client.nom || ''}`}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.Email || client.email}
                          </span>
                          {(client.Telephone || client.telephone || client.Téléphone) && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.Telephone || client.telephone || client.Téléphone}
                            </span>
                          )}
                          {(client.Ville || client.ville) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {client.Ville || client.ville}
                            </span>
                          )}
                          {client.DateConversionClient && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(client.DateConversionClient.seconds * 1000).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        {(client.Entreprise || client.entreprise) && (
                          <div className="text-sm text-gray-500 mt-1">
                            {client.Entreprise || client.entreprise}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.StatutClient === "Actif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {client.StatutClient || "Actif"}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
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

      {/* Edit Client Modal */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingClient(null)
          }}
          onClientUpdated={handleClientUpdated}
        />
      )}
    </div>
  )
}
