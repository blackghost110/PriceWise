import {ApiCodeResponse} from "@common/api/data/api-code.response";
import {HttpException} from "@nestjs/common";

export class ApiException extends HttpException {
    constructor(code: ApiCodeResponse, status: number, data?: any) {
        super(
            {
                code: code,
                data: data || null,
                result: false
            }, status
        );
    }
}