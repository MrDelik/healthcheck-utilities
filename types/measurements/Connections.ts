import type { HealthcheckStatus } from "../../enums"
import type { HealthcheckThresholds } from "../HealthcheckThresholds"
import type { BaseCheckQueryResponse } from "./BaseCheckQuery"
import type { BaseCheckResponse } from "./BaseCheckResponse"

type PassConnections<T extends Record<string, unknown>> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.pass
    output?: never
}

type WarnOrFailConnections<T extends Record<string, unknown>> = BaseCheckResponse<T> & {
    status: HealthcheckStatus.warn | HealthcheckStatus.fail
    output?: string
}

export type ConnectionsCheck<T extends Record<string, unknown> = {}> = PassConnections<T> | WarnOrFailConnections<T>

export type ConnectionsCheckResponse = BaseCheckQueryResponse<
    'connections' | (string & {}),
    string | number
>
export type ConnectionsCheckRequest = {
    query: () => Promise<ConnectionsCheckResponse>,
    thresholds?: HealthcheckThresholds
}