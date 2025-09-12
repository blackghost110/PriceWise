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
    ['api.error.no-token-founded', 'Vous devez être connecté pour accéder à cette ressource'],

    // Erreurs de validation
    ['api.error.payload-is-not-valid', 'Les données fournies ne sont pas valides'],
    ['api.error.payload-param-is-missing', 'Des informations requises sont manquantes'],

    // Erreurs générales
    ['api.error.signup', 'Une erreur est survenue lors de l\'inscription'],
    ['api.error.token-gen-error', 'Impossible de générer le token d\'authentification'],

    // Message par défaut
    ['default', 'Une erreur inattendue s\'est produite. Veuillez réessayer.']
  ]);

  /**
   * Traduit un code d'erreur API en message utilisateur
   */
  getErrorMessage(code: string | null | undefined): string {
    if (!code) {
      return this.errorMessages.get('default')!;
    }

    return this.errorMessages.get(code) || this.errorMessages.get('default')!;
  }

  /**
   * Traduit plusieurs codes d'erreur (utile pour les erreurs de validation)
   */
  getErrorMessages(codes: string[]): string[] {
    return codes.map(code => this.getErrorMessage(code));
  }

  /**
   * Ajoute ou met à jour un message d'erreur personnalisé
   */
  setErrorMessage(code: string, message: string): void {
    this.errorMessages.set(code, message);
  }

  /**
   * Récupère un message d'erreur avec des paramètres dynamiques
   * Exemple : getParameterizedMessage('user.not.found', {username: 'John'})
   */
  getParameterizedMessage(code: string, params?: Record<string, any>): string {
    let message = this.getErrorMessage(code);

    if (params) {
      Object.keys(params).forEach(key => {
        message = message.replace(`{${key}}`, params[key]);
      });
    }

    return message;
  }
}
