import {ApiCodeResponse} from "@common/api/data/api-code.response";

export interface ApiDataResponse {
    result: boolean;
    code: ApiCodeResponse;
    data: any;
}