import type { HealthcheckStatus } from "../../enums/HealthCheckStatus";
import type { HealthcheckThresholds } from "../HealthcheckThresholds";
import type { BaseCheckQueryResponse } from "./BaseCheckQuery";
import type { BaseCheckResponse, BaseExtendsCheckResponse } from "./BaseCheckResponse";

type PassUtilizationCheck<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.pass
    output?: never
}

type WarnOrFailUtilizationCheck<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.warn | HealthcheckStatus.fail
    output?: string
}

export type UtilizationCheck<T extends BaseExtendsCheckResponse = {}> = PassUtilizationCheck<T> | WarnOrFailUtilizationCheck<T>

export type UtilizationCheckResponse = BaseCheckQueryResponse<
    'percent' | (string & {}),
    string | number
>
export type UtilizationCheckRequest = {
    query: () => Promise<UtilizationCheckResponse>
    thresholds?: HealthcheckThresholds
}