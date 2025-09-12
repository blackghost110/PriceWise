export enum ApiURI {
  SIGN_IN='account/signin',
  SIGN_UP='account/signup',
  ME='account/me',
  REFRESH_TOKEN = 'account/refresh',

  PUBLICATION_CREATE = 'publication/create',
  PUBLICATION_LIST = 'publication/list',
  PUBLICATION_LIST_USER = 'publication/list-user',
  PUBLICATION_DELETE = 'publication/delete',
  PUBLICATION_DELETE_USER = 'publication/deletePubliUser',
  PUBLICATION_LAST = 'publication/last',

  PROFIL_USER = 'profil/profil-user',
  PROFIL_UPDATE_USER = 'profil/update-user',

  COMMENTAIRE_CREATE = 'commentaire/create',
  COMMENTAIRE_LIST = 'commentaire/list',
  COMMENTAIRE_LIST_USER = 'commentaire/list-user',
  COMMENTAIRE_LAST = 'commentaire/last',

  JAIME_CREATE = 'jaime/create',
  JAIME_PUBLICATION_LIST = 'jaime/list',
  JAIME_LAST = 'jaime/last',


}
