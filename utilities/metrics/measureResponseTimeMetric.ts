import { HealthcheckStatus } from "../../enums/HealthCheckStatus"
import type { HealthcheckThresholds } from "../../types"
import type { CheckReadinessMetricContent } from "../../types/measurements/CheckReadinessMetrics"
import type { ResponseTimeCheck, ResponseTimeCheckRequest } from "../../types/measurements/ResponseTime"
import { checkThresholds } from "../checkThresholds"

type MeasureResponseTimeMetricParams = {
    request: ResponseTimeCheckRequest
    requestParts: Omit<CheckReadinessMetricContent, 'metrics'>
}

export async function measureResponseTimeMetric({
    request,
    requestParts,
}: MeasureResponseTimeMetricParams): Promise<ResponseTimeCheck[]> {
    try {
        const start = performance.now()
        const response = await request.query()
        const end = performance.now()

        const result = end - start;

        const status = request.thresholds ? 
            checkThresholds(result, request.thresholds) : 
            HealthcheckStatus.pass
            
        return [{
            componentId: requestParts.componentId,
            componentType: requestParts.componentType,
            time: new Date().toISOString(),
            status: status,
            affectedEndpoints: requestParts.affectedEndpoints,
            observedUnit: response.observedUnit,
            observedValue: response.observedValue
        }]
    }
    catch (e) {
        return [{
            componentId: requestParts.componentId,
            componentType: requestParts.componentType,
            time: new Date().toISOString(),
            status: HealthcheckStatus.fail,
            affectedEndpoints: requestParts.affectedEndpoints,
            observedUnit: '',
            observedValue: 0,
            output: (e as Error).message
        }]
    }
}