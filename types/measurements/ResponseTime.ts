import type { HealthcheckStatus } from "../../enums/HealthCheckStatus"
import type { HealthcheckThresholds } from "../HealthcheckThresholds"
import type { BaseCheckQueryResponse } from "./BaseCheckQuery"
import type { BaseCheckResponse, BaseExtendsCheckResponse } from "./BaseCheckResponse"

type PassResponseTimeCheck<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.pass,
    output?: never
}

type WarnOrFailResponseTimeCheck<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.fail | HealthcheckStatus.warn
    output?: string
}

export type ResponseTimeCheck<T extends BaseExtendsCheckResponse = {}> = PassResponseTimeCheck<T> | WarnOrFailResponseTimeCheck<T>

export type ResponseTimeCheckResponse = BaseCheckQueryResponse<
    'ms' | 's' | (string & {}),
    string | number
>
export type ResponseTimeCheckRequest = {
    query: () => Promise<ResponseTimeCheckResponse>
    thresholds?: HealthcheckThresholds
}