"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  X,
  Save,
  User,
  Building,
  Globe,
  Award,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Link,
  Copy,
} from "lucide-react"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

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

interface EditClientModalProps {
  client: Client
  isOpen: boolean
  onClose: () => void
  onClientUpdated: () => void
}

export function EditClientModal({ client, isOpen, onClose, onClientUpdated }: EditClientModalProps) {
  const [formData, setFormData] = useState<Client | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [onboardingLink, setOnboardingLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData({ ...client })
      // Generate onboarding link
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      setOnboardingLink(`${baseUrl}/onboarding?clientId=${client.id}`)
    }
  }, [client])

  const copyOnboardingLink = async () => {
    try {
      await navigator.clipboard.writeText(onboardingLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
    }
  }

  const openOnboardingLink = () => {
    window.open(onboardingLink, '_blank')
  }

  const handleInputChange = (field: string, value: any) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      setIsUpdating(true)
      const { id, ...updateData } = formData
      await updateDoc(doc(db, "clients", id), updateData)
      onClientUpdated()
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!formData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Modifier le client
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <h3 className="font-semibold">Informations personnelles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                      id="prenom"
                      value={formData.Prenom || formData.prenom || ""}
                      onChange={(e) => handleInputChange("Prenom", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      value={formData.Nom || formData.nom || ""}
                      onChange={(e) => handleInputChange("Nom", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.Email || formData.email || ""}
                      onChange={(e) => handleInputChange("Email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.Telephone || formData.telephone || formData.Téléphone || ""}
                      onChange={(e) => handleInputChange("Téléphone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      value={formData.Ville || formData.ville || ""}
                      onChange={(e) => handleInputChange("Ville", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="StatutClient">Statut</Label>
                    <Select
                      value={formData.StatutClient || "Actif"}
                      onValueChange={(value) => handleInputChange("StatutClient", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="Inactif">Inactif</SelectItem>
                        <SelectItem value="En pause">En pause</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informations entreprise */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <h3 className="font-semibold">Informations entreprise</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entreprise">Nom de l'entreprise</Label>
                    <Input
                      id="entreprise"
                      value={formData.Entreprise || formData.entreprise || ""}
                      onChange={(e) => handleInputChange("Entreprise", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secteurActivite">Secteur d'activité</Label>
                    <Input
                      id="secteurActivite"
                      value={formData.SecteurActivite || formData.secteurActivite || ""}
                      onChange={(e) => handleInputChange("SecteurActivite", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombreEmployes">Nombre d'employés</Label>
                    <Select
                      value={formData.NombreEmployes || formData.nombreEmployes || ""}
                      onValueChange={(value) => handleInputChange("NombreEmployes", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 employés</SelectItem>
                        <SelectItem value="6-20">6-20 employés</SelectItem>
                        <SelectItem value="21-50">21-50 employés</SelectItem>
                        <SelectItem value="51-100">51-100 employés</SelectItem>
                        <SelectItem value="100+">Plus de 100 employés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="chiffreAffaires">Chiffre d'affaires annuel</Label>
                    <Select
                      value={formData.ChiffreAffaires || formData.chiffreAffaires || ""}
                      onValueChange={(value) => handleInputChange("ChiffreAffaires", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<100k">Moins de 100k€</SelectItem>
                        <SelectItem value="100k-500k">100k€ - 500k€</SelectItem>
                        <SelectItem value="500k-1M">500k€ - 1M€</SelectItem>
                        <SelectItem value="1M-5M">1M€ - 5M€</SelectItem>
                        <SelectItem value="5M+">Plus de 5M€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Présence digitale */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <h3 className="font-semibold">Présence digitale</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="siteWebExistant"
                      checked={formData.SiteWebExistant || formData.siteWebExistant || false}
                      onCheckedChange={(checked) => handleInputChange("SiteWebExistant", checked)}
                    />
                    <Label htmlFor="siteWebExistant">Site web existant</Label>
                  </div>
                  {(formData.SiteWebExistant || formData.siteWebExistant) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Label htmlFor="urlSiteWeb">URL du site web</Label>
                      <Input
                        id="urlSiteWeb"
                        type="url"
                        placeholder="https://..."
                        value={formData.UrlSiteWeb || formData.urlSiteWeb || ""}
                        onChange={(e) => handleInputChange("UrlSiteWeb", e.target.value)}
                      />
                    </motion.div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="presenceReseauxSociaux"
                        checked={formData.PresenceReseauxSociaux || formData.presenceReseauxSociaux || false}
                        onCheckedChange={(checked) => handleInputChange("PresenceReseauxSociaux", checked)}
                      />
                      <Label htmlFor="presenceReseauxSociaux">Réseaux sociaux</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="publiciteEnLigne"
                        checked={formData.PubliciteEnLigne || formData.publiciteEnLigne || false}
                        onCheckedChange={(checked) => handleInputChange("PubliciteEnLigne", checked)}
                      />
                      <Label htmlFor="publiciteEnLigne">Publicité en ligne</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Services et certifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <h3 className="font-semibold">Services et certifications</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="servicesOfferts">Services offerts</Label>
                    <Textarea
                      id="servicesOfferts"
                      placeholder="Décrivez les services offerts..."
                      value={formData.ServicesOfferts || formData.servicesOfferts || ""}
                      onChange={(e) => handleInputChange("ServicesOfferts", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="certificationQualite"
                        checked={formData.CertificationQualite || formData.certificationQualite || false}
                        onCheckedChange={(checked) => handleInputChange("CertificationQualite", checked)}
                      />
                      <Label htmlFor="certificationQualite">Certification qualité</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assuranceResponsabilite"
                        checked={formData.AssuranceResponsabilite || formData.assuranceResponsabilite || false}
                        onCheckedChange={(checked) => handleInputChange("AssuranceResponsabilite", checked)}
                      />
                      <Label htmlFor="assuranceResponsabilite">Assurance responsabilité</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date de conversion */}
              {formData.DateConversionClient && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <h3 className="font-semibold">Informations client</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Converti en client le: {new Date(formData.DateConversionClient.seconds * 1000).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}

              <Separator />

              {/* Lien onboarding */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <h3 className="font-semibold">Lien d'onboarding</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Partagez ce lien avec le client pour qu'il puisse accéder à son onboarding personnalisé :
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Input
                      value={onboardingLink}
                      readOnly
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyOnboardingLink}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {linkCopied ? "Copié !" : "Copier"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openOnboardingLink}
                      className="shrink-0"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Ouvrir
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
