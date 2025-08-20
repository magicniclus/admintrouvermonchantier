"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ClientsTab } from "@/components/clients-tab"
import { ProspectsTab } from "@/components/prospects-tab"
import { FinanceTab } from "@/components/finance-tab"
import {
  Users,
  UserPlus,
  Euro,
  LogOut,
} from "lucide-react"


export function Dashboard() {
  const [activeTab, setActiveTab] = useState("clients")
  const router = useRouter()

  // Écouter les changements d'onglet depuis les autres composants
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail)
    }

    window.addEventListener('tabChange', handleTabChange as EventListener)
    return () => {
      window.removeEventListener('tabChange', handleTabChange as EventListener)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Gérez vos clients, prospects et finances</p>
              </div>
            </div>

            {/* Logout Button */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 h-12 px-4 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="clients" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Clients
                </TabsTrigger>
                <TabsTrigger value="prospects" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Prospects
                </TabsTrigger>
                <TabsTrigger value="finance" className="flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Finance
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Clients Tab */}
              <TabsContent value="clients">
                <ClientsTab />
              </TabsContent>

              {/* Prospects Tab */}
              <TabsContent value="prospects">
                <ProspectsTab />
              </TabsContent>

              {/* Finance Tab */}
              <TabsContent value="finance">
                <FinanceTab />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>

    </div>
  )
}
