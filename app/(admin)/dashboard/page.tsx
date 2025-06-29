"use client"

import * as React from "react"
import {
  BarChart3,
  ChefHat,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === "up" ? (
            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
          )}
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>{change}</span>
          <span className="ml-1">par rapport au mois dernier</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Commandes aujourd'hui" value="127" change="+12.5%" icon={ChefHat} trend="up" />
        <StatCard title="Revenus du jour" value="2,847 CHF" change="+8.2%" icon={TrendingUp} trend="up" />
        <StatCard title="Plats populaires" value="18" change="+2" icon={ChefHat} trend="up" />
        <StatCard title="Clients fidèles" value="342" change="+5.1%" icon={Users} trend="up" />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventes mensuelles</CardTitle>
            <CardDescription>Évolution des ventes par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between space-x-2">
              {[120, 180, 150, 220, 190, 280, 240, 200, 260, 180, 150, 200].map((height, i) => (
                <div
                  key={i}
                  className="bg-blue-500 rounded-t-sm flex-1"
                  style={{ height: `${(height / 300) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectif mensuel</CardTitle>
            <CardDescription>Objectif que vous vous êtes fixé pour ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px]">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="75.55, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">75.55%</div>
                    <div className="text-xs text-green-500">+10%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Vous avez gagné 15,287 CHF aujourd'hui, c'est plus que le mois dernier. Continuez votre bon travail !
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Objectif</div>
                <div className="font-semibold">20K CHF ↓</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Revenus</div>
                <div className="font-semibold">20K CHF ↑</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Aujourd'hui</div>
                <div className="font-semibold">20K CHF ↑</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Objectif que vous vous êtes fixé pour chaque mois</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Mensuel</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestriel</TabsTrigger>
              <TabsTrigger value="annually">Annuel</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="space-y-4">
              <div className="h-[200px] flex items-end justify-center">
                <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Graphique des statistiques mensuelles</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="quarterly" className="space-y-4">
              <div className="h-[200px] flex items-end justify-center">
                <div className="w-full h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Graphique des statistiques trimestrielles</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="annually" className="space-y-4">
              <div className="h-[200px] flex items-end justify-center">
                <div className="w-full h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Graphique des statistiques annuelles</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 