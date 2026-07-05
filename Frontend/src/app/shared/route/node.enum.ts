export enum AppNode {
  // Authentication routes
  AUTH = 'auth',
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',

  // Admin routes
  ADMIN = 'admin',

  // Home routes
  HOME = 'home',

  // Catalog routes
  CATALOG = 'catalog',
  STORE_LIST = 'store-list',
  STORE_PRODUCTS = ':storeId/products',
  PRODUCT_LIST = 'product-list',
  PERSONAL_LIST = 'personal-list',
  PRODUCT_DETAIL = ':productId',

  // Forum routes
  FORUM = 'forum',
  DASHBOARD = 'dashboard',
  POST = ':postId',
  LEADERBOARD = 'leaderboard',

  // Account routes
  PROFILE = 'profile',

  // Fallback
  FALL_BACK = '**',
}
