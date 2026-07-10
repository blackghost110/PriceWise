import { ApiException } from '@common/api/exception/api.exception';
import { ApiCodeResponse } from '@common/api/data/api-code.response';

// Report Service Exceptions

export class ReportCreateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.REPORT_CREATE_EXCEPTION, 500);
  }
}

export class ReportGetAllException extends ApiException {
  constructor() {
    super(ApiCodeResponse.REPORT_GET_ALL_EXCEPTION, 500);
  }
}

export class ReportNotFoundException extends ApiException {
  constructor() {
    super(ApiCodeResponse.REPORT_GET_BY_ID_EXCEPTION, 404);
  }
}

export class ReportUpdateException extends ApiException {
  constructor() {
    super(ApiCodeResponse.REPORT_UPDATE_EXCEPTION, 500);
  }
}
