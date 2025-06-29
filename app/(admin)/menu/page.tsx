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
  Upload,
  Image as ImageIcon,
  FileImage,
  X,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Sample menu items data
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    category: "Burgers Bœuf",
    priceSolo: 16.5,
    priceMenu: 24.5,
    description: "Burger classique avec steak de bœuf, salade, tomate, oignon",
    supplements: ["Bacon (+3.00)", "Cheddar (+2.50)", "Avocat (+2.00)"],
    popular: true,
  },
  {
    id: 2,
    name: "Chicken Deluxe",
    category: "Burgers Poulet",
    priceSolo: 15.5,
    priceMenu: 23.5,
    description: "Escalope de poulet grillée, salade, tomate, sauce curry",
    supplements: ["Bacon (+3.00)", "Fromage (+2.50)"],
    popular: false,
  },
  {
    id: 3,
    name: "Veggie Yummy Burger",
    category: "Burgers Végétariens",
    priceSolo: 18.5,
    priceMenu: 26.5,
    description: "Steak végétarien, salade, tomate, avocat, sauce vegan",
    supplements: ["Avocat (+2.00)", "Fromage vegan (+3.00)"],
    popular: true,
  },
]

// Interface pour les images de menu
interface MenuImage {
  id: number
  image_of_menu: string
  created_at: string
}

// Interface pour les données de signature Cloudinary
interface SignatureData {
  cloud_name: string
  signature: string
  timestamp: string
  api_key: string
}

// Configuration Cloudinary
const base_uri = process.env.NEXT_PUBLIC_API_URL || "https://backend.crazywolf-lausanne.com"

