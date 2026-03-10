import type { HealthcheckStatus } from "../enums/HealthCheckStatus";
import type { ConnectionsCheck, GenericCheckResponse, ResponseTimeCheck, UptimeCheck, UtilizationCheck } from "./measurements";

type CheckLink = Record<string, string>

type ChecksByMeasurement = {
    [key: `${string}:responseTime`]: ResponseTimeCheck[]
    [key: `${string}:connections`]: ConnectionsCheck[]
    [key: `${string}:utilization`]: UtilizationCheck[]
    [key: `${string}:uptime`]: UptimeCheck[]
    [key: string]: GenericCheckResponse[]
}

export type HealthcheckResponse = {
    status: HealthcheckStatus
    version?: string
    releaseId?: string
    notes?: string[]
    output?: string
    checks?: ChecksByMeasurement
    links?: CheckLink
    serviceId?: string
    description?: string
}

export type HealthchecResponsekWithDuration = HealthcheckResponse & {
    duration: number
}