import type { HealthcheckStatus } from "../../enums/HealthCheckStatus";
import type { HealthcheckThresholds } from "../HealthcheckThresholds";
import type { BaseCheckQueryResponse } from "./BaseCheckQuery";
import type { BaseCheckResponse, BaseExtendsCheckResponse } from "./BaseCheckResponse";

type PassUptimeCheck<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.pass
    output?: never
}
type WarnOrFailUptimeCheck<T extends BaseExtendsCheckResponse> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.warn | HealthcheckStatus.fail,
    output?: string
}

export type UptimeCheck<T extends BaseExtendsCheckResponse = {}> = PassUptimeCheck<T> | WarnOrFailUptimeCheck<T>

export type UptimeCheckResponse = BaseCheckQueryResponse<
    'ms' | 's' | (string & {}),
    string | number
>
export type UptimeCheckRequest = {
    query: () => Promise<UptimeCheckResponse>
    thresholds?: HealthcheckThresholds
}