# Gestion des contacts

## Configuration requise côté Laravel

Assurez-vous que votre API Laravel expose les endpoints suivants :

```php
// Pour la gestion des contacts
Route::get('/get-contact-info', [ContactController::class, 'getContactInfo']);
Route::delete('/contacts/{id}', [ContactController::class, 'deleteContact']);
```

### Endpoints requis :

1. **GET /get-contact-info** - Récupère tous les contacts avec pagination et filtrage par type
   ```php
   public function getContactInfo(Request $request)
   {
       $query = ContactMessage::select('id', 'name', 'email', 'subject', 'type', 'created_at');
       
       // Filtrer par type si spécifié
       if ($request->has('type') && $request->type) {
           $query->where('type', $request->type);
       }
       
       $contacts = $query->orderBy('created_at', 'desc')->paginate(10);
       
       return response()->json([
           'success' => true,
           'data' => $contacts->items(),
           'pagination' => [
               'current_page' => $contacts->currentPage(),
               'last_page' => $contacts->lastPage(),
               'per_page' => $contacts->perPage(),
               'total' => $contacts->total(),
               'from' => $contacts->firstItem(),
               'to' => $contacts->lastItem(),
               'has_more_pages' => $contacts->hasMorePages(),
               'next_page_url' => $contacts->nextPageUrl(),
               'prev_page_url' => $contacts->previousPageUrl()
           ]
       ], 200);
   }
   ```

2. **DELETE /contacts/{id}** - Supprime un contact
   ```php
   public function deleteContact($id)
   {
       $contact = ContactMessage::find($id);
       
       if (!$contact) {
           return response()->json([
               'success' => false,
               'message' => 'Contact non trouvé.'
           ], 404);
       }

       $contact->delete();

       return response()->json([
           'success' => true,
           'message' => 'Contact supprimé avec succès.'
       ], 200);
   }
   ```

## Structure de données attendue

Le modèle `ContactMessage` doit contenir les champs suivants :

```php
// Migration example
Schema::create('contact_messages', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->string('phone')->nullable();
    $table->string('subject');
    $table->text('message');
    $table->enum('type', ['reservation', 'contact', 'complaint', 'feedback', 'other'])->default('contact');
    $table->boolean('read')->default(false);
    $table->timestamps();
});
```

## Fonctionnalités implémentées

### 1. Tableau des contacts
- Affichage paginé des contacts (10 par page)
- Colonnes : Contact, Sujet, Type, Date, Actions
- Badges colorés pour les différents types de contact
- Actions : Voir, Supprimer

### 2. Statistiques en temps réel
- Total des contacts
- Contacts par type (Réservations, Contacts, Réclamations, Avis)
- Contacts reçus aujourd'hui

### 3. Recherche et filtres
- Recherche par nom, email ou sujet
- Filtres par type de contact (Tous, Réservations, Contacts, Réclamations, Avis, Autres)
- Actualisation manuelle
- Reset automatique à la première page lors du changement de filtre

### 4. Visualisation détaillée
- Modal de visualisation complète du contact
- Affichage de tous les détails (nom, email, type, date, sujet)
- Formatage de la date en français
- Badge de type avec couleur appropriée

### 5. Suppression sécurisée
- Confirmation obligatoire avant suppression
- États de chargement pendant la suppression
- Gestion des erreurs
- Rafraîchissement automatique après suppression

### 6. Interface utilisateur
- Design responsive
- États de chargement avec squelettes
- Notifications toast pour le feedback
- Pagination intuitive
- Message d'état vide

### 7. Gestion des types de contact
- Badges colorés pour chaque type :
  - **Réservations** : Bleu
  - **Contacts** : Vert
  - **Réclamations** : Rouge
  - **Avis** : Violet
  - **Autres** : Gris

## Utilisation

1. **Accès** : Naviguez vers la page "Contacts" dans l'administration
2. **Visualisation** : Cliquez sur "Voir" pour afficher les détails d'un contact
3. **Recherche** : Utilisez la barre de recherche pour filtrer les contacts
4. **Filtrage** : Utilisez le sélecteur de type pour filtrer par catégorie
5. **Suppression** : Cliquez sur "Supprimer" et confirmez l'action
6. **Navigation** : Utilisez les boutons de pagination pour naviguer entre les pages

## Flux de données

1. **Chargement** : `GET /get-contact-info?page=1&type=all` → Affichage du tableau
2. **Filtrage** : Changement de type → `GET /get-contact-info?page=1&type=X` → Mise à jour
3. **Visualisation** : Clic sur "Voir" → Ouverture de la modal
4. **Suppression** : Confirmation → `DELETE /contacts/{id}` → Rafraîchissement
5. **Pagination** : Clic sur page → `GET /get-contact-info?page=X&type=Y` → Mise à jour
6. **Recherche** : Saisie → Filtrage côté client → Affichage filtré

## Configuration

Assurez-vous que votre fichier `.env.local` contient :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Personnalisation

### Modifier le nombre de contacts par page
Dans votre contrôleur Laravel, changez la valeur dans `paginate(10)`.

### Ajouter de nouveaux types de contact
1. Modifiez l'enum dans la migration Laravel
2. Ajoutez les couleurs correspondantes dans `getContactTypeBadge()`
3. Ajoutez l'option dans le sélecteur de filtres

### Modifier l'affichage des dates
Ajustez la fonction `formatDate` pour changer le format d'affichage des dates.

### Ajouter de nouveaux filtres
Modifiez la fonction `filteredContacts` dans le composant React pour ajouter de nouveaux critères de filtrage.

## Prévention des problèmes d'hydratation

L'interface a été conçue pour éviter les problèmes d'hydratation en :
- Utilisant des états React appropriés
- Gérant correctement les états de chargement
- Évitant les différences entre le rendu serveur et client
- Utilisant des composants client-side uniquement 