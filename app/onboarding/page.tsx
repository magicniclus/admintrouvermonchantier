"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  Globe,
  CheckCircle,
  ArrowRight,
  Upload,
  X,
  Image as ImageIcon,
  Users,
  Palette,
} from "lucide-react"
import { doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import Image from "next/image"

interface OnboardingData {
  // Informations personnelles
  prenom: string
  nom: string
  email: string
  telephone: string
  
  // Informations entreprise
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
  
  // Nouvelles informations détaillées
  descriptionEntreprise: string
  histoireCreateur: string
  prestationsDetaillees: string
  formations: string
  
  // Site web et communication
  siteWebExistant: boolean
  siteWebURL: string
  
  // Commentaires
  commentaire: string
  
  // Images
  chantiersImages: File[]
  employesImages: File[]
  logoImage: File | null
}

function OnboardingContent() {
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    nomEntreprise: "",
    raisonSociale: "",
    adresseEntreprise: "",
    codePostal: "",
    ville: "",
    anneeCreation: "",
    nombreCollaborateurs: "",
    prestation: "",
    rayonIntervention: "",
    certification: "",
    garanties: "",
    partenaire: "",
    descriptionEntreprise: "",
    histoireCreateur: "",
    prestationsDetaillees: "",
    formations: "",
    siteWebExistant: false,
    siteWebURL: "",
    commentaire: "",
    chantiersImages: [],
    employesImages: [],
    logoImage: null,
  })

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.prenom && formData.nom && formData.email && formData.telephone
      case 2:
        return formData.nomEntreprise && formData.prestation && formData.adresseEntreprise && formData.codePostal && formData.ville
      case 3:
        return formData.descriptionEntreprise && formData.histoireCreateur && formData.prestationsDetaillees
      case 4:
        return true // Pas de champs obligatoires dans l&apos;étape 4
      case 5:
        return true // Pas de champs obligatoires dans l&apos;étape 5
      default:
        return true
    }
  }

  const nextStep = () => {
    if (isStepValid() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const uploadImages = async (images: File[], folder: string) => {
    const uploadPromises = images.map(async (image, index) => {
      const imageRef = ref(storage, `clients/${clientId}/${folder}/${Date.now()}_${index}_${image.name}`)
      await uploadBytes(imageRef, image)
      return await getDownloadURL(imageRef)
    })
    return await Promise.all(uploadPromises)
  }


  const handleSubmit = async () => {
    if (!clientId) {
      console.error("Aucun ID client fourni")
      return
    }

    try {
      setIsSubmitting(true)
      
      // 1. Envoyer l&apos;email de bienvenue avec SendGrid
      try {
        const emailResponse = await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            firstName: formData.prenom,
            lastName: formData.nom,
            clientId: clientId
          })
        });

        if (!emailResponse.ok) {
          console.error("Erreur lors de l&apos;envoi de l&apos;email:", emailResponse.status)
        }
      } catch (emailError) {
        console.error("Erreur réseau lors de l&apos;envoi de l&apos;email:", emailError)
      }
      
      // 2. Sauvegarder les données textuelles
      const clientUpdateData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        nomEntreprise: formData.nomEntreprise,
        raisonSociale: formData.raisonSociale,
        adresseEntreprise: formData.adresseEntreprise,
        codePostal: formData.codePostal,
        ville: formData.ville,
        anneeCreation: formData.anneeCreation,
        nombreCollaborateurs: formData.nombreCollaborateurs,
        prestation: formData.prestation,
        rayonIntervention: formData.rayonIntervention,
        certification: formData.certification,
        garanties: formData.garanties,
        partenaire: formData.partenaire,
        descriptionEntreprise: formData.descriptionEntreprise,
        histoireCreateur: formData.histoireCreateur,
        prestationsDetaillees: formData.prestationsDetaillees,
        formations: formData.formations,
        siteWebExistant: formData.siteWebExistant,
        siteWebURL: formData.siteWebURL,
        commentaire: formData.commentaire,
        onboarding: true,
        onboardingCompleted: true,
        dateOnboardingCompleted: new Date(),
        // Ajouter les données d&apos;abonnement par défaut
        typeAbonnement: "29€/mois",
        typeSite: "99€",
        dateCreationAbonnement: new Date(),
        firebaseAuthUid: null // Pas de compte Firebase créé
      }

      await setDoc(doc(db, "clients", clientId), clientUpdateData, { merge: true })
      
      // Sauvegarder dans la collection onboarding (sans images pour l&apos;instant)
      const onboardingDataWithoutImages = {
        ...formData,
        dateCompletion: new Date(),
        statut: "completed"
      }

      // Supprimer les objets File avant la sauvegarde
      const { chantiersImages, employesImages, logoImage, ...dataToSave } = onboardingDataWithoutImages

      await Promise.all([
        setDoc(doc(db, "clients", clientId, "onboarding", "data"), dataToSave)
      ])
      
      // Essayer d&apos;uploader les images (optionnel - ne bloque pas si ça échoue)
      let chantiersImageUrls: string[] = []
      let employesImageUrls: string[] = []
      let logoImageUrl: string = ""

      try {
        if (formData.chantiersImages.length > 0) {
          chantiersImageUrls = await uploadImages(formData.chantiersImages, "chantiers")
        }

        if (formData.employesImages.length > 0) {
          employesImageUrls = await uploadImages(formData.employesImages, "employes")
        }

        if (formData.logoImage) {
          const logoRef = ref(storage, `clients/${clientId}/logo/${Date.now()}_${formData.logoImage.name}`)
          await uploadBytes(logoRef, formData.logoImage)
          logoImageUrl = await getDownloadURL(logoRef)
        }

        // Mettre à jour avec les URLs des images si l&apos;upload a réussi
        if (chantiersImageUrls.length > 0 || employesImageUrls.length > 0 || logoImageUrl) {
          await setDoc(doc(db, "clients", clientId), {
            chantiersImages: chantiersImageUrls,
            employesImages: employesImageUrls,
            logoImage: logoImageUrl
          }, { merge: true })
          
          await setDoc(doc(db, "clients", clientId, "onboarding", "data"), {
            chantiersImages: chantiersImageUrls,
            employesImages: employesImageUrls,
            logoImage: logoImageUrl
          }, { merge: true })
        }
      } catch (imageError) {
        console.error("Erreur lors de l&apos;upload des images (non bloquant):", imageError)
      }

      // Redirection vers la page de remerciement
      window.location.href = `/merci?firstName=${encodeURIComponent(formData.prenom)}&email=${encodeURIComponent(formData.email)}`
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde. Vérifiez la console pour plus de détails.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageDrop = (files: FileList, type: 'chantiers' | 'employes' | 'logo') => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

    if (type === 'chantiers') {
      const maxFiles = 10
      const currentCount = formData.chantiersImages.length
      const newFiles = imageFiles.slice(0, maxFiles - currentCount)
      setFormData({ ...formData, chantiersImages: [...formData.chantiersImages, ...newFiles] })
    } else if (type === 'employes') {
      const maxFiles = 5
      const currentCount = formData.employesImages.length
      const newFiles = imageFiles.slice(0, maxFiles - currentCount)
      setFormData({ ...formData, employesImages: [...formData.employesImages, ...newFiles] })
    } else if (type === 'logo' && imageFiles.length > 0) {
      setFormData({ ...formData, logoImage: imageFiles[0] })
    }
  }

  const removeImage = (index: number, type: 'chantiers' | 'employes') => {
    if (type === 'chantiers') {
      const newImages = formData.chantiersImages.filter((_, i) => i !== index)
      setFormData({ ...formData, chantiersImages: newImages })
    } else if (type === 'employes') {
      const newImages = formData.employesImages.filter((_, i) => i !== index)
      setFormData({ ...formData, employesImages: newImages })
    }
  }

  const removeLogo = () => {
    setFormData({ ...formData, logoImage: null })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Informations personnelles</h2>
              <p className="text-gray-600">Commençons par vous connaître</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Building className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Votre entreprise</h2>
              <p className="text-gray-600">Parlez-nous de votre activité</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nomEntreprise">Nom de l&apos;entreprise *</Label>
                <Input
                  id="nomEntreprise"
                  value={formData.nomEntreprise}
                  onChange={(e) => setFormData({...formData, nomEntreprise: e.target.value})}
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>
              <div>
                <Label htmlFor="raisonSociale">Raison sociale</Label>
                <Input
                  id="raisonSociale"
                  value={formData.raisonSociale}
                  onChange={(e) => setFormData({...formData, raisonSociale: e.target.value})}
                  placeholder="Raison sociale"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="adresseEntreprise">Adresse de l&apos;entreprise *</Label>
                <Input
                  id="adresseEntreprise"
                  value={formData.adresseEntreprise}
                  onChange={(e) => setFormData({...formData, adresseEntreprise: e.target.value})}
                  placeholder="Adresse complète"
                  required
                />
              </div>
              <div>
                <Label htmlFor="codePostal">Code postal *</Label>
                <Input
                  id="codePostal"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({...formData, codePostal: e.target.value})}
                  placeholder="Code postal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ville">Ville *</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({...formData, ville: e.target.value})}
                  placeholder="Ville"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anneeCreation">Année de création</Label>
                <Input
                  id="anneeCreation"
                  type="number"
                  min="1900"
                  max="2024"
                  value={formData.anneeCreation}
                  onChange={(e) => setFormData({ ...formData, anneeCreation: e.target.value })}
                  placeholder="2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreCollaborateurs">Nombre de collaborateurs</Label>
                <Select 
                  value={formData.nombreCollaborateurs} 
                  onValueChange={(value) => setFormData({ ...formData, nombreCollaborateurs: value })}
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

            <div className="space-y-4">
              <div>
                <Label htmlFor="prestation">Prestations proposées *</Label>
                <Input
                  id="prestation"
                  value={formData.prestation}
                  onChange={(e) => setFormData({ ...formData, prestation: e.target.value })}
                  placeholder="Décrivez vos prestations"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rayonIntervention">Rayon d&apos;intervention (km)</Label>
                <Input
                  id="rayonIntervention"
                  type="number"
                  min="0"
                  value={formData.rayonIntervention}
                  onChange={(e) => setFormData({ ...formData, rayonIntervention: e.target.value })}
                  placeholder="50"
                />
                <p className="text-sm text-gray-500">
                  💡 Zone d&apos;intervention à partir de votre ville de base pour optimiser les campagnes Google Ads
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="certification">Certifications</Label>
                <Input
                  id="certification"
                  value={formData.certification}
                  onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                  placeholder="RGE, Qualibat, etc."
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Building className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Votre histoire et expertise</h2>
              <p className="text-gray-600">Parlez-nous de votre parcours et de vos compétences</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="descriptionEntreprise">Description de l&apos;entreprise *</Label>
                <Textarea
                  id="descriptionEntreprise"
                  value={formData.descriptionEntreprise}
                  onChange={(e) => setFormData({ ...formData, descriptionEntreprise: e.target.value })}
                  placeholder="Décrivez l&apos;histoire de votre entreprise, votre parcours en tant que créateur, vos motivations et ce qui vous distingue de la concurrence..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="histoireCreateur">Histoire du créateur *</Label>
                <Textarea
                  id="histoireCreateur"
                  value={formData.histoireCreateur}
                  onChange={(e) => setFormData({ ...formData, histoireCreateur: e.target.value })}
                  placeholder="Votre parcours, votre expérience, ce qui vous a amené à créer cette entreprise..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestationsDetaillees">Prestations détaillées *</Label>
                <Textarea
                  id="prestationsDetaillees"
                  value={formData.prestationsDetaillees}
                  onChange={(e) => setFormData({ ...formData, prestationsDetaillees: e.target.value })}
                  placeholder="Détaillez vos services : rénovation, construction, spécialités techniques, matériaux utilisés..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formations">Formations et qualifications</Label>
                <Textarea
                  id="formations"
                  value={formData.formations}
                  onChange={(e) => setFormData({ ...formData, formations: e.target.value })}
                  placeholder="Vos formations, diplômes, certifications professionnelles, stages, apprentissages..."
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Globe className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Présence digitale</h2>
              <p className="text-gray-600">Votre site web et communication</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="siteWebExistant"
                  checked={formData.siteWebExistant}
                  onCheckedChange={(checked) => setFormData({ ...formData, siteWebExistant: !!checked })}
                />
                <Label htmlFor="siteWebExistant" className="text-sm font-medium">
                  Site web existant
                </Label>
              </div>

            </div>

            {formData.siteWebExistant && (
              <div className="space-y-2">
                <Label htmlFor="siteWebURL">URL du site web</Label>
                <Input
                  id="siteWebURL"
                  type="url"
                  value={formData.siteWebURL}
                  onChange={(e) => setFormData({ ...formData, siteWebURL: e.target.value })}
                  placeholder="https://www.exemple.com"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garanties">Garanties</Label>
                <Input
                  id="garanties"
                  value={formData.garanties}
                  onChange={(e) => setFormData({ ...formData, garanties: e.target.value })}
                  placeholder="Décennale, RC Pro, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partenaire">Partenaires</Label>
                <Input
                  id="partenaire"
                  value={formData.partenaire}
                  onChange={(e) => setFormData({ ...formData, partenaire: e.target.value })}
                  placeholder="Effy, Banque Populaire, Leroy Merlin, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commentaire">Commentaires ou besoins spécifiques</Label>
              <Textarea
                id="commentaire"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                placeholder="Décrivez vos besoins, objectifs ou toute information utile..."
                rows={4}
              />
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Images et visuels</h2>
              <p className="text-gray-600">Ajoutez vos images de chantiers, équipe et logo</p>
            </div>

            {/* Images de chantiers */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Images de chantiers réalisés (max 10)</h3>
              </div>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                onDrop={(e) => {
                  e.preventDefault()
                  handleImageDrop(e.dataTransfer.files, 'chantiers')
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Glissez-déposez vos images ici ou</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files
                      if (files) handleImageDrop(files, 'chantiers')
                    }
                    input.click()
                  }}
                >
                  Sélectionner des fichiers
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {formData.chantiersImages.length}/10 images ajoutées
                </p>
              </div>
              
              {formData.chantiersImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.chantiersImages.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Chantier ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        width={96}
                        height={96}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index, 'chantiers')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images des employés */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Photos de l&apos;équipe (max 5)</h3>
              </div>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                onDrop={(e) => {
                  e.preventDefault()
                  handleImageDrop(e.dataTransfer.files, 'employes')
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Glissez-déposez vos photos d&apos;équipe ici ou</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files
                      if (files) handleImageDrop(files, 'employes')
                    }
                    input.click()
                  }}
                >
                  Sélectionner des fichiers
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {formData.employesImages.length}/5 images ajoutées
                </p>
              </div>
              
              {formData.employesImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.employesImages.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Employé ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        width={96}
                        height={96}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index, 'employes')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Logo de l&apos;entreprise</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  💡 <strong>Pas de logo ?</strong> Nous pouvons en créer un pour vous ! 
                  Contactez-nous après l&apos;onboarding pour discuter de vos besoins en identité visuelle.
                </p>
              </div>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                onDrop={(e) => {
                  e.preventDefault()
                  handleImageDrop(e.dataTransfer.files, 'logo')
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                {formData.logoImage ? (
                  <div className="relative inline-block">
                    <Image
                      src={URL.createObjectURL(formData.logoImage)}
                      alt="Logo"
                      className="w-32 h-32 object-contain mx-auto rounded-lg"
                      width={128}
                      height={128}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeLogo}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Glissez-déposez votre logo ici ou</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files) handleImageDrop(files, 'logo')
                        }
                        input.click()
                      }}
                    >
                      Sélectionner un fichier
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Récapitulatif</h2>
              <p className="text-gray-600">Vérifiez vos informations avant de continuer</p>
            </div>

            {/* Notification simple */}
            {isSubmitting && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-green-800">Données sauvegardées !</h3>
                    <p className="text-sm text-green-700">
                      Vos informations ont été enregistrées et un email de bienvenue a été envoyé.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nom :</strong> {formData.nom}</p>
                  <p><strong>Prénom :</strong> {formData.prenom}</p>
                  <p><strong>Email :</strong> {formData.email}</p>
                  <p><strong>Téléphone :</strong> {formData.telephone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations entreprise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nom de l&apos;entreprise :</strong> {formData.nomEntreprise}</p>
                  <p><strong>Raison sociale :</strong> {formData.raisonSociale}</p>
                  <p><strong>Adresse :</strong> {formData.adresseEntreprise}</p>
                  <p><strong>Code postal :</strong> {formData.codePostal}</p>
                  <p><strong>Ville :</strong> {formData.ville}</p>
                  <p><strong>Année de création :</strong> {formData.anneeCreation}</p>
                  <p><strong>Nombre de collaborateurs :</strong> {formData.nombreCollaborateurs}</p>
                  <p><strong>Prestations proposées :</strong> {formData.prestation}</p>
                  <p><strong>Rayon d&apos;intervention :</strong> {formData.rayonIntervention}</p>
                  <p><strong>Certification :</strong> {formData.certification}</p>
                  <p><strong>Garanties :</strong> {formData.garanties}</p>
                  <p><strong>Partenaire :</strong> {formData.partenaire}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Présence digitale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Site web existant :</strong> {formData.siteWebExistant ? "Oui" : "Non"}</p>
                  {formData.siteWebExistant && formData.siteWebURL && (
                    <p><strong>URL :</strong> {formData.siteWebURL}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Abonnement et services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Type d&apos;abonnement :</strong> 29€/mois</p>
                  <p><strong>Type de site web :</strong> Site vitrine professionnel</p>
                  <p className="text-sm text-gray-600">Ces tarifs par défaut peuvent être ajustés selon vos besoins.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Images et visuels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Images de chantiers :</strong> {formData.chantiersImages.length} image(s)</p>
                  <p><strong>Photos d&apos;équipe :</strong> {formData.employesImages.length} photo(s)</p>
                  <p><strong>Logo :</strong> {formData.logoImage ? "Ajouté" : "Non ajouté"}</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Image src="/logo.png" alt="Logo" width={150} height={150} className="mx-auto" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-10">
            Bienvenue chez Trouver-mon-chantier.fr
          </h1>
          <p className="text-xl text-gray-600">
            Configurons votre profil en quelques étapes simples afin que nous ayons toutes les informations nécessaires pour vous aider à trouver des clients.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Étape {currentStep} sur {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% terminé
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 bg-gray-50 rounded-b-lg">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <Button 
                onClick={nextStep} 
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    Terminer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}
