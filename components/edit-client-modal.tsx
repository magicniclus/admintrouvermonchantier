"use client"

import React, { useState, useEffect } from "react"
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
  Save,
  User,
  Building,
  Globe,
  Briefcase,
  Mail,
  Calendar,
  Link as LinkIcon,
  Copy,
  FileText,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Download,
  Archive,
  CreditCard,
} from "lucide-react"
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ClientRaw {
  id: string
  // anciennes variantes possibles
  Prenom?: string; Nom?: string; Email?: string; Téléphone?: string; Telephone?: string; Ville?: string; Entreprise?: string
  SecteurActivite?: string; NombreEmployes?: string; ChiffreAffaires?: string
  BaliseGoogleAds?: string; SiteInternetClient?: string
  UrlSiteWeb?: string; SiteWebExistant?: boolean
  PresenceReseauxSociaux?: boolean; PubliciteEnLigne?: boolean
  ServicesOfferts?: string
  CertificationQualite?: boolean; AssuranceResponsabilite?: boolean
  StatutClient?: string
  DateConversionClient?: Timestamp
  onboardingCompleted?: boolean
  onboarding?: boolean
  // camelCase déjà présents éventuellement
  prenom?: string; nom?: string; email?: string; telephone?: string; ville?: string; entreprise?: string
  secteurActivite?: string; nombreEmployes?: string; chiffreAffaires?: string
  baliseGoogleAds?: string; siteInternetClient?: string
  urlSiteWeb?: string; siteWebExistant?: boolean
  presenceReseauxSociaux?: boolean; publiciteEnLigne?: boolean
  servicesOfferts?: string
  certificationQualite?: boolean; assuranceResponsabilite?: boolean
  statutClient?: string
  dateConversionClient?: Timestamp
  [key: string]: unknown
}

interface Client {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  ville?: string
  entreprise?: string
  secteurActivite?: string
  nombreEmployes?: string
  chiffreAffaires?: string
  baliseGoogleAds?: string
  siteInternetClient?: string
  urlSiteWeb?: string
  siteWebExistant?: boolean
  presenceReseauxSociaux?: boolean
  publiciteEnLigne?: boolean
  servicesOfferts?: string
  certificationQualite?: boolean
  assuranceResponsabilite?: boolean
  statutClient?: string
  dateConversionClient?: Timestamp
  rayonIntervention?: string
  onboardingCompleted?: boolean
  onboarding?: boolean
  [key: string]: unknown
}

interface OnboardingData {
  prenom: string
  nom: string
  email: string
  telephone: string
  nomEntreprise: string
  raisonSociale: string
  adresseEntreprise: string
  codePostal: string
  ville: string
  anneeCreation: string
  nombreCollaborateurs: string
  prestation: string
  rayonIntervention: string
  certification: string
  garanties: string
  partenaire: string
  descriptionEntreprise: string
  histoireCreateur: string
  prestationsDetaillees: string
  formations: string
  siteWebExistant: boolean
  siteWebURL: string
  commentaire: string
  chantiersImages?: string[]
  employesImages?: string[]
  logoImage?: string
  dateCompletion?: Timestamp
  status?: string
}

interface EditClientModalProps {
  client: ClientRaw
  isOpen: boolean
  onClose: () => void
  onClientUpdated: () => void
}

/** Normalise un client aux clés camelCase internes */
function normalizeClient(c: ClientRaw): Client {
  return {
    id: c.id,
    prenom: String(c.prenom ?? c.Prenom ?? ""),
    nom: String(c.nom ?? c.Nom ?? ""),
    email: String(c.email ?? c.Email ?? ""),
    telephone: String(c.telephone ?? c.Telephone ?? c.Téléphone ?? ""),
    ville: (c.ville ?? c.Ville) as string | undefined,
    entreprise: (c.entreprise ?? c.Entreprise) as string | undefined,
    secteurActivite: (c.secteurActivite ?? c.SecteurActivite) as string | undefined,
    nombreEmployes: (c.nombreEmployes ?? c.NombreEmployes) as string | undefined,
    chiffreAffaires: (c.chiffreAffaires ?? c.ChiffreAffaires) as string | undefined,
    baliseGoogleAds: (c.baliseGoogleAds ?? c.BaliseGoogleAds) as string | undefined,
    siteInternetClient: (c.siteInternetClient ?? c.SiteInternetClient) as string | undefined,
    urlSiteWeb: (c.urlSiteWeb ?? c.UrlSiteWeb) as string | undefined,
    siteWebExistant: Boolean(c.siteWebExistant ?? c.SiteWebExistant ?? false),
    presenceReseauxSociaux: Boolean(c.presenceReseauxSociaux ?? c.PresenceReseauxSociaux ?? false),
    publiciteEnLigne: Boolean(c.publiciteEnLigne ?? c.PubliciteEnLigne ?? false),
    servicesOfferts: (c.servicesOfferts ?? c.ServicesOfferts) as string | undefined,
    certificationQualite: Boolean(c.certificationQualite ?? c.CertificationQualite ?? false),
    assuranceResponsabilite: Boolean(c.assuranceResponsabilite ?? c.AssuranceResponsabilite ?? false),
    statutClient: (c.statutClient ?? c.StatutClient ?? "Actif") as string,
    dateConversionClient: (c.dateConversionClient ?? c.DateConversionClient) as Timestamp | undefined,
    rayonIntervention: (c.rayonIntervention ?? c.RayonIntervention) as string | undefined,
    onboardingCompleted: Boolean(c.onboardingCompleted),
    onboarding: Boolean(c.onboarding),
  }
}

