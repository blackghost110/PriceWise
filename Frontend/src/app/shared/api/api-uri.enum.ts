export enum ApiURI {
  SIGN_IN='account/signin',
  SIGN_UP='account/signup',
  ME='account/me',
  REFRESH_TOKEN = 'account/refresh',


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

  PRODUCT_CREATE='product',
  PRODUCT_DETAIL='product',
  PRODUCT_GET_BY_STORE='store/:storeId/products',
  PRODUCT_MULTIPLE_DETAIL='product',
  // -- x

  STORE_CREATE='store',
  STORE_GET='store',
  STORE_GET_ALL='store',
  STORE_GET_TWO='store/last',
  

}
