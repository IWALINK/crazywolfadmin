"use client"

import * as React from "react"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  User,
  Calendar,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Interface pour les messages de contact
interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  created_at: string
  read?: boolean
}

// Interface pour la pagination
interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  has_more_pages: boolean
  next_page_url: string | null
  prev_page_url: string | null
}

// Configuration API
const base_uri = process.env.NEXT_PUBLIC_API_URL || "https://backend.crazywolf-lausanne.com"

export default function MessagesPage() {
  const [messages, setMessages] = React.useState<ContactMessage[]>([])
  const [pagination, setPagination] = React.useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedMessage, setSelectedMessage] = React.useState<ContactMessage | null>(null)
  const [isViewMessageOpen, setIsViewMessageOpen] = React.useState(false)
  const [isDeletingMessage, setIsDeletingMessage] = React.useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<number | null>(null)
  const { toast } = useToast()

  // Charger les messages au montage du composant
  React.useEffect(() => {
    loadMessages()
  }, [currentPage])

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${base_uri}/api/contact/messages?page=${currentPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        setMessages(data.data)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des messages.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsViewMessageOpen(true)
  }

  const handleDeleteMessage = async (messageId: number) => {
    setIsDeletingMessage(messageId)
    try {
      const response = await fetch(`${base_uri}/api/contact/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Succès",
          description: "Message supprimé avec succès.",
        })
        // Rafraîchir la liste des messages
        await loadMessages()
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression du message.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la suppression.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingMessage(null)
      setShowDeleteConfirm(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMessageStatus = (message: ContactMessage) => {
    if (message.read) {
      return <Badge variant="outline" className="text-green-600">Lu</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800">Nouveau</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Messages de contact</h2>
          <p className="text-muted-foreground">Gérez les messages reçus de vos clients</p>
        </div>
        <Button variant="outline" onClick={loadMessages} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total messages</p>
                <p className="text-2xl font-bold">{pagination?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Messages lus</p>
                <p className="text-2xl font-bold">{messages.filter(m => m.read).length}</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Non lus</p>
                <p className="text-2xl font-bold">{messages.filter(m => !m.read).length}</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Aujourd'hui</p>
                <p className="text-2xl font-bold">
                  {messages.filter(m => 
                    new Date(m.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Filtres et recherche */}
      {/* <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un message..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les messages</SelectItem>
            <SelectItem value="unread">Non lus</SelectItem>
            <SelectItem value="read">Lus</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtrer
        </Button>
      </div> */}

      {/* Table des messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages reçus</CardTitle>
          <CardDescription>
            {pagination && `Affichage de ${pagination.from} à ${pagination.to} sur ${pagination.total} messages`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
              <p className="text-gray-500">Aucun message de contact n'a été reçu pour le moment.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Date</TableHead>
                    {/* <TableHead>Statut</TableHead> */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id} className={!message.read ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-sm text-muted-foreground">{message.email}</div>
                          {message.phone && (
                            <div className="text-sm text-muted-foreground">{message.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{message.subject}</div>
                      </TableCell>
                      <TableCell>{formatDate(message.created_at)}</TableCell>
                      {/* <TableCell>{getMessageStatus(message)}</TableCell> */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(message.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.current_page} sur {pagination.last_page}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={!pagination.has_more_pages}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de visualisation du message */}
      <Dialog open={isViewMessageOpen} onOpenChange={setIsViewMessageOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du message</DialogTitle>
            <DialogDescription>
              Message reçu le {selectedMessage && formatDate(selectedMessage.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom</Label>
                  <p className="text-sm">{selectedMessage.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    <p className="text-sm">{selectedMessage.phone}</p>
                  </div>
                )}
                {/* <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <div className="mt-1">{getMessageStatus(selectedMessage)}</div>
                </div> */}
              </div>
              <div>
                <Label className="text-sm font-medium">Sujet</Label>
                <p className="text-sm font-medium">{selectedMessage.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewMessageOpen(false)}>
              Fermer
            </Button>
            {/* {selectedMessage && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowDeleteConfirm(selectedMessage.id)
                  setIsViewMessageOpen(false)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )} */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingMessage === showDeleteConfirm}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteMessage(showDeleteConfirm)}
                disabled={isDeletingMessage === showDeleteConfirm}
              >
                {isDeletingMessage === showDeleteConfirm ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 