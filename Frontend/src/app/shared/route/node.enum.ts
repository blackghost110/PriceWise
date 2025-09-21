export enum AppNode {
  // Authentication ----------
  AUTH = 'auth',

  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',

  SIGN_IN_PAGE = `/${AppNode.AUTH}/${AppNode.SIGN_IN}`,
  SIGN_UP_PAGE = `/${AppNode.AUTH}/${AppNode.SIGN_UP}`,



  // Home ----------
  HOME = '/home',



  // Catalog ----------
  CATALOG = 'catalog',

  STORE_LIST = 'store-list',
  STORE_LIST_PRODUCTS = 'store-list/:storeId/products',
  PRODUCT_LIST = 'product-list',
  PERSONAL_LIST = 'personal-list',
  PRODUCT_DETAIL = 'product-detail/:productId',

  STORE_LIST_PAGE = `/${AppNode.CATALOG}/${AppNode.STORE_LIST}`,
  STORE_LIST_PRODUCTS_PAGE = `/${AppNode.CATALOG}/${AppNode.STORE_LIST_PRODUCTS}`,
  PRODUCT_LIST_PAGE = `/${AppNode.CATALOG}/${AppNode.PRODUCT_LIST}`,
  PERSONAL_LIST_PAGE = `/${AppNode.CATALOG}/${AppNode.PERSONAL_LIST}`,
  PRODUCT_DETAIL_PAGE = `/${AppNode.CATALOG}/${AppNode.PRODUCT_DETAIL}`,



  // Forum ----------
  FORUM = '/forum',

  DASHBOARD = 'dashboard',
  POST = 'post/:postId',

  DASHBOARD_PAGE = `/${AppNode.FORUM}/${AppNode.DASHBOARD}`,
  POST_PAGE = `/${AppNode.FORUM}/${AppNode.POST}`,


  // miscellaneous ----------
  FALL_BACK = '**',

}
