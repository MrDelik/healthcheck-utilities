import { HealthcheckMeasurements } from "../enums/HealthcheckMeasurements"
import { HealthcheckStatus } from "../enums/HealthCheckStatus"
import type { HealthcheckResponse } from "../types"
import type { CheckReadinessMetricContent } from "../types/measurements/CheckReadinessMetrics"
import {
    measureConnectionsMetric, 
    measureCustomMetric,
    measureResponseTimeMetric,
    measureUptimeMetric,
    measureUtilizationMetric,
 } from "./metrics"

type CheckReadinessProps = {
    version?: HealthcheckResponse['version'],
    description?: HealthcheckResponse['description'],
    notes?: HealthcheckResponse['notes'],
    releaseId?: HealthcheckResponse['releaseId'],
    serviceId?: HealthcheckResponse['serviceId'],
    links?: HealthcheckResponse['links']
    externalServiceMetrics?: Record<string, CheckReadinessMetricContent>,
    cache?: number
}

export async function runChecks({
    version,
    description,
    notes,
    releaseId,
    serviceId,
    links,
    externalServiceMetrics,
    cache,
}: CheckReadinessProps) {
    let checks: HealthcheckResponse['checks'] = {}
    const hasWarnOrFail = {
        warn: false,
        fail: false
    }

    if (externalServiceMetrics) {
        const promisesWithKey = Object.keys(externalServiceMetrics).flatMap(serviceName => {
            const currentConfig = externalServiceMetrics[serviceName]

            return Object.keys(currentConfig!.metrics).map(metricKey => {
                const resultKey = `${serviceName}:${metricKey}`;

                switch (metricKey as HealthcheckMeasurements) {
                    case HealthcheckMeasurements.connections:
                        return {
                            key: resultKey,
                            innerPromise: measureConnectionsMetric({
                                requestParts: currentConfig!,
                                request: currentConfig!.metrics[metricKey]!
                            })
                        }
                    case HealthcheckMeasurements.responseTime:
                        return {
                            key: resultKey,
                            innerPromise: measureResponseTimeMetric({
                                requestParts: currentConfig!,
                                request: currentConfig!.metrics[metricKey]!
                            })
                        }
                    case HealthcheckMeasurements.uptime:
                        return {
                            key: resultKey,
                            innerPromise: measureUptimeMetric({
                                requestParts: currentConfig!,
                                request: currentConfig!.metrics[metricKey]!
                            })
                        }
                    case HealthcheckMeasurements.utilization:
                        return {
                            key: resultKey,
                            innerPromise: measureUtilizationMetric({
                                requestParts: currentConfig!,
                                request: currentConfig!.metrics[metricKey]!
                            })
                        }
                    default:
                        return {
                            key: resultKey,
                            innerPromise: measureCustomMetric({
                                requestParts: currentConfig!,
                                request: currentConfig!.metrics[metricKey]!
                            })
                        }
                }
            })
        })

        const result = await Promise.all(promisesWithKey.map(pwk => pwk?.innerPromise))

        checks = result.reduce<Required<HealthcheckResponse>['checks']>((acc, current, index) => {
            const currentKey = promisesWithKey[index]?.key
            if (currentKey) {
                acc[currentKey] = current!
            }

            if (current) {
                current.forEach(c => {
                    if (c.status === HealthcheckStatus.fail) {
                        hasWarnOrFail.fail = true
                        
                    }
                    if (c.status === HealthcheckStatus.warn) {
                        hasWarnOrFail.warn = true
                    }
                })
            }

            return acc
        }, {})
    }
    else {
        checks = undefined
    }

    const headers = new Headers({
        'Content-Type': 'application/health+json',
    })

    if (cache) {
        headers.append('Cache-Control', `max-age=${cache}`)
    }

    return {
        http: {
            status: 200,
            headers
        },
        body: {
            status: hasWarnOrFail.fail ? 
                HealthcheckStatus.fail : 
                    hasWarnOrFail.warn ? 
                        HealthcheckStatus.warn : 
                        HealthcheckStatus.pass,
            version,
            description,
            notes,
            releaseId,
            serviceId,
            checks,
            links
        }
    }
}