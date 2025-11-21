"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { 
  updatePassword, 
  sendPasswordResetEmail, 
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth"

export function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const auth = getAuth()
  const user = auth.currentUser

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000)
  }

  const handlePasswordUpdate = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Utilisateur non connecté' })
      clearMessage()
      return
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Tous les champs sont requis' })
      clearMessage()
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' })
      clearMessage()
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
      clearMessage()
      return
    }

    setIsUpdatingPassword(true)
    setMessage(null)

    try {
      // Ré-authentifier l'utilisateur avec son mot de passe actuel
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword)

      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      clearMessage()
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error)
      
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Mot de passe actuel incorrect' })
      } else if (error.code === 'auth/weak-password') {
        setMessage({ type: 'error', text: 'Le nouveau mot de passe est trop faible' })
      } else if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Veuillez vous reconnecter avant de changer votre mot de passe' })
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour: ' + (error.message || 'Erreur inconnue') })
      }
      clearMessage()
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setMessage({ type: 'error', text: 'Adresse email non disponible' })
      clearMessage()
      return
    }

    setIsSendingReset(true)
    setMessage(null)

    try {
      await sendPasswordResetEmail(auth, user.email)
      setMessage({ type: 'success', text: `Email de réinitialisation envoyé à ${user.email}` })
      clearMessage()
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'email:", error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'email: ' + (error.message || 'Erreur inconnue') })
      clearMessage()
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Paramètres du compte</h2>
        </div>

        {/* Informations du compte */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Adresse email</Label>
                <p className="text-gray-900 font-medium">{user?.email || 'Non disponible'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Dernière connexion</Label>
                <p className="text-gray-900">
                  {user?.metadata.lastSignInTime 
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Non disponible'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Messages de feedback */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </motion.div>
            )}

            {/* Formulaire de changement de mot de passe */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Changer le mot de passe</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe actuel"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre nouveau mot de passe"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={isUpdatingPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Mettre à jour le mot de passe
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Option de réinitialisation par email */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Réinitialisation par email</h3>
              <p className="text-sm text-gray-600">
                Vous pouvez également recevoir un email de réinitialisation de mot de passe.
              </p>
              <Button
                onClick={handlePasswordReset}
                disabled={isSendingReset}
                variant="outline"
                className="w-full"
              >
                {isSendingReset ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer un email de réinitialisation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
