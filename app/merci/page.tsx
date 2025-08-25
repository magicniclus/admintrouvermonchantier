"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail, Clock } from "lucide-react"

export default function MerciPage() {
  const searchParams = useSearchParams()
  const firstName = searchParams.get('firstName') || 'Client'
  const email = searchParams.get('email') || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header de remerciement */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 mb-8">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Merci {firstName} ! 🎉
            </CardTitle>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
              Votre inscription a été soumise avec succès. Nous avons bien reçu toutes vos informations.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Email de bienvenue envoyé</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">{email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Traitement en cours</p>
                  <p className="text-sm text-green-600 dark:text-green-300">24-48h pour finalisation</p>
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Prochaines étapes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vous recevrez un email avec les instructions pour finaliser votre compte et accéder à votre espace personnel.
              </p>
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  )
}
