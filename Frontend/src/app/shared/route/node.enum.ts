export enum AppNode {
  SIGN_IN = 'sign-in',
  AUTHENTICATED = 'dashboard',
  PUBLIC = 'account',
  REDIRECT_TO_PUBLIC = AppNode.PUBLIC,
  REDIRECT_TO_AUTHENTICATED = AppNode.AUTHENTICATED,
  MEMBER = 'member',
  DETAIL = 'detail/:id',
  PROFIL = 'dashboard/profil',
  SIGN_UP = 'sign-up',
  FALL_BACK = '**',

}
