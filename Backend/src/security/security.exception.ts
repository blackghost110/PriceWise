import {ApiCodeResponse} from "@common/api/data/api-code.response";
import {ApiException} from "@common/api/exception/api.exception";

export class NoTokenFoundedException extends ApiException {
    constructor() {
        super(ApiCodeResponse.NO_TOKEN_FOUNDED, 401);
    }
}
export class UserNotFoundException extends ApiException {
    constructor() {
        super(ApiCodeResponse.USER_NOT_FOUND, 401);
    }
}
export class TokenExpiredException extends ApiException {
    constructor() {
        super(ApiCodeResponse.TOKEN_EXPIRED, 401);
    }
}
export class CredentialDeleteException extends ApiException {
    constructor() {
        super(ApiCodeResponse.CREDENTIAL_DELETE_ERROR, 500);
    }
}
export class UserUpdateNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.USER_UPDATE_NOT_FOUND_EXCEPTION, 404);
  }
}
export class UserUpdateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.USER_UPDATE_EXCEPTION, 500);
  }
}
