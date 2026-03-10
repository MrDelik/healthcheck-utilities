import type { ComponentType } from "../ComponentType"
import type { HealthcheckThresholds } from "../HealthcheckThresholds"

export type BaseCheckQuery = {
    componentId?: string
    componentType: ComponentType
    affectedEndpoints?: string[]
    thresholds?: HealthcheckThresholds
}

export type BaseCheckQueryResponse<OU extends string, OV = string> = {
    observedUnit: OU
    observedValue: OV
}
