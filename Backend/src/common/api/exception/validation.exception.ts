import {ApiCodeResponse} from "@common/api/data/api-code.response";
import {HttpException, ValidationError} from "@nestjs/common";
import {isNil} from "lodash";

export class ValidationException extends HttpException {
    constructor(errors: ValidationError[]) {
        super({
            code: ApiCodeResponse.PAYLOAD_IS_NOT_VALID,
            data: errors.map((e) => Object.values(e.constraints ?? {})).flat(),
            // validationErrorToApiCodeResponse(e)).flat(),
            result: false
        }, 499);
    }
}


export const validationErrorToApiCodeResponse = (error: ValidationError): ApiCodeResponse[] =>
{
    return Object.keys(error.constraints ?? {}).map((k: string) => {
        const code = ApiCodeResponse[`${camelToSnake(error.property)}_${camelToSnake(k)}` as
            keyof typeof ApiCodeResponse];
        return isNil(code) ? ApiCodeResponse.PAYLOAD_PARAM_IS_MISSING : code;
    });
}


export const camelToSnake = (str: string): string => {
    return str.replace(/([A-Z])/g, " $1").split(' ').join('_').toUpperCase();
}