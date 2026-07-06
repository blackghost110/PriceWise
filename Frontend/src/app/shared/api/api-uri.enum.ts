export enum ApiURI {
  ME='account/me',
  ACCOUNT_GET_ALL = 'account/all',
  ACCOUNT_UPDATE = 'account/:userId',
  ACCOUNT_DISPLAY_NAME_AVAILABLE = 'account/display-name/available',
  ACCOUNT_DISPLAY_NAME_UPDATE = 'account/me/display-name',

  BADGE_OVERVIEW = 'badge/overview',
  BADGE_SET_ACTIVE = 'badge/active',
  GAMIFICATION_PROFILE = 'badge/profile',
  LEADERBOARD = 'leaderboard',


  COMMENT_CREATE='comment',
  COMMENT_GET_ALL='comment',

  POST_CREATE='post',
  POST_GET='post',
  POST_GET_ALL='posts',

  LIST_CREATE='list',
  LIST_GET_ALL='list/user',
  LIST_UPDATE='list',
  LIST_DELETE='list',

  LIST_PRODUCT_CREATE='list-product',
  LIST_PRODUCT_GET_ALL='list-product',

  PRICE_CREATE='price',
  PRICE_UPDATE='price',
  PRICE_GET_USER_COUNT='price/users',

  PRODUCT_CREATE='product',
  PRODUCT_DETAIL='product',
  PRODUCT_GET_BY_STORE='store/:storeId/products',
  PRODUCT_MULTIPLE_DETAIL='product',
  PRODUCT_DELETE='product',

  // -- x

  STORE_CREATE='store',
  STORE_GET='store',
  STORE_GET_ALL='store',
  STORE_GET_TWO='store/last',
  STORE_UPDATE='store',
  STORE_DELETE='store',
  STORE_BRAND='store/brand',


}
