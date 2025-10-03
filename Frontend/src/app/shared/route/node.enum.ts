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
  STORE_PRODUCTS = ':storeId/products', // Changé pour éviter la duplication
  PRODUCT_LIST = 'product-list',
  PERSONAL_LIST = 'personal-list',
  PRODUCT_DETAIL = ':productId', // Simplifié

  // Forum routes
  FORUM = 'forum',
  DASHBOARD = 'dashboard',
  POST = ':postId', // Simplifié
  LEADERBOARD = 'leaderboard',

  // Fallback
  FALL_BACK = '**',
}
