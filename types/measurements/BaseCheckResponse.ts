import type { ComponentType } from "../ComponentType"
import type { ObservedValue } from "./ObservedValue"

export type BaseExtendsCheckResponse = Record<string, unknown>

export type BaseCheckResponse<T extends BaseExtendsCheckResponse> = {
    componentId?: string
    componentType: ComponentType
    observedValue: ObservedValue
    observedUnit: string
    time: string
    affectedEndpoints?: string[]
} & T