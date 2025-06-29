# Gestion des messages de contact

## Configuration requise côté Laravel

Assurez-vous que votre API Laravel expose les endpoints suivants :

```php
// Pour la gestion des messages de contact
Route::get('/contact/messages', [ContactController::class, 'getAllMessages']);
Route::delete('/contact/messages/{id}', [ContactController::class, 'deleteMessage']);
```

### Endpoints requis :

1. **GET /contact/messages** - Récupère tous les messages avec pagination
   ```php
   public function getAllMessages()
   {
       $messages = ContactMessage::orderBy('created_at', 'desc')->paginate(10);
       
       return response()->json([
           'success' => true,
           'data' => $messages->items(),
           'pagination' => [
               'current_page' => $messages->currentPage(),
               'last_page' => $messages->lastPage(),
               'per_page' => $messages->perPage(),
               'total' => $messages->total(),
               'from' => $messages->firstItem(),
               'to' => $messages->lastItem(),
               'has_more_pages' => $messages->hasMorePages(),
               'next_page_url' => $messages->nextPageUrl(),
               'prev_page_url' => $messages->previousPageUrl()
           ]
       ], 200);
   }
   ```

2. **DELETE /contact/messages/{id}** - Supprime un message
   ```php
   public function deleteMessage($id)
   {
       $message = ContactMessage::find($id);
       
       if (!$message) {
           return response()->json([
               'success' => false,
               'message' => 'Message non trouvé.'
           ], 404);
       }

       $message->delete();

       return response()->json([
           'success' => true,
           'message' => 'Message supprimé avec succès.'
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
    $table->boolean('read')->default(false);
    $table->timestamps();
});
```

## Fonctionnalités implémentées

### 1. Tableau des messages
- Affichage paginé des messages (10 par page)
- Colonnes : Expéditeur, Sujet, Date, Statut, Actions
- Mise en évidence des messages non lus
- Actions : Voir, Supprimer

### 2. Statistiques en temps réel
- Total des messages
- Messages lus
- Messages non lus
- Messages reçus aujourd'hui

### 3. Recherche et filtres
- Recherche par nom, email ou sujet
- Filtres par statut (Tous, Lus, Non lus)
- Actualisation manuelle

### 4. Visualisation détaillée
- Modal de visualisation complète du message
- Affichage de tous les détails (nom, email, téléphone, sujet, message)
- Formatage de la date en français
- Statut du message (Lu/Non lu)

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

## Utilisation

1. **Accès** : Naviguez vers la page "Messages" dans l'administration
2. **Visualisation** : Cliquez sur "Voir" pour afficher les détails d'un message
3. **Recherche** : Utilisez la barre de recherche pour filtrer les messages
4. **Suppression** : Cliquez sur "Supprimer" et confirmez l'action
5. **Navigation** : Utilisez les boutons de pagination pour naviguer entre les pages

## Flux de données

1. **Chargement** : `GET /contact/messages?page=1` → Affichage du tableau
2. **Visualisation** : Clic sur "Voir" → Ouverture de la modal
3. **Suppression** : Confirmation → `DELETE /contact/messages/{id}` → Rafraîchissement
4. **Pagination** : Clic sur page → `GET /contact/messages?page=X` → Mise à jour
5. **Recherche** : Saisie → Filtrage côté client → Affichage filtré

## Configuration

Assurez-vous que votre fichier `.env.local` contient :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Personnalisation

### Modifier le nombre de messages par page
Dans votre contrôleur Laravel, changez la valeur dans `paginate(10)`.

### Ajouter de nouveaux filtres
Modifiez la fonction `filteredMessages` dans le composant React pour ajouter de nouveaux critères de filtrage.

### Modifier l'affichage des dates
Ajustez la fonction `formatDate` pour changer le format d'affichage des dates. 