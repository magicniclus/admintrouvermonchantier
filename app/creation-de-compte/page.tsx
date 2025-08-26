"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Building,
  CheckCircle,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ClientData {
  // Informations de base
  email: string
  status: string
  uidClient: string
  dateCreation: { seconds: number } | null
  
  // Autres champs possibles
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
  dateCompletion?: { seconds: number } | null
  status?: string
}

export default function CreationDeComptePage() {
  const searchParams = useSearchParams()
  const uid = searchParams.get('uid')
  
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  const fetchClientData = async () => {
    if (!uid) return

    try {
      setLoading(true)
      
      // Récupérer les données client de base
      const clientRef = doc(db, "clients", uid)
      const clientSnap = await getDoc(clientRef)
      
      if (clientSnap.exists()) {
        const clientInfo = clientSnap.data() as ClientData
        setClientData(clientInfo)
        setEmail(clientInfo.email || "")
        
        // Récupérer les données d'onboarding
        const onboardingRef = doc(db, "clients", uid, "onboarding", "data")
        const onboardingSnap = await getDoc(onboardingRef)
        
        if (onboardingSnap.exists()) {
          setOnboardingData(onboardingSnap.data() as OnboardingData)
        }
      } else {
        setError("Client non trouvé")
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      setError("Erreur lors de la récupération des données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (uid) {
      fetchClientData()
    } else {
      setError("UID client manquant dans l'URL")
      setLoading(false)
    }
  }, [uid])

  const handleCreateAccount = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Tous les champs sont requis")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setIsCreatingAccount(true)
    setError(null)

    try {
      // Ici vous pouvez ajouter la logique de création de compte
      // Par exemple, créer un compte Firebase Auth
      console.log("Création de compte pour:", email)
      
      // Simulation d'une création de compte
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Rediriger vers le dashboard ou une page de succès
      window.location.href = "/dashboard"
      
    } catch (error) {
      console.error("Erreur lors de la création du compte:", error)
      setError("Erreur lors de la création du compte")
    } finally {
      setIsCreatingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg">Chargement des données...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <span className="text-lg">{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Finalisation de votre compte
          </h1>
          <p className="text-xl text-gray-600">
            Bienvenue {onboardingData?.prenom} {onboardingData?.nom} !
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Données du client */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Vos informations
                </CardTitle>
                <CardDescription>
                  Données récupérées depuis votre onboarding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {onboardingData && (
                  <>
                    {/* Informations personnelles */}
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

                    {/* Informations entreprise */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Entreprise
                      </h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Nom de l&apos;entreprise:</span>
                          <p className="text-gray-800">{onboardingData.nomEntreprise}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Adresse:</span>
                          <p className="text-gray-800">
                            {onboardingData.adresseEntreprise}, {onboardingData.codePostal} {onboardingData.ville}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Prestations:</span>
                          <p className="text-gray-800">{onboardingData.prestation}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Statut */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">Statut onboarding:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complété
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Formulaire de création de compte */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Créer votre compte
                </CardTitle>
                <CardDescription>
                  Définissez vos identifiants de connexion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    disabled={!!onboardingData?.email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingAccount ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Créer mon compte
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Votre compte a été créé avec succès ! Vous allez être redirigé vers votre espace d&apos;administration.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Informations supplémentaires */}
        {clientData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Informations techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">UID Client:</span>
                    <p className="text-gray-800 font-mono text-xs">{uid}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Statut:</span>
                    <p className="text-gray-800">{clientData.status}</p>
                  </div>
                  {clientData.dateCreation && (
                    <div>
                      <span className="font-medium text-gray-600">Date création:</span>
                      <p className="text-gray-800">
                        {new Date(clientData.dateCreation.seconds * 1000).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {onboardingData?.dateCompletion && (
                    <div>
                      <span className="font-medium text-gray-600">Onboarding terminé:</span>
                      <p className="text-gray-800">
                        {new Date(onboardingData.dateCompletion.seconds * 1000).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
