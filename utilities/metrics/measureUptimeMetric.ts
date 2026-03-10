import { HealthcheckStatus } from "../../enums/HealthCheckStatus"
import type { CheckReadinessMetricContent } from "../../types/measurements/CheckReadinessMetrics"
import type { UptimeCheck, UptimeCheckRequest } from "../../types/measurements/Uptime"
import { checkThresholds } from "../checkThresholds"

type MeasureUptimeMetricParams = {
    request: UptimeCheckRequest
    requestParts: Omit<CheckReadinessMetricContent, 'metrics'>
}

export async function measureUptimeMetric({
    request,
    requestParts
}: MeasureUptimeMetricParams): Promise<UptimeCheck[]> {
    try {
        const start = performance.now()
        const response = await request.query()
        const end = performance.now()
        
        const result = end - start;
        
        const status = request.thresholds ? 
            checkThresholds(result, request.thresholds) : 
            HealthcheckStatus.pass

        return [{
            componentType: requestParts.componentType,
            componentId: requestParts.componentId,
            observedUnit: response.observedUnit,
            observedValue: response.observedValue,
            status,
            time: new Date().toISOString()
        }]
    }
    catch(e) {
        return [{
            componentType: requestParts.componentType,
            componentId: requestParts.componentId,
            observedUnit: 'ms',
            observedValue: 0,
            status: HealthcheckStatus.fail,
            time: new Date().toISOString(),
            output: (e as Error).message
        }]
    }
}