export default function MenuPage() {
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false)
  const [isAddImageOpen, setIsAddImageOpen] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState("")
  const [imageError, setImageError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [menuImages, setMenuImages] = React.useState<MenuImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = React.useState(true)
  const [uploadMethod, setUploadMethod] = React.useState<'url' | 'file'>('file')
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDeletingImage, setIsDeletingImage] = React.useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<number | null>(null)
  const [selectedImageForView, setSelectedImageForView] = React.useState<MenuImage | null>(null)
  const [isViewImageOpen, setIsViewImageOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Charger les images au montage du composant
  React.useEffect(() => {
    loadMenuImages()
  }, [])

  const loadMenuImages = async () => {
    try {
      const response = await fetch(`${base_uri}/api/menu-images`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setMenuImages(data.data)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les images de menu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des images.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingImages(false)
    }
  }

  // Fonction pour obtenir la signature Cloudinary
  async function getSignature(): Promise<SignatureData> {
    const response = await fetch(base_uri + "/api/generatesignature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch signature");
    }
    //alert("Signature fetched successfully");
    // console.log( await response.json());
    return (await response.json()) as SignatureData;
  }

  // Fonction pour uploader vers Cloudinary
  async function uploadToCloudinary(file: File): Promise<string> {
    const signatureData = await getSignature();

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/auto/upload`
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
          console.log(progress);
        }
      };

      // Créer un objet FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "iwafolder");

      // Envoyer à Cloudinary
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error(`Failed to upload file: ${file.name}`));
        }
      };
      xhr.onerror = () => {
        reject(new Error(`Failed to upload file: ${file.name}`));
      };
      xhr.send(formData);
    });
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier image valide.",
          variant: "destructive",
        })
        return
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "Le fichier est trop volumineux. Taille maximum : 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setImageError(false)
    }
  }

  const handleAddMenuImage = async () => {
    let finalImageUrl = ""

    if (uploadMethod === 'file') {
      if (!selectedFile) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier image.",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        finalImageUrl = await uploadToCloudinary(selectedFile)
        toast({
          title: "Succès",
          description: "Image uploadée vers Cloudinary avec succès.",
        })
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de l'upload vers Cloudinary.",
          variant: "destructive",
        })
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    } else {
      if (!imageUrl.trim()) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir une URL d'image valide.",
          variant: "destructive",
        })
        return
      }
      finalImageUrl = imageUrl.trim()
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${base_uri}/api/menu-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_of_menu: finalImageUrl
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Image de menu ajoutée avec succès.",
        })
        setIsAddImageOpen(false)
        setImageUrl("")
        setImageError(false)
        setSelectedFile(null)
        setUploadMethod('file')
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        // Rafraîchir la liste des images
        await loadMenuImages()
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de l'ajout de l'image.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setImageError(false)
  }

  const resetForm = () => {
    setImageUrl("")
    setImageError(false)
    setSelectedFile(null)
    setUploadMethod('file')
    setUploadProgress(0)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    setIsDeletingImage(imageId)
    try {
      const response = await fetch(`${base_uri}/api/menu-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Succès",
          description: "Image de menu supprimée avec succès.",
        })
        // Rafraîchir la liste des images
        await loadMenuImages()
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression de l'image.",
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
      setIsDeletingImage(null)
      setShowDeleteConfirm(null)
    }
  }

  const handleViewImage = (image: MenuImage) => {
    setSelectedImageForView(image)
    setIsViewImageOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion du menu</h2>
          <p className="text-muted-foreground">Gérez tous les plats de votre restaurant</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddImageOpen} onOpenChange={setIsAddImageOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ImageIcon className="mr-2 h-4 w-4" />
                Ajouter une image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter une image de menu</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle image pour votre menu en uploadant un fichier ou en saisissant une URL.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Méthode d'upload */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={uploadMethod === 'file' ? 'default' : 'outline'}
                    onClick={() => setUploadMethod('file')}
                    className="flex items-center gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    Upload fichier
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMethod === 'url' ? 'default' : 'outline'}
                    onClick={() => setUploadMethod('url')}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    URL externe
                  </Button>
                </div>

                {/* Upload de fichier */}
                {uploadMethod === 'file' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file-upload" className="text-right">
                        Fichier image
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          ref={fileInputRef}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
                        </p>
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Aperçu</Label>
                        <div className="col-span-3">
                          <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="Aperçu"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                              onClick={() => {
                                setSelectedFile(null)
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ""
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Barre de progression */}
                    {isUploading && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Progression</Label>
                        <div className="col-span-3 space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload en cours... {uploadProgress.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* URL externe */}
                {uploadMethod === 'url' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-url" className="text-right">
                        URL de l'image
                      </Label>
                      <Input
                        id="image-url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    {imageUrl && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Aperçu</Label>
                        <div className="col-span-3">
                          <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                            {!imageError ? (
                              <img
                                src={imageUrl}
                                alt="Aperçu"
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                              />
                            ) : (
                              <div className="absolute inset-0 items-center justify-center bg-gray-100 text-gray-500 flex">
                                <div className="text-center">
                                  <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                                  <p className="text-sm">Image non accessible</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddImageOpen(false)
                    resetForm()
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  onClick={handleAddMenuImage}
                  disabled={isLoading || isUploading ||
                    (uploadMethod === 'file' && !selectedFile) ||
                    (uploadMethod === 'url' && !imageUrl.trim())
                  }
                >
                  {isLoading || isUploading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {isUploading ? "Upload en cours..." : "Ajout en cours..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Ajouter l'image
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un plat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau plat</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau plat à votre menu avec tous les détails nécessaires.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom du plat
                </Label>
                <Input id="name" defaultValue="Veggie Yummy Burger" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Catégorie
                </Label>
                <Select defaultValue="burgers-vegetariens">
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrees">Entrées</SelectItem>
                    <SelectItem value="burgers-boeuf">Burgers Bœuf</SelectItem>
                    <SelectItem value="burgers-poulet">Burgers Poulet</SelectItem>
                    <SelectItem value="burgers-porc">Burgers Porc</SelectItem>
                    <SelectItem value="burgers-vegetariens">Burgers Végétariens</SelectItem>
                    <SelectItem value="burgers-saumon">Burgers Saumon</SelectItem>
                    <SelectItem value="sandwiches">Sandwiches</SelectItem>
                    <SelectItem value="pates">Pâtes</SelectItem>
                    <SelectItem value="plats-speciaux">Plats spéciaux</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="boissons">Boissons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  defaultValue="Steak végétarien, salade, tomate, avocat, sauce vegan"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price-solo" className="text-right col-span-2">
                    Prix Seul (CHF)
                  </Label>
                  <Input id="price-solo" type="number" step="0.50" defaultValue="18.50" className="col-span-2" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price-menu" className="text-right col-span-2">
                    Prix Menu (CHF)
                  </Label>
                  <Input id="price-menu" type="number" step="0.50" defaultValue="26.50" className="col-span-2" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplements" className="text-right">
                  Suppléments
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Nom du supplément" defaultValue="Avocat" />
                    <Input placeholder="Prix" type="number" step="0.50" defaultValue="2.00" className="w-20" />
                    <span className="text-sm text-muted-foreground">CHF</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-3 w-3" />
                    Ajouter un supplément
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsAddItemOpen(false)}>
                Ajouter le plat
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog> */}
        </div>
      </div>

      {/* Images de menu section */}
      <Card>
        <CardHeader>
          <CardTitle>Images du menu</CardTitle>
          <CardDescription>Gérez les images affichées sur votre menu</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingImages ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video rounded-lg bg-gray-200"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : menuImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune image</h3>
              <p className="text-gray-500 mb-4">Commencez par ajouter votre première image de menu.</p>
              <Button onClick={() => setIsAddImageOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Ajouter une image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={image.image_of_menu}
                      alt="Menu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleViewImage(image)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(image.id)}
                        disabled={isDeletingImage === image.id}
                      >
                        {isDeletingImage === image.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Confirmation de suppression */}
                  {showDeleteConfirm === image.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                      <div className="bg-white rounded-lg p-4 mx-4 max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(null)}
                            disabled={isDeletingImage === image.id}
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={isDeletingImage === image.id}
                          >
                            {isDeletingImage === image.id ? (
                              <>
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Suppression...
                              </>
                            ) : (
                              'Supprimer'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Ajoutée le {new Date(image.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un plat..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="burgers">Burgers</SelectItem>
            <SelectItem value="sandwiches">Sandwiches</SelectItem>
            <SelectItem value="desserts">Desserts</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtrer
        </Button>
      </div> */}

      {/* <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plat</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix Seul</TableHead>
              <TableHead>Prix Menu</TableHead>
              <TableHead>Popularité</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>{item.priceSolo.toFixed(2)} CHF</TableCell>
                <TableCell>{item.priceMenu.toFixed(2)} CHF</TableCell>
                <TableCell>
                  {item.popular && <Badge className="bg-green-100 text-green-800">Populaire</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
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
      </Card> */}

      {/* Modal de visualisation d'image en grand */}
      <Dialog open={isViewImageOpen} onOpenChange={setIsViewImageOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Visualisation de l'image</DialogTitle>
            <DialogDescription>
              Image ajoutée le {selectedImageForView && new Date(selectedImageForView.created_at).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          {selectedImageForView && (
            <div className="flex justify-center items-center">
              <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg">
                <img
                  src={selectedImageForView.image_of_menu}
                  alt="Image de menu"
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewImageOpen(false)}>
              Fermer
            </Button>
            {/* {selectedImageForView && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowDeleteConfirm(selectedImageForView.id)
                  setIsViewImageOpen(false)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )} */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 