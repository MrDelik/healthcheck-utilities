import type { ComponentType } from "../ComponentType"
import type { ConnectionsCheckRequest } from "./Connections"
import type { GenericCheckRequest } from "./GenericCheckResponse"
import type { ResponseTimeCheckRequest } from "./ResponseTime"
import type { UptimeCheckRequest } from "./Uptime"
import type { UtilizationCheckRequest } from "./Utilization"

export type CheckReadinessMetricQueries = {
    connections?: ConnectionsCheckRequest,
    responseTime?: ResponseTimeCheckRequest
    uptime?: UptimeCheckRequest
    utilization?: UtilizationCheckRequest
} & {
    [key: string]: GenericCheckRequest
}

export type CheckReadinessMetricContent = {
    componentId?: string
    componentType: ComponentType
    affectedEndpoints?: string[]
    metrics: CheckReadinessMetricQueries
}