/** Prépare les données à écrire en base : uniquement le schéma propre camelCase */
const _toFirestoreUpdate = (data: Partial<Client>) => {
  const {
    id, // on l’enlève
    ...rest
  } = data
  return rest
}

export function EditClientModal({ client, isOpen, onClose, onClientUpdated }: EditClientModalProps) {
  const [formData, setFormData] = useState<Client | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [onboardingLink, setOnboardingLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [showOnboardingData, setShowOnboardingData] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [loadingOnboarding, setLoadingOnboarding] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<"90j-offert" | "classique" | null>(null)
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false)

  useEffect(() => {
    if (!client) return
    const normalized = normalizeClient(client)
    setFormData(normalized)

    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    setOnboardingLink(`${baseUrl}/onboarding?clientId=${client.id}`)
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
    window.open(onboardingLink, "_blank")
  }

  const fetchOnboardingData = async () => {
    if (!client.id || loadingOnboarding) return
    try {
      setLoadingOnboarding(true)
      const onboardingRef = doc(db, "clients", client.id, "onboarding", "data")
      const onboardingSnap = await getDoc(onboardingRef)
      if (onboardingSnap.exists()) {
        setOnboardingData(onboardingSnap.data() as OnboardingData)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données d'onboarding:", error)
    } finally {
      setLoadingOnboarding(false)
    }
  }

  const toggleOnboardingData = () => {
    if (!showOnboardingData && !onboardingData) {
      fetchOnboardingData()
    }
    setShowOnboardingData(!showOnboardingData)
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      window.open(imageUrl, "_blank")
    }
  }

  const downloadAllImages = async (images: string[], category: string) => {
    if (!images || images.length === 0) return
    for (let i = 0; i < images.length; i++) {
      const extension = images[i].split(".").pop()?.split("?")[0] || "jpg"
      await downloadImage(images[i], `${category}_${i + 1}.${extension}`)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }
  }

  const handleInputChange = (field: keyof Client, value: unknown) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value } as Client)
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      setIsUpdating(true)
      const { id, ...updateData } = formData
      // Type assertion to satisfy Firebase's updateDoc requirements
      await updateDoc(doc(db, "clients", id), updateData)
      onClientUpdated()
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendPaymentLink = async () => {
    if (!selectedOffer || !formData) return
    try {
      setSendingPaymentLink(true)
      const response = await fetch("/api/send-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.prenom,
          lastName: formData.nom,
          offerType: selectedOffer,
          clientId: formData.id,
        }),
      })
      if (response.ok) {
        alert("Email de lien de paiement envoyé avec succès !")
        setShowPaymentModal(false)
        setSelectedOffer(null)
      } else {
        const error = await response.json()
        alert("Erreur lors de l'envoi: " + error.error)
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'envoi de l'email")
    } finally {
      setSendingPaymentLink(false)
    }
  }

  const getDateInputValue = (timestamp?: Timestamp): string => {
    if (!timestamp?.seconds) return ""
    return new Date(timestamp.seconds * 1000).toISOString().split("T")[0]
  }

  if (!formData) return null

  return (
    <>
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
                      <Label htmlFor="rayonIntervention">Rayon d&apos;intervention (km)</Label>
                      <Input
                        id="rayonIntervention"
                        value={String(formData.rayonIntervention ?? "")}
                        onChange={(e) => handleInputChange("rayonIntervention", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={String(formData.prenom ?? "")}
                        onChange={(e) => handleInputChange("prenom", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        value={String(formData.nom ?? "")}
                        onChange={(e) => handleInputChange("nom", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={String(formData.email ?? "")}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        value={String(formData.telephone ?? "")}
                        onChange={(e) => handleInputChange("telephone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ville">Ville</Label>
                      <Input
                        id="ville"
                        value={String(formData.ville ?? "")}
                        onChange={(e) => handleInputChange("ville", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="statutClient">Statut</Label>
                      <Select
                        value={formData.statutClient ?? "Actif"}
                        onValueChange={(value) => handleInputChange("statutClient", value)}
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
                      <Label htmlFor="entreprise">Nom de l&apos;entreprise</Label>
                      <Input
                        id="entreprise"
                        value={String(formData.entreprise ?? "")}
                        onChange={(e) => handleInputChange("entreprise", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secteurActivite">Secteur d&apos;activité</Label>
                      <Input
                        id="secteurActivite"
                        value={String(formData.secteurActivite ?? "")}
                        onChange={(e) => handleInputChange("secteurActivite", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nombreEmployes">Nombre d&apos;employés</Label>
                      <Select
                        value={String(formData.nombreEmployes ?? "")}
                        onValueChange={(value) => handleInputChange("nombreEmployes", value)}
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
                      <Label htmlFor="chiffreAffaires">Chiffre d&apos;affaires annuel</Label>
                      <Select
                        value={String(formData.chiffreAffaires ?? "")}
                        onValueChange={(value) => handleInputChange("chiffreAffaires", value)}
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
                    <div>
                      <Label htmlFor="siteInternetClient">Site internet du client</Label>
                      <Input
                        id="siteInternetClient"
                        type="url"
                        placeholder="https://..."
                        value={String(formData.siteInternetClient ?? "")}
                        onChange={(e) => handleInputChange("siteInternetClient", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="baliseGoogleAds">Balise Google Ads</Label>
                      <Input
                        id="baliseGoogleAds"
                        placeholder="Numéro de la balise Google Ads"
                        value={String(formData.baliseGoogleAds ?? "")}
                        onChange={(e) => handleInputChange("baliseGoogleAds", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="siteWebExistant"
                        checked={Boolean(formData.siteWebExistant)}
                        onCheckedChange={(checked) => handleInputChange("siteWebExistant", Boolean(checked))}
                      />
                      <Label htmlFor="siteWebExistant">Site web existant</Label>
                    </div>

                    {Boolean(formData.siteWebExistant) && (
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
                          value={String(formData.urlSiteWeb ?? "")}
                          onChange={(e) => handleInputChange("urlSiteWeb", e.target.value)}
                        />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="presenceReseauxSociaux"
                          checked={Boolean(formData.presenceReseauxSociaux)}
                          onCheckedChange={(checked) => handleInputChange("presenceReseauxSociaux", Boolean(checked))}
                        />
                        <Label htmlFor="presenceReseauxSociaux">Réseaux sociaux</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="publiciteEnLigne"
                          checked={Boolean(formData.publiciteEnLigne)}
                          onCheckedChange={(checked) => handleInputChange("publiciteEnLigne", Boolean(checked))}
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
                        value={String(formData.servicesOfferts ?? "")}
                        onChange={(e) => handleInputChange("servicesOfferts", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="certificationQualite"
                          checked={Boolean(formData.certificationQualite)}
                          onCheckedChange={(checked) => handleInputChange("certificationQualite", Boolean(checked))}
                        />
                        <Label htmlFor="certificationQualite">Certification qualité</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="assuranceResponsabilite"
                          checked={Boolean(formData.assuranceResponsabilite)}
                          onCheckedChange={(checked) => handleInputChange("assuranceResponsabilite", Boolean(checked))}
                        />
                        <Label htmlFor="assuranceResponsabilite">Assurance responsabilité</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Champ Date modifiable */}
                <div>
                  <Label>Date de conversion</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <Input
                      type="date"
                      value={getDateInputValue(formData.dateConversionClient)}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                dateConversionClient: Timestamp.fromDate(new Date(e.target.value)),
                              }
                            : prev
                        )
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Lien de paiement */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <h3 className="font-semibold">Lien de paiement</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Envoyez un lien de paiement sécurisé au client pour finaliser son abonnement :
                    </div>
                    <Button onClick={() => setShowPaymentModal(true)} className="w-full" variant="default">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Envoyer lien de paiement
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Lien onboarding */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <h3 className="font-semibold">Lien d&apos;onboarding</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Partagez ce lien avec le client pour qu&apos;il puisse accéder à son onboarding personnalisé :
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                      <Input value={onboardingLink} readOnly className="flex-1 bg-transparent border-none focus:ring-0 text-sm" />
                      <Button variant="outline" size="sm" onClick={copyOnboardingLink} className="shrink-0">
                        <Copy className="w-4 h-4 mr-1" />
                        {linkCopied ? "Copié !" : "Copier"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={openOnboardingLink} className="shrink-0">
                        <Globe className="w-4 h-4 mr-1" />
                        Ouvrir
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Section données d'onboarding */}
                {(formData.onboardingCompleted || formData.onboarding) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <h3 className="font-semibold">Données d&apos;onboarding</h3>
                          <Badge variant="secondary" className="text-xs">
                            Complété
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleOnboardingData} disabled={loadingOnboarding}>
                          {loadingOnboarding ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : showOnboardingData ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Masquer
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Afficher
                            </>
                          )}
                        </Button>
                      </div>

                      {showOnboardingData && onboardingData && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 p-4 bg-gray-50 rounded-lg border"
                        >
                          {/* Informations personnelles onboarding */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Informations personnelles
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Prénom:</span>
                                <p className="text-gray-800">{onboardingData.prenom}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Nom:</span>
                                <p className="text-gray-800">{onboardingData.nom}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Email:</span>
                                <p className="text-gray-800">{onboardingData.email}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Téléphone:</span>
                                <p className="text-gray-800">{onboardingData.telephone}</p>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Informations entreprise onboarding */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Informations entreprise
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Nom de l&apos;entreprise:</span>
                                <p className="text-gray-800">{onboardingData.nomEntreprise}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Raison sociale:</span>
                                <p className="text-gray-800">{onboardingData.raisonSociale}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Adresse:</span>
                                <p className="text-gray-800">{onboardingData.adresseEntreprise}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Code postal:</span>
                                <p className="text-gray-800">{onboardingData.codePostal}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Ville:</span>
                                <p className="text-gray-800">{onboardingData.ville}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Année de création:</span>
                                <p className="text-gray-800">{onboardingData.anneeCreation}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Nombre de collaborateurs:</span>
                                <p className="text-gray-800">{onboardingData.nombreCollaborateurs}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Rayon d&apos;intervention:</span>
                                <p className="text-gray-800">{onboardingData.rayonIntervention} km</p>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Services et expertise */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Services et expertise
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Prestations:</span>
                                <p className="text-gray-800 mt-1">{onboardingData.prestation}</p>
                              </div>
                              {onboardingData.prestationsDetaillees && (
                                <div>
                                  <span className="font-medium text-gray-600">Prestations détaillées:</span>
                                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{onboardingData.prestationsDetaillees}</p>
                                </div>
                              )}
                              {onboardingData.descriptionEntreprise && (
                                <div>
                                  <span className="font-medium text-gray-600">Description de l&apos;entreprise:</span>
                                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{onboardingData.descriptionEntreprise}</p>
                                </div>
                              )}
                              {onboardingData.histoireCreateur && (
                                <div>
                                  <span className="font-medium text-gray-600">Histoire du créateur:</span>
                                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{onboardingData.histoireCreateur}</p>
                                </div>
                              )}
                              {onboardingData.formations && (
                                <div>
                                  <span className="font-medium text-gray-600">Formations et qualifications:</span>
                                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">{onboardingData.formations}</p>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="font-medium text-gray-600">Certifications:</span>
                                  <p className="text-gray-800">{onboardingData.certification}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Garanties:</span>
                                  <p className="text-gray-800">{onboardingData.garanties}</p>
                                </div>
                              </div>
                              {onboardingData.partenaire && (
                                <div>
                                  <span className="font-medium text-gray-600">Partenaires:</span>
                                  <p className="text-gray-800">{onboardingData.partenaire}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Site web */}
                          {onboardingData.siteWebExistant && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Site web
                                </h4>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-600">URL du site web:</span>
                                  <p className="text-gray-800">
                                    <a
                                      href={onboardingData.siteWebURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {onboardingData.siteWebURL}
                                    </a>
                                  </p>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Images */}
                          {((onboardingData.chantiersImages && onboardingData.chantiersImages.length > 0) ||
                            (onboardingData.employesImages && onboardingData.employesImages.length > 0) ||
                            onboardingData.logoImage) && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4" />
                                  Images
                                </h4>
                                <div className="space-y-3">
                                  {onboardingData.logoImage && (
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-600 text-sm">Logo:</span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const extension = onboardingData.logoImage!.split(".").pop()?.split("?")[0] || "jpg"
                                            downloadImage(onboardingData.logoImage!, `logo.${extension}`)
                                          }}
                                          className="h-6 px-2 text-xs"
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Télécharger
                                        </Button>
                                      </div>
                                      <div className="mt-1">
                                        <img
                                          src={onboardingData.logoImage}
                                          alt="Logo"
                                          className="h-16 w-auto object-contain border rounded"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {onboardingData.chantiersImages && onboardingData.chantiersImages.length > 0 && (
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-600 text-sm">
                                          Images de chantiers ({onboardingData.chantiersImages.length}):
                                        </span>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadAllImages(onboardingData.chantiersImages!, "chantiers")}
                                            className="h-6 px-2 text-xs"
                                          >
                                            <Archive className="w-3 h-3 mr-1" />
                                            Tout télécharger
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="mt-1 flex flex-wrap gap-2">
                                        {onboardingData.chantiersImages.slice(0, 4).map((image, index) => (
                                          <div key={index} className="relative group">
                                            <img
                                              src={image}
                                              alt={`Chantier ${index + 1}`}
                                              className="h-16 w-16 object-cover border rounded"
                                            />
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              onClick={() => {
                                                const extension = image.split(".").pop()?.split("?")[0] || "jpg"
                                                downloadImage(image, `chantier_${index + 1}.${extension}`)
                                              }}
                                              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-16 w-16 p-0 rounded"
                                            >
                                              <Download className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        ))}
                                        {onboardingData.chantiersImages.length > 4 && (
                                          <div className="h-16 w-16 bg-gray-200 border rounded flex items-center justify-center text-xs text-gray-600">
                                            +{onboardingData.chantiersImages.length - 4}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {onboardingData.employesImages && onboardingData.employesImages.length > 0 && (
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-600 text-sm">
                                          Images d&apos;employés ({onboardingData.employesImages.length}):
                                        </span>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadAllImages(onboardingData.employesImages!, "employes")}
                                            className="h-6 px-2 text-xs"
                                          >
                                            <Archive className="w-3 h-3 mr-1" />
                                            Tout télécharger
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="mt-1 flex flex-wrap gap-2">
                                        {onboardingData.employesImages.slice(0, 4).map((image, index) => (
                                          <div key={index} className="relative group">
                                            <img
                                              src={image}
                                              alt={`Employé ${index + 1}`}
                                              className="h-16 w-16 object-cover border rounded"
                                            />
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              onClick={() => {
                                                const extension = image.split(".").pop()?.split("?")[0] || "jpg"
                                                downloadImage(image, `employe_${index + 1}.${extension}`)
                                              }}
                                              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-16 w-16 p-0 rounded"
                                            >
                                              <Download className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        ))}
                                        {onboardingData.employesImages.length > 4 && (
                                          <div className="h-16 w-16 bg-gray-200 border rounded flex items-center justify-center text-xs text-gray-600">
                                            +{onboardingData.employesImages.length - 4}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Commentaires */}
                          {onboardingData.commentaire && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm text-gray-700">Commentaires</h4>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{onboardingData.commentaire}</p>
                              </div>
                            </>
                          )}

                          {/* Date de completion */}
                          {onboardingData.dateCompletion && (
                            <>
                              <Separator />
                              <div className="text-xs text-gray-500">
                                Onboarding complété le:{" "}
                                {new Date(onboardingData.dateCompletion.seconds * 1000).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
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

      {/* Modal de sélection d'offre de paiement */}
      <AnimatePresence>
        {showPaymentModal && (
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Envoyer lien de paiement
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="text-sm text-gray-600">
                  Choisissez l&apos;offre à envoyer à{" "}
                  <strong>
                    {String(formData?.prenom ?? "")} {String(formData?.nom ?? "")}
                  </strong>{" "}
                  :
                </div>

                <div className="space-y-3">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedOffer === "90j-offert" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedOffer("90j-offert")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedOffer === "90j-offert" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {selectedOffer === "90j-offert" && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">🎉 Offre Spéciale - 90 jours offerts</h4>
                        <p className="text-sm text-gray-600">Profitez de 3 mois gratuits pour découvrir tous nos services</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedOffer === "classique" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedOffer("classique")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedOffer === "classique" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {selectedOffer === "classique" && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">🚀 Abonnement Standard</h4>
                        <p className="text-sm text-gray-600">Accédez immédiatement à tous nos outils professionnels</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSendPaymentLink} disabled={!selectedOffer || sendingPaymentLink}>
                    {sendingPaymentLink ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Envoyer l&apos;email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
