import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {

  private readonly errorMessages: Map<string, string> = new Map([
    // Erreurs de sécurité
    ['api.security.error.user-not-found', 'Nom d\'utilisateur ou mot de passe incorrect'],
    ['api.security.error.user-exist', 'Cet utilisateur existe déjà'],
    ['api.security.error.token-expired', 'Votre session a expiré, veuillez vous reconnecter'],
    ['api.security.error.credential-delete', 'Impossible de supprimer cet utilisateur'],
    ['api.security.error.no-token-found', 'Vous devez être connecté pour accéder à cette ressource'],
    ['api.security.error.signup', 'Une erreur est survenue lors de l\'inscription'],

    // Erreurs Firebase Authentication (auth.service.ts / pages sign-in / sign-up)
    ['auth/invalid-credential', 'E-mail ou mot de passe incorrect'],
    ['auth/invalid-email', 'Adresse e-mail invalide'],
    ['auth/user-not-found', 'Aucun compte ne correspond à cet e-mail'],
    ['auth/wrong-password', 'E-mail ou mot de passe incorrect'],
    ['auth/email-already-in-use', 'Un compte existe déjà avec cet e-mail'],
    ['auth/weak-password', 'Le mot de passe doit contenir au moins 6 caractères'],
    ['auth/too-many-requests', 'Trop de tentatives, veuillez réessayer plus tard'],
    ['auth/popup-closed-by-user', 'Connexion annulée'],
    ['auth/cancelled-popup-request', 'Connexion annulée'],
    ['auth/network-request-failed', 'Problème de connexion réseau, veuillez réessayer'],

    // Erreurs de validation
    ['api.error.payload-is-not-valid', 'Les données fournies ne sont pas valides'],
    ['api.error.payload-param-is-missing', 'Des informations requises sont manquantes'],
    ['api.error.stock-detail', 'Impossible de générer le token d\'authentification'],

    // Messages de succès
    ['api.success.common', 'Opération réalisée avec succès'],

    // ERREURS SOCIAL (Posts & Comments)
    // Posts
    ['api.post.error.create-exception', 'Impossible de créer le post. Veuillez réessayer.'],
    ['api.post.error.get-all-exception', 'Impossible de charger les posts. Veuillez réessayer.'],
    ['api.post.error.get-by-id-exception', 'Ce post n\'existe pas ou n\'est plus disponible'],

    // Comments
    ['api.comment.error.create-exception', 'Impossible de créer le commentaire. Veuillez réessayer.'],
    ['api.comment.error.create-user-exception', 'Utilisateur introuvable pour créer le commentaire'],
    ['api.comment.error.get-by-id-exception', 'Ce commentaire n\'existe pas ou n\'est plus disponible'],

    // ERREURS CATALOG (Lists, Products, Prices, Stores)
    // Lists
    ['api.list.error.create-conflict-exception', 'Une liste avec ce nom existe déjà'],
    ['api.list.error.create-exception', 'Impossible de créer la liste. Veuillez réessayer.'],
    ['api.list.error.get-by-user-exception', 'Impossible de charger vos listes. Veuillez réessayer.'],
    ['api.list.error.update-not-found-exception', 'Cette liste n\'existe pas ou n\'est plus disponible'],
    ['api.list.error.update-conflict-exception', 'Une liste avec ce nom existe déjà'],
    ['api.list.error.update-forbidden-exception', 'Vous n\'avez pas les droits pour modifier cette liste'],
    ['api.list.error.update-exception', 'Impossible de modifier la liste. Veuillez réessayer.'],
    ['api.list.error.delete-not-found-exception', 'Cette liste n\'existe pas ou a déjà été supprimée'],
    ['api.list.error.delete-forbidden-exception', 'Vous n\'avez pas les droits pour supprimer cette liste'],
    ['api.list.error.delete-exception', 'Impossible de supprimer la liste. Veuillez réessayer.'],

    // List Products
    ['api.list-product.error.create-conflict-exception', 'Ce produit est déjà dans votre liste'],
    ['api.list-product.error.create-not-found-list-exception', 'Cette liste n\'existe pas ou n\'est plus disponible'],
    ['api.list-product.error.create-not-found-product-exception', 'Ce produit n\'existe pas ou n\'est plus disponible'],
    ['api.list-product.error.create-exception', 'Impossible d\'ajouter le produit à la liste. Veuillez réessayer.'],
    ['api.list-product.error.get-by-list-exception', 'Impossible de charger les produits de cette liste. Veuillez réessayer.'],
    ['api.list-product.error.delete-not-found-exception', 'Ce produit n\'est plus dans la liste'],
    ['api.list-product.error.delete-exception', 'Impossible de retirer le produit de la liste. Veuillez réessayer.'],

    // Prices
    ['api.price.error.create-user-not-found-exception', 'Utilisateur introuvable pour enregistrer le prix'],
    ['api.price.error.create-product-not-found-exception', 'Produit introuvable pour enregistrer le prix'],
    ['api.price.error.create-bad-request-exception', 'Les informations du prix ne sont pas valides'],
    ['api.price.error.create-conflict-exception', 'Un prix pour ce produit et ce magasin existe déjà pour cette date, voulez vous le modifier ?'],
    ['api.price.error.create-exception', 'Impossible d\'enregistrer le prix. Veuillez réessayer.'],
    ['api.price.error.get-prices-exception', 'Impossible de charger les prix. Veuillez réessayer.'],
    ['api.price.error.get-last-price-exception', 'Impossible de récupérer le dernier prix. Veuillez réessayer.'],
    ['api.price.error.update-bad-request-exception', 'Les informations du prix ne sont pas valides'],
    ['api.price.error.update-not-found-exception', 'Ce prix n\'existe pas ou n\'est plus disponible'],
    ['api.price.error.update-exception', 'Impossible de modifier le prix. Veuillez réessayer.'],

    // Products
    ['api.product.error.create-not-found-exception', 'Informations manquantes pour créer le produit'],
    ['api.product.error.create-conflict-exception', 'Un produit avec ce nom existe déjà'],
    ['api.product.error.create-exception', 'Impossible de créer le produit. Veuillez réessayer.'],
    ['api.product.error.get-all-exception', 'Impossible de charger les produits. Veuillez réessayer.'],
    ['api.product.error.detail-not-found-exception', 'Ce produit n\'existe pas ou n\'est plus disponible'],
    ['api.product.error.update-not-found-exception', 'Ce produit n\'existe pas ou n\'est plus disponible'],
    ['api.product.error.update-exception', 'Impossible de modifier le produit. Veuillez réessayer.'],
    ['api.product.error.lookup-exception', 'Impossible de contacter la base produits. Remplissez les champs manuellement.'],

    // Stores
    ['api.store.error.create-conflict-exception', 'Un magasin avec ce nom existe déjà'],
    ['api.store.error.create-exception', 'Impossible de créer le magasin. Veuillez réessayer.'],
    ['api.store.error.find-all-exception', 'Impossible de charger les magasins. Veuillez réessayer.'],
    ['api.store.error.find-two-exception', 'Impossible de charger les magasins sélectionnés. Veuillez réessayer.'],
    ['api.store.error.info-exception', 'Impossible de charger les informations du magasin. Veuillez réessayer.'],
    ['api.store.error.get-products-exception', 'Impossible de charger les produits du magasin. Veuillez réessayer.'],

    // ERREURS ACCOUNT (Profil)
    ['api.account.error.display-name-taken-exception', 'Ce nom est déjà utilisé'],
    ['api.account.error.display-name-update-exception', 'Impossible de modifier le nom d\'affichage. Veuillez réessayer.'],

    // ERREURS BADGE (Gamification)
    ['api.badge.error.overview-exception', 'Impossible de charger vos badges. Veuillez réessayer.'],
    ['api.badge.error.set-active-not-unlocked-exception', 'Vous devez d\'abord débloquer ce badge pour l\'afficher'],
    ['api.badge.error.set-active-exception', 'Impossible de mettre à jour le badge actif. Veuillez réessayer.'],
    ['api.gamification.error.profile-exception', 'Impossible de charger votre profil de jeu. Veuillez réessayer.'],
    ['api.gamification.error.leaderboard-exception', 'Impossible de charger le classement. Veuillez réessayer.'],

    // ERREURS ACTIVITY LOG (Admin)
    ['api.activity-log.error.get-all-exception', 'Impossible de charger le journal d\'activité. Veuillez réessayer.'],

    // ERREURS REPORT (Signalements)
    ['api.report.error.create-exception', 'Impossible d\'envoyer le signalement. Veuillez réessayer.'],
    ['api.report.error.get-all-exception', 'Impossible de charger les signalements. Veuillez réessayer.'],
    ['api.report.error.get-by-id-exception', 'Ce signalement n\'existe pas ou n\'est plus disponible'],
    ['api.report.error.update-exception', 'Impossible de mettre à jour le signalement. Veuillez réessayer.'],

    // Message par défaut
    ['default', 'Une erreur inattendue s\'est produite. Veuillez réessayer.']
  ]);

  /**
   * Traduit un code d'erreur API en message utilisateur
   */
  getErrorMessage(code: string | null | undefined, data?: any): string {
    if (!code) {
      return this.errorMessages.get('default')!;
    }

    if (data !== null && data !== undefined) {
      switch (code) {
        case 'api.price.error.create-conflict-exception':
          return `Un prix existe déjà pour cette date : \nPrix: ${data.productPrice}€ \nPrix brut: ${data.referencePrice}€ \nVoulez-vous modifier le prix ?`;


        default:
          break;
      }
    }


    return this.errorMessages.get(code) || this.errorMessages.get('default')!;
  }

}
