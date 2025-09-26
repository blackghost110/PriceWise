import { AppNode } from "./node.enum";

export class AppRoutes {
  // Authentication pages
  static readonly SIGN_IN_PAGE = `/${AppNode.AUTH}/${AppNode.SIGN_IN}`;
  static readonly SIGN_UP_PAGE = `/${AppNode.AUTH}/${AppNode.SIGN_UP}`;

  // Home page
  static readonly HOME_PAGE = `/${AppNode.HOME}`;

  // Catalog pages
  static readonly STORE_LIST_PAGE = `/${AppNode.CATALOG}/${AppNode.STORE_LIST}`;
  static readonly PRODUCT_LIST_PAGE = `/${AppNode.CATALOG}/${AppNode.PRODUCT_LIST}`;
  static readonly PERSONAL_LIST_PAGE = `/${AppNode.CATALOG}/${AppNode.PERSONAL_LIST}`;

  // Forum pages
  static readonly DASHBOARD_PAGE = `/${AppNode.FORUM}/${AppNode.DASHBOARD}`;

  // Méthodes helpers pour les routes avec paramètres
  static storeProductsPage(storeId: string): string {
    return `/${AppNode.CATALOG}/${AppNode.STORE_LIST}/${storeId}/products`;
  }

  static productDetailPage(productId: string): string {
    return `/${AppNode.CATALOG}/product-detail/${productId}`;
  }

  static postPage(postId: string): string {
    return `/${AppNode.FORUM}/post/${postId}`;
  }
}
