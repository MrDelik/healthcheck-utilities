import type { HealthcheckStatus } from "../../enums/HealthCheckStatus";
import type { HealthcheckThresholds } from "../HealthcheckThresholds";
import type { BaseCheckQueryResponse } from "./BaseCheckQuery";
import type { BaseCheckResponse, BaseExtendsCheckResponse } from "./BaseCheckResponse";

type SuccessGenericCheckResponse<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.pass,
    output?: never
}

type WarnOrFailGenericCheckResponse<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.fail | HealthcheckStatus.warn,
    output?: string
}

export type GenericCheckResponse<T extends BaseExtendsCheckResponse = {}> = SuccessGenericCheckResponse<T> | WarnOrFailGenericCheckResponse<T>

export type GenericCheckQueryResponse = BaseCheckQueryResponse<
    string,
    string | number
>
export type GenericCheckRequest = {
    query: () => Promise<GenericCheckQueryResponse>
    thresholds?: HealthcheckThresholds
}