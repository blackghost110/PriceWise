import { ApiException } from '@common/api/exception/api.exception';
import { ApiCodeResponse } from '@common/api/data/api-code.response';


// List Service Exceptions

export class ListCreateConflictException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_CREATE_CONFLICT_EXCEPTION, 409);
  }
}

export class ListCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_CREATE_EXCEPTION, 500);
  }
}

export class ListGetByUserException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_GET_BY_USER_EXCEPTION, 500);
  }
}

export class ListUpdateNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_UPDATE_NOT_FOUND_EXCEPTION, 404);
  }
}

export class ListUpdateConflictException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_UPDATE_CONFLICT_EXCEPTION, 409);
  }
}

export class ListUpdateForbiddenException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_UPDATE_FORBIDDEN_EXCEPTION, 403);
  }
}

export class ListUpdateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_UPDATE_EXCEPTION, 500);
  }
}

export class ListDeleteNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_DELETE_NOT_FOUND_EXCEPTION, 404);
  }
}

export class ListDeleteForbiddenException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_DELETE_FORBIDDEN_EXCEPTION, 403);
  }
}

export class ListDeleteException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_DELETE_EXCEPTION, 500);
  }
}




// ListProduct Service Exceptions ------------------------------------------------------//



export class ListProductCreateConflictException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_PRODUCT_CREATE_CONFLICT_EXCEPTION, 409);
  }
}

export class ListProductCreateNotFoundListException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_PRODUCT_CREATE_NOT_FOUND_LIST_EXCEPTION, 404);
  }
}

export class ListProductCreateNotFoundProductException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_PRODUCT_CREATE_NOT_FOUND_PRODUCT_EXCEPTION, 404);
  }
}

export class ListProductCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_PRODUCT_CREATE_EXCEPTION, 500);
  }
}

export class ListProductGetByListException extends ApiException {
  constructor() {
    super(ApiCodeResponse.LIST_PRODUCT_GET_BY_LIST_EXCEPTION, 500);
  }
}


// Price Service Exceptions ------------------------------------------------------//


export class PriceCreateUserNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_CREATE_USER_NOT_FOUND_EXCEPTION, 404);
  }
}

export class PriceCreateProductNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_CREATE_PRODUCT_NOT_FOUND_EXCEPTION, 404);
  }
}

export class PriceCreateBadRequestException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_CREATE_BAD_REQUEST_EXCEPTION, 400);
  }
}

export class PriceCreateConflictException extends ApiException { // ---------------------------------------------------//
  constructor(priceData: {priceId: number, productPrice: number, grossPrice: number}) {
    super(ApiCodeResponse.PRICE_CREATE_CONFLICT_EXCEPTION, 409, priceData );
  }
}

export class PriceCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_CREATE_EXCEPTION, 500);
  }
}

export class PriceGetPricesException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_GET_PRICES_EXCEPTION, 500);
  }
}

export class PriceGetLastPriceException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_GET_LAST_PRICE_EXCEPTION, 500);
  }
}

export class PriceUpdateBadRequestException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_UPDATE_BAD_REQUEST_EXCEPTION, 400);
  }
}

export class PriceUpdateNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_UPDATE_NOT_FOUND_EXCEPTION, 404);
  }
}
export class PriceUpdateUserNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_UPDATE_USER_NOT_FOUND_EXCEPTION, 404);
  }
}

export class PriceUpdateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_UPDATE_EXCEPTION, 500);
  }
}
export class PriceGetUsersCountException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRICE_GET_USER_COUNT_EXCEPTION, 500);
  }
}

// Product Service Exceptions ------------------------------------------------------//


export class ProductCreateNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRODUCT_CREATE_NOT_FOUND_EXCEPTION, 404);
  }
}

export class ProductCreateConflictException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRODUCT_CREATE_CONFLICT_EXCEPTION, 409);
  }
}

export class ProductCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRODUCT_CREATE_EXCEPTION, 500);
  }
}

export class ProductGetAllException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRODUCT_GET_ALL_EXCEPTION, 500);
  }
}

export class ProductDetailNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRODUCT_DETAIL_NOT_FOUND_EXCEPTION, 404);
  }
}

export class ProductDeleteNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRODUCT_DELETE_NOT_FOUND_EXCEPTION, 404);
  }
}

export class ProductDeleteException extends ApiException {
  constructor() {
    super(ApiCodeResponse.PRODUCT_DELETE_EXCEPTION, 500);
  }
}


// Store Service Exceptions ------------------------------------------------------//


export class StoreCreateConflictException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_CREATE_CONFLICT_EXCEPTION, 409);
  }
}

export class StoreCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_CREATE_EXCEPTION, 500);
  }
}

export class StoreFindAllException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_FIND_ALL_EXCEPTION, 500);
  }
}

export class StoreFindTwoException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_FIND_TWO_EXCEPTION, 500);
  }
}

export class StoreInfoException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_INFO_EXCEPTION, 500);
  }
}

export class StoreGetProductsException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_GET_PRODUCTS_EXCEPTION, 500);
  }
}

export class StoreUpdateNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_UPDATE_NOT_FOUND_EXCEPTION, 404);
  }
}

export class StoreUpdateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.STORE_UPDATE_EXCEPTION, 500);
  }
}
