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
  User,
  Calendar,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
  MessageSquare,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Interface pour les contacts
interface Contact {
  id: number
  name: string
  email: string
  subject: string
  type: string
  created_at: string
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
const base_uri = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [pagination, setPagination] = React.useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null)
  const [isViewContactOpen, setIsViewContactOpen] = React.useState(false)
  const [isDeletingContact, setIsDeletingContact] = React.useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<number | null>(null)
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const { toast } = useToast()

  // Charger les contacts au montage du composant
  React.useEffect(() => {
    loadContacts()
  }, [currentPage, selectedType])

  const loadContacts = async () => {
    setIsLoading(true)
    try {
      let url = `${base_uri}/api/get-contact-info?page=${currentPage}`
      if (selectedType !== "all") {
        url += `&type=${selectedType}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        setContacts(data.data)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les contacts.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des contacts.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setIsViewContactOpen(true)
  }

  const handleDeleteContact = async (contactId: number) => {
    setIsDeletingContact(contactId)
    try {
      const response = await fetch(`${base_uri}/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Succès",
          description: "Contact supprimé avec succès.",
        })
        // Rafraîchir la liste des contacts
        await loadContacts()
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression du contact.",
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
      setIsDeletingContact(null)
      setShowDeleteConfirm(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1) // Reset to first page when changing filter
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getContactTypeBadge = (type: string) => {
    const typeColors = {
      'reservation': 'bg-blue-100 text-blue-800',
      'contact': 'bg-green-100 text-green-800',
      'complaint': 'bg-red-100 text-red-800',
      'feedback': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || typeColors.other}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getTypeCount = (type: string) => {
    return contacts.filter(contact => contact.type === type).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des contacts</h2>
          <p className="text-muted-foreground">Gérez les demandes de contact de vos clients</p>
        </div>
        <Button variant="outline" onClick={loadContacts} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total contacts</p>
                <p className="text-2xl font-bold">{pagination?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Réservations</p>
                <p className="text-2xl font-bold">{getTypeCount('reservation')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Contacts</p>
                <p className="text-2xl font-bold">{getTypeCount('contact')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Réclamations</p>
                <p className="text-2xl font-bold">{getTypeCount('complaint')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Aujourd'hui</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => 
                    new Date(c.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un contact..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="reservation">Réservations</SelectItem>
            <SelectItem value="contact">Contacts</SelectItem>
            <SelectItem value="complaint">Réclamations</SelectItem>
            <SelectItem value="feedback">Avis</SelectItem>
            <SelectItem value="other">Autres</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtrer
        </Button>
      </div>

      {/* Table des contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts reçus</CardTitle>
          <CardDescription>
            {pagination && `Affichage de ${pagination.from} à ${pagination.to} sur ${pagination.total} contacts`}
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
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contact</h3>
              <p className="text-gray-500">Aucun contact n'a été reçu pour le moment.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{contact.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{contact.subject}</div>
                      </TableCell>
                      <TableCell>{getContactTypeBadge(contact.type)}</TableCell>
                      <TableCell>{formatDate(contact.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(contact.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
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

      {/* Modal de visualisation du contact */}
      <Dialog open={isViewContactOpen} onOpenChange={setIsViewContactOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du contact</DialogTitle>
            <DialogDescription>
              Contact reçu le {selectedContact && formatDate(selectedContact.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom</Label>
                  <p className="text-sm">{selectedContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedContact.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="mt-1">{getContactTypeBadge(selectedContact.type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{formatDate(selectedContact.created_at)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Sujet</Label>
                <p className="text-sm font-medium">{selectedContact.subject}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewContactOpen(false)}>
              Fermer
            </Button>
            {selectedContact && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowDeleteConfirm(selectedContact.id)
                  setIsViewContactOpen(false)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
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
                Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingContact === showDeleteConfirm}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteContact(showDeleteConfirm)}
                disabled={isDeletingContact === showDeleteConfirm}
              >
                {isDeletingContact === showDeleteConfirm ? (
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