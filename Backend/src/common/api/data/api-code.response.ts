export enum ApiCodeResponse {

  COMMON_SUCCESS = 'api.success.common',

  // SECURITY API EXCEPTIONS --------------------------------------------//

  PAYLOAD_PARAM_IS_MISSING = 'api.error.payload-param-is-missing',
  TOKEN_GEN_ERROR = 'api.error.stock-detail',
  USER_ALREADY_EXIST = 'api.security.error.user-exist',
  CREDENTIAL_DELETE_ERROR = 'api.security.error.credential-delete',
  TOKEN_EXPIRED = 'api.security.error.token-expired',
  USER_NOT_FOUND = 'api.security.error.user-not-found',
  SIGNUP_ERROR = 'api.security.error.signup',
  NO_TOKEN_FOUNDED = 'api.security.error.no-token-found',
  PAYLOAD_IS_NOT_VALID = 'api.error.payload-is-not-valid',
  USER_UPDATE_NOT_FOUND_EXCEPTION = 'api.security.error.user-update-not-found-exception', // new
  USER_UPDATE_EXCEPTION = 'api.security.error.user-update-exception', // new


  // SOCIAL API EXCEPTIONS --------------------------------------------//
  // Post Service Exception Codes
  POST_CREATE_EXCEPTION = 'api.post.error.create-exception',
  POST_GET_ALL_EXCEPTION = 'api.post.error.get-all-exception',
  POST_GET_BY_ID_EXCEPTION = 'api.post.error.get-by-id-exception',

  // Comment Service Exception Codes
  COMMENT_CREATE_EXCEPTION = 'api.comment.error.create-exception',
  COMMENT_CREATE_USER_EXCEPTION = 'api.comment.error.create-user-exception',
  COMMENT_GET_BY_ID_EXCEPTION = 'api.comment.error.get-by-id-exception',

  // CATALOG API EXCEPTIONS --------------------------------------------//

  // List Service Exception Codes
  LIST_CREATE_CONFLICT_EXCEPTION = 'api.list.error.create-conflict-exception',
  LIST_CREATE_EXCEPTION = 'api.list.error.create-exception',
  LIST_GET_BY_USER_EXCEPTION = 'api.list.error.get-by-user-exception',
  LIST_UPDATE_NOT_FOUND_EXCEPTION = 'api.list.error.update-not-found-exception',
  LIST_UPDATE_CONFLICT_EXCEPTION = 'api.list.error.update-conflict-exception',
  LIST_UPDATE_FORBIDDEN_EXCEPTION = 'api.list.error.update-forbidden-exception',
  LIST_UPDATE_EXCEPTION = 'api.list.error.update-exception',
  LIST_DELETE_NOT_FOUND_EXCEPTION = 'api.list.error.delete-not-found-exception',
  LIST_DELETE_FORBIDDEN_EXCEPTION = 'api.list.error.delete-forbidden-exception',
  LIST_DELETE_EXCEPTION = 'api.list.error.delete-exception',

  // List Product Service Exception Codes
  LIST_PRODUCT_CREATE_CONFLICT_EXCEPTION = 'api.list-product.error.create-conflict-exception',
  LIST_PRODUCT_CREATE_NOT_FOUND_LIST_EXCEPTION = 'api.list-product.error.create-not-found-list-exception',
  LIST_PRODUCT_CREATE_NOT_FOUND_PRODUCT_EXCEPTION = 'api.list-product.error.create-not-found-product-exception',
  LIST_PRODUCT_CREATE_EXCEPTION = 'api.list-product.error.create-exception',
  LIST_PRODUCT_GET_BY_LIST_EXCEPTION = 'api.list-product.error.get-by-list-exception',

  // Price Service Exception Codes
  PRICE_CREATE_USER_NOT_FOUND_EXCEPTION = 'api.price.error.create-user-not-found-exception',
  PRICE_CREATE_PRODUCT_NOT_FOUND_EXCEPTION = 'api.price.error.create-product-not-found-exception',
  PRICE_CREATE_BAD_REQUEST_EXCEPTION = 'api.price.error.create-bad-request-exception',
  PRICE_CREATE_CONFLICT_EXCEPTION = 'api.price.error.create-conflict-exception',
  PRICE_CREATE_EXCEPTION = 'api.price.error.create-exception',
  PRICE_GET_PRICES_EXCEPTION = 'api.price.error.get-prices-exception',
  PRICE_GET_LAST_PRICE_EXCEPTION = 'api.price.error.get-last-price-exception',
  PRICE_UPDATE_BAD_REQUEST_EXCEPTION = 'api.price.error.update-bad-request-exception',
  PRICE_UPDATE_NOT_FOUND_EXCEPTION = 'api.price.error.update-not-found-exception',
  PRICE_UPDATE_USER_NOT_FOUND_EXCEPTION = 'api.price.error.update-user-not-found-exception',
  PRICE_UPDATE_EXCEPTION = 'api.price.error.update-exception',
  PRICE_GET_USER_COUNT_EXCEPTION = 'api.price.error.get-user-count-exception', // new

  // Product Service Exception Codes
  PRODUCT_CREATE_NOT_FOUND_EXCEPTION = 'api.product.error.create-not-found-exception',
  PRODUCT_CREATE_CONFLICT_EXCEPTION = 'api.product.error.create-conflict-exception',
  PRODUCT_CREATE_EXCEPTION = 'api.product.error.create-exception',
  PRODUCT_GET_ALL_EXCEPTION = 'api.product.error.get-all-exception',
  PRODUCT_DETAIL_NOT_FOUND_EXCEPTION = 'api.product.error.detail-not-found-exception',
  PRODUCT_DELETE_NOT_FOUND_EXCEPTION = 'api.product.error.delete-not-found-exception',
  PRODUCT_DELETE_EXCEPTION = 'api.product.error.delete-exception',

  // Store Service Exception Codes
  STORE_CREATE_CONFLICT_EXCEPTION = 'api.store.error.create-conflict-exception',
  STORE_CREATE_EXCEPTION = 'api.store.error.create-exception',
  STORE_FIND_ALL_EXCEPTION = 'api.store.error.find-all-exception',
  STORE_FIND_TWO_EXCEPTION = 'api.store.error.find-two-exception',
  STORE_INFO_EXCEPTION = 'api.store.error.info-exception',
  STORE_GET_PRODUCTS_EXCEPTION = 'api.store.error.get-products-exception',
  STORE_UPDATE_NOT_FOUND_EXCEPTION = 'api.store.error.update-not-found-exception', // new
  STORE_UPDATE_EXCEPTION = 'api.store.error.update-exception', //new

}