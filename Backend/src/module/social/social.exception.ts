import { ApiException } from '@common/api/exception/api.exception';
import { ApiCodeResponse } from '@common/api/data/api-code.response';

export class PostCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.POST_CREATE_EXCEPTION, 500);
  }
}

export class PostGetAllException extends ApiException {
  constructor() {
    super(ApiCodeResponse.POST_GET_ALL_EXCEPTION, 500);
  }
}

export class PostGetByIdException extends ApiException {
  constructor() {
    super(ApiCodeResponse.POST_GET_BY_ID_EXCEPTION, 404);
  }
}

export class CommentCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.COMMENT_CREATE_EXCEPTION, 500);
  }
}

export class CommentCreateUserException extends ApiException {
  constructor() {
    super(ApiCodeResponse.COMMENT_CREATE_USER_EXCEPTION, 404);
  }
}

export class CommentGetByIdException extends ApiException {
  constructor() {
    super(ApiCodeResponse.COMMENT_GET_BY_ID_EXCEPTION, 404);
  }
}