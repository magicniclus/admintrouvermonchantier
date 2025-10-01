"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, addDoc, deleteDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

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
  // Nouveaux champs entreprise
  AnneeCreation?: string
  NombreCollaborateurs?: string
  Prestation?: string
  Secteur?: string
  RayonIntervention?: string
  NomEntreprise?: string
  RaisonSociale?: string
  Certification?: string
  Garanties?: string
  Partenaire?: string
  SiteWebExistant?: boolean
  SiteWebURL?: string
  Logo?: boolean
  SitePret?: boolean
}

interface EditProspectModalProps {
  isOpen: boolean
  onClose: () => void
  prospect: Prospect | null
  onProspectUpdated: (updatedProspect: Prospect) => void
  onProspectConverted?: () => void
  onProspectAdded?: (newProspect: Prospect) => void
  isCreating?: boolean
}

export function EditProspectModal({ isOpen, onClose, prospect, onProspectUpdated, onProspectConverted, onProspectAdded, isCreating = false }: EditProspectModalProps) {
  const [formData, setFormData] = useState<Prospect | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Initialize form data when prospect changes or when creating
  useEffect(() => {
    if (isCreating) {
      // Initialize with empty data for new prospect
      setFormData({
        id: "",
        Nom: "",
        Prenom: "",
        Email: "",
        Téléphone: "",
        Entreprise: "",
        Metier: "",
        Etape: "A contacter",
        Date: new Date(),
        RGPD: false,
        Commentaire: "",
        AnneeCreation: "",
        NombreCollaborateurs: "",
        Prestation: "",
        Secteur: "",
        RayonIntervention: "",
        NomEntreprise: "",
        RaisonSociale: "",
        Certification: "",
        Garanties: "",
        Partenaire: "",
        SiteWebExistant: false,
        SiteWebURL: "",
        Logo: false,
        SitePret: false,
      })
    } else if (prospect) {
      setFormData({ ...prospect })
    }
  }, [prospect, isCreating])

  const handleSave = async () => {
    if (!formData) return

    try {
      setIsSaving(true)
      
      const saveData = {
        Nom: formData.Nom || "",
        Prenom: formData.Prenom || "",
        Email: formData.Email || "",
        Téléphone: formData.Téléphone || "",
        Entreprise: formData.Entreprise || "",
        Metier: formData.Metier || "",
        Etape: formData.Etape || "A contacter",
        Date: isCreating ? new Date() : formData.Date,
        RGPD: !!formData.RGPD,
        Commentaire: formData.Commentaire || "",
        // Nouveaux champs entreprise
        AnneeCreation: formData.AnneeCreation || "",
        NombreCollaborateurs: formData.NombreCollaborateurs || "",
        Prestation: formData.Prestation || "",
        Secteur: formData.Secteur || "",
        RayonIntervention: formData.RayonIntervention || "",
        NomEntreprise: formData.NomEntreprise || "",
        RaisonSociale: formData.RaisonSociale || "",
        Certification: formData.Certification || "",
        Garanties: formData.Garanties || "",
        Partenaire: formData.Partenaire || "",
        SiteWebExistant: !!formData.SiteWebExistant,
        SiteWebURL: formData.SiteWebURL || "",
        Logo: !!formData.Logo,
        SitePret: !!formData.SitePret,
      }

      if (isCreating) {
        // Créer un nouveau prospect
        const docRef = await addDoc(collection(db, "prospects"), saveData)
        const newProspect = { ...saveData, id: docRef.id } as Prospect
        if (onProspectAdded) {
          onProspectAdded(newProspect)
        }
      } else if (prospect) {
        // Mettre à jour un prospect existant
        const prospectRef = doc(db, "prospects", prospect.id)
        await updateDoc(prospectRef, saveData)
        onProspectUpdated({ ...formData, ...saveData })
      }
      
      onClose()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConvertToClient = async () => {
    if (!formData || !prospect) return
    
    try {
      setIsConverting(true)
      
      // Mapper les champs du prospect vers les champs client attendus
      const clientData = {
        // Mapping des champs principaux
        nom: formData.Nom || "",
        prenom: formData.Prenom || "",
        email: formData.Email || "",
        telephone: formData.Téléphone || "",
        entreprise: formData.NomEntreprise || formData.Entreprise || "",
        ville: "", // Pas dans les prospects, sera vide
        
        // Champs étendus avec noms normalisés
        nomEntreprise: formData.NomEntreprise || formData.Entreprise || "",
        metier: formData.Metier || "",
        secteurActivite: formData.Secteur || "",
        rayonIntervention: formData.RayonIntervention || "",
        raisonSociale: formData.RaisonSociale || "",
        anneeCreation: formData.AnneeCreation || "",
        nombreCollaborateurs: formData.NombreCollaborateurs || "",
        prestations: formData.Prestation || "",
        certifications: formData.Certification || "",
        garanties: formData.Garanties || "",
        partenaires: formData.Partenaire || "",
        siteWebExistant: !!formData.SiteWebExistant,
        siteWebURL: formData.SiteWebURL || "",
        logo: !!formData.Logo,
        sitePret: !!formData.SitePret,
        commentaire: formData.Commentaire || "",
        etapeProspect: formData.Etape || "",
        rgpd: !!formData.RGPD,
        
        // Métadonnées de conversion
        DateConversionClient: new Date(),
        StatutClient: "Actif",
        status: "prospect_converti",
        dateConversionProspect: new Date(),
        
        // Données prospect originales (pour référence)
        dataProspectOriginal: {
          ...formData
        }
      }
      
      // Les données sont prêtes pour l'ajout (pas d'ID à supprimer car clientData n'en a pas)
      
      // Ajouter dans la collection clients
      await addDoc(collection(db, "clients"), clientData)
      
      // Supprimer de la collection prospects
      await deleteDoc(doc(db, "prospects", prospect.id))
      
      // Callback pour notifier la conversion
      if (onProspectConverted) {
        onProspectConverted()
      }
      
      setShowConfirmModal(false)
      onClose()
    } catch (error) {
      console.error("Erreur lors de la conversion:", error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleClose = () => {
    setFormData(null)
    setShowConfirmModal(false)
    onClose()
  }

  const handleDownloadJSON = () => {
    if (!formData) return

    // Créer un objet avec toutes les données du prospect
    const prospectData = {
      id: formData.id,
      informationsPersonnelles: {
        nom: formData.Nom,
        prenom: formData.Prenom,
        email: formData.Email,
        telephone: formData.Téléphone,
        etape: formData.Etape,
        date: formData.Date,
        rgpd: formData.RGPD,
        commentaire: formData.Commentaire
      },
      informationsEntreprise: {
        nomEntreprise: formData.NomEntreprise,
        entreprise: formData.Entreprise,
        metier: formData.Metier,
        secteurActivite: formData.Secteur,
        raisonSociale: formData.RaisonSociale,
        anneeCreation: formData.AnneeCreation,
        nombreCollaborateurs: formData.NombreCollaborateurs,
        prestation: formData.Prestation,
        rayonIntervention: formData.RayonIntervention,
        certifications: formData.Certification,
        garanties: formData.Garanties,
        partenaires: formData.Partenaire
      },
      siteWebEtCommunication: {
        siteWebExistant: formData.SiteWebExistant,
        siteWebURL: formData.SiteWebURL,
        logo: formData.Logo,
        sitePret: formData.SitePret
      },
      metadonnees: {
        dateExport: new Date().toISOString(),
        exportePar: "Admin Trouver Mon Chantier"
      }
    }

    // Créer le fichier JSON et le télécharger
    const dataStr = JSON.stringify(prospectData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `prospect_${formData.Prenom}_${formData.Nom}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Nettoyer l'URL
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Ajouter un nouveau prospect" : "Modifier le prospect"}</DialogTitle>
        </DialogHeader>

        {formData && (
          <div className="grid gap-6 py-4">
            {/* Section Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-prenom">Prénom</Label>
                  <Input
                    id="edit-prenom"
                    value={formData.Prenom}
                    onChange={(e) => setFormData({ ...formData, Prenom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nom">Nom</Label>
                  <Input
                    id="edit-nom"
                    value={formData.Nom}
                    onChange={(e) => setFormData({ ...formData, Nom: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-telephone">Téléphone</Label>
                  <Input
                    id="edit-telephone"
                    value={formData.Téléphone}
                    onChange={(e) => setFormData({ ...formData, Téléphone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-etape">Étape</Label>
                <Select value={formData.Etape} onValueChange={(value) => setFormData({ ...formData, Etape: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une étape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A contacter">A contacter</SelectItem>
                    <SelectItem value="R1">R1</SelectItem>
                    <SelectItem value="R2">R2</SelectItem>
                    <SelectItem value="Injoignable">Injoignable</SelectItem>
                    <SelectItem value="faux numero">Faux numéro</SelectItem>
                    <SelectItem value="Pas intéressé">Pas intéressé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Section Informations entreprise */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations entreprise</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nom-entreprise">Nom de l&apos;entreprise</Label>
                  <Input
                    id="edit-nom-entreprise"
                    value={formData.NomEntreprise || ""}
                    onChange={(e) => setFormData({ ...formData, NomEntreprise: e.target.value })}
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-entreprise">Entreprise (ancien champ)</Label>
                  <Input
                    id="edit-entreprise"
                    value={formData.Entreprise}
                    onChange={(e) => setFormData({ ...formData, Entreprise: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-metier">Métier</Label>
                  <Input
                    id="edit-metier"
                    value={formData.Metier || ""}
                    onChange={(e) => setFormData({ ...formData, Metier: e.target.value })}
                    placeholder="Ex: Plombier, Électricien, Maçon..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-secteur">Secteur d&apos;activité</Label>
                  <Input
                    id="edit-secteur"
                    value={formData.Secteur || ""}
                    onChange={(e) => setFormData({ ...formData, Secteur: e.target.value })}
                    placeholder="Ex: BTP, Commerce, Services..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-raison-sociale">Raison sociale</Label>
                  <Select 
                    value={formData.RaisonSociale || ""} 
                    onValueChange={(value) => setFormData({ ...formData, RaisonSociale: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une raison sociale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SARL">SARL</SelectItem>
                      <SelectItem value="SAS">SAS</SelectItem>
                      <SelectItem value="SASU">SASU</SelectItem>
                      <SelectItem value="EURL">EURL</SelectItem>
                      <SelectItem value="Micro-entreprise">Micro-entreprise</SelectItem>
                      <SelectItem value="Auto-entrepreneur">Auto-entrepreneur</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="SNC">SNC</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-annee-creation">Année de création</Label>
                  <Input
                    id="edit-annee-creation"
                    type="number"
                    min="1900"
                    max="2024"
                    value={formData.AnneeCreation || ""}
                    onChange={(e) => setFormData({ ...formData, AnneeCreation: e.target.value })}
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre-collaborateurs">Nombre de collaborateurs</Label>
                  <Select 
                    value={formData.NombreCollaborateurs || ""} 
                    onValueChange={(value) => setFormData({ ...formData, NombreCollaborateurs: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (seul)</SelectItem>
                      <SelectItem value="2-5">2-5</SelectItem>
                      <SelectItem value="6-10">6-10</SelectItem>
                      <SelectItem value="11-20">11-20</SelectItem>
                      <SelectItem value="21-50">21-50</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-prestation">Prestation</Label>
                  <Input
                    id="edit-prestation"
                    value={formData.Prestation || ""}
                    onChange={(e) => setFormData({ ...formData, Prestation: e.target.value })}
                    placeholder="Type de prestation recherchée"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rayon"><span className="font-medium text-gray-600">Rayon d&apos;intervention:</span> (km)</Label>
                  <Input
                    id="edit-rayon"
                    type="number"
                    min="0"
                    value={formData.RayonIntervention || ""}
                    onChange={(e) => setFormData({ ...formData, RayonIntervention: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-certification">Certifications</Label>
                  <Input
                    id="edit-certification"
                    value={formData.Certification || ""}
                    onChange={(e) => setFormData({ ...formData, Certification: e.target.value })}
                    placeholder="RGE, Qualibat, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-garanties">Garanties</Label>
                  <Input
                    id="edit-garanties"
                    value={formData.Garanties || ""}
                    onChange={(e) => setFormData({ ...formData, Garanties: e.target.value })}
                    placeholder="Décennale, RC Pro, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-partenaire">Partenaires</Label>
                <Input
                  id="edit-partenaire"
                  value={formData.Partenaire || ""}
                  onChange={(e) => setFormData({ ...formData, Partenaire: e.target.value })}
                  placeholder="Partenaires commerciaux, fournisseurs..."
                />
              </div>
            </div>

            <Separator />

            {/* Section Site web et communication */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Site web et communication</h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="site-web-existant"
                    checked={formData.SiteWebExistant || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, SiteWebExistant: !!checked })}
                  />
                  <Label htmlFor="site-web-existant" className="text-sm font-medium">
                    Site web existant
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="logo"
                    checked={formData.Logo || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, Logo: !!checked })}
                  />
                  <Label htmlFor="logo" className="text-sm font-medium">
                    Logo disponible
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="site-pret"
                    checked={formData.SitePret || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, SitePret: !!checked })}
                  />
                  <Label htmlFor="site-pret" className="text-sm font-medium">
                    Site prêt
                  </Label>
                </div>
              </div>

              {/* URL du site web - affiché seulement si "Site web existant" est coché */}
              {formData.SiteWebExistant && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="edit-site-url">URL du site web</Label>
                  <Input
                    id="edit-site-url"
                    type="url"
                    value={formData.SiteWebURL || ""}
                    onChange={(e) => setFormData({ ...formData, SiteWebURL: e.target.value })}
                    placeholder="https://www.exemple.com"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Section Commentaires */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Commentaires</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-commentaire">Commentaire</Label>
                <Textarea
                  id="edit-commentaire"
                  value={formData.Commentaire || ""}
                  onChange={(e) => setFormData({ ...formData, Commentaire: e.target.value })}
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {!isCreating && (
              <>
                <Button 
                  onClick={() => setShowConfirmModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Passer en client
                </Button>
                <Button 
                  onClick={handleDownloadJSON}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  📥 Télécharger JSON
                </Button>
              </>
            )}
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Sauvegarde..." : (isCreating ? "Ajouter" : "Sauvegarder")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Modal de confirmation - seulement en mode édition */}
      {!isCreating && (
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la conversion</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir convertir <strong>{formData?.Prenom} {formData?.Nom}</strong> en client ?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Cette action déplacera le prospect vers la section clients et ne peut pas être annulée.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConvertToClient} 
              disabled={isConverting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConverting ? "Conversion..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </Dialog>
  )
}
