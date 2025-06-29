# Configuration Cloudinary pour l'upload d'images

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Configuration API Laravel
NEXT_PUBLIC_API_URL=http://localhost:8000

# Configuration Cloudinary (optionnel)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=iwafolder
```

## Configuration requise côté Laravel

Assurez-vous que votre API Laravel expose les endpoints suivants :

```php
// Pour l'upload d'images vers Cloudinary
Route::post('/api/generatesignature', [YourController::class, 'generateSignature']);

// Pour la gestion des images de menu
Route::get('/menu-images', [ContactController::class, 'getAllMenuImages']);
Route::post('/menu-images', [ContactController::class, 'addMenuImage']);
Route::delete('/menu-images/{id}', [ContactController::class, 'deleteMenuImage']);
```

### Endpoints requis :

1. **GET /menu-images** - Récupère toutes les images de menu
   ```php
   public function getAllMenuImages()
   {
       $menuImages = MenuImage::orderBy('created_at', 'desc')->get();
       
       return response()->json([
           'success' => true,
           'data' => $menuImages
       ], 200);
   }
   ```

2. **POST /menu-images** - Ajoute une nouvelle image de menu
   ```php
   public function addMenuImage(Request $request)
   {
       $validator = Validator::make($request->all(), [
           'image_of_menu' => 'required|string|max:500',
       ]);

       if ($validator->fails()) {
           return response()->json(['errors' => $validator->errors()], 422);
       }

       $menuImage = MenuImage::create([
           'image_of_menu' => $request->image_of_menu,
       ]);

       return response()->json([
           'success' => true,
           'message' => 'Image de menu ajoutée avec succès.',
           'data' => $menuImage
       ], 201);
   }
   ```

3. **DELETE /menu-images/{id}** - Supprime une image de menu
   ```php
   public function deleteMenuImage($id)
   {
       $menuImage = MenuImage::find($id);
       
       if (!$menuImage) {
           return response()->json([
               'success' => false,
               'message' => 'Image de menu non trouvée.'
           ], 404);
       }

       $menuImage->delete();

       return response()->json([
           'success' => true,
           'message' => 'Image de menu supprimée avec succès.'
       ], 200);
   }
   ```

4. **POST /api/generatesignature** - Génère la signature Cloudinary
   ```php
   public function generateSignature()
   {
       // Votre logique de génération de signature Cloudinary
       return response()->json([
           'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
           'signature' => $signature,
           'timestamp' => $timestamp,
           'api_key' => env('CLOUDINARY_API_KEY')
       ]);
   }
   ```

## Fonctionnalités implémentées

### 1. Upload de fichiers
- Support des formats : JPG, PNG, GIF
- Taille maximale : 5MB
- Aperçu en temps réel
- Barre de progression d'upload
- Validation côté client

### 2. URL externe
- Saisie d'URL d'image
- Validation d'URL
- Aperçu en temps réel
- Gestion des erreurs d'affichage

### 3. Intégration Cloudinary
- Upload sécurisé via signature Laravel
- Utilisation du preset "iwafolder"
- Gestion des erreurs d'upload
- Retour de l'URL sécurisée

### 4. Interface utilisateur
- Basculement entre upload fichier et URL
- Aperçu des images sélectionnées
- Boutons d'action (supprimer, annuler)
- États de chargement et progression
- Notifications toast

### 5. Gestion des images
- Suppression d'images avec confirmation
- États de chargement pour la suppression
- Rafraîchissement automatique après suppression
- Gestion des erreurs de suppression

### 6. Intégration API Laravel
- Appel direct à votre API Laravel
- Chargement des images depuis la base de données
- Ajout d'images via l'API Laravel
- Gestion des erreurs d'API

## Utilisation

1. Cliquez sur "Ajouter une image" dans la page de gestion du menu
2. Choisissez entre "Upload fichier" ou "URL externe"
3. Sélectionnez votre fichier ou saisissez l'URL
4. Vérifiez l'aperçu
5. Cliquez sur "Ajouter l'image"

L'image sera automatiquement uploadée vers Cloudinary (si c'est un fichier) puis enregistrée dans votre base de données via l'API Laravel.

## Flux de données

1. **Chargement des images** : `GET /menu-images` → Affichage dans l'interface
2. **Upload fichier** : Fichier → Cloudinary → URL → `POST /menu-images`
3. **URL externe** : URL → `POST /menu-images`
4. **Suppression d'image** : Confirmation → `DELETE /menu-images/{id}` → Rafraîchissement
5. **Rafraîchissement** : `GET /menu-images` → Mise à jour de l'affichage 