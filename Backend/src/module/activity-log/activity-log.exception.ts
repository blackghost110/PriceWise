import { ApiException } from '@common/api/exception/api.exception';
import { ApiCodeResponse } from '@common/api/data/api-code.response';

// ActivityLog Service Exceptions

export class ActivityLogGetAllException extends ApiException {
  constructor() {
    super(ApiCodeResponse.ACTIVITY_LOG_GET_ALL_EXCEPTION, 500);
  }
}
