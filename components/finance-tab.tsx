"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import {
  TrendingUp,
  Users,
  Euro,
  Calendar,
  Zap,
} from "lucide-react"

interface Client {
  id: string
  DateConversionClient?: { seconds: number }
  dateOnboardingCompleted?: { seconds: number }
  [key: string]: unknown
}

interface WeeklyData {
  week: string
  nouveauxClients: number
}

export function FinanceTab() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [totalClients, setTotalClients] = useState(0)
  const [mrr, setMrr] = useState(0)
  const [creationRevenue, setCreationRevenue] = useState(0)

  // Fetch clients data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const clientsRef = collection(db, "clients")
        const querySnapshot = await getDocs(clientsRef)
        const clientsData: Client[] = []
        querySnapshot.forEach((doc) => {
          clientsData.push({
            id: doc.id,
            ...doc.data(),
          })
        })
        setClients(clientsData)
        setTotalClients(clientsData.length)
        setMrr(clientsData.length * 29)
        setCreationRevenue(clientsData.length * 99)
        
        // Process weekly data
        processWeeklyData(clientsData)
      } catch (error) {
        console.error("Erreur lors de la récupération des clients:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const processWeeklyData = (clientsData: Client[]) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get first day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    
    // Generate weeks of current month
    const weeks: WeeklyData[] = []
    const weekStart = new Date(firstDayOfMonth)
    
    // Adjust to start of week (Monday)
    const dayOfWeek = weekStart.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    weekStart.setDate(weekStart.getDate() - daysToSubtract)
    
    let weekNumber = 1
    while (weekStart.getMonth() <= currentMonth && weekStart.getFullYear() === currentYear) {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      // Count new clients for this week
      const newClientsThisWeek = clientsData.filter(client => {
        const clientDate = client.DateConversionClient?.seconds ? new Date(client.DateConversionClient.seconds * 1000) : null
        const clientDate2 = client.dateOnboardingCompleted?.seconds ? new Date(client.dateOnboardingCompleted.seconds * 1000) : null
        
        if (!clientDate && !clientDate2) return false
        
        return (clientDate && clientDate >= weekStart && clientDate <= weekEnd) || (clientDate2 && clientDate2 >= weekStart && clientDate2 <= weekEnd)
      }).length
      
      weeks.push({
        week: `S${weekNumber}`,
        nouveauxClients: newClientsThisWeek
      })
      
      weekStart.setDate(weekStart.getDate() + 7)
      weekNumber++
      
      // Limit to 5 weeks max
      if (weekNumber > 5) break
    }
    
    setWeeklyData(weeks)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
          <p className="text-gray-600 mt-1">Suivi des performances et revenus</p>
        </div>
      </div>

      {/* MRR Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Revenus Récurrents Mensuels</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {loading ? "..." : formatCurrency(mrr)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {totalClients} clients × 29€
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Euro className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Clients</p>
                  <p className="text-3xl font-bold text-green-900">
                    {loading ? "..." : totalClients}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Clients actifs
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Revenus de Création</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {loading ? "..." : formatCurrency(creationRevenue)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {totalClients} clients × 99€
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Revenus Annuels</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {loading ? "..." : formatCurrency(mrr * 12)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Projection MRR annuelle
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <CardTitle>Nouveaux clients par semaine</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Évolution du mois en cours</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(label) => `Semaine ${label}`}
                      formatter={(value) => [value, 'Nouveaux clients']}
                    />
                    <Bar 
                      dataKey="nouveauxClients" 
                      fill="url(#colorGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
