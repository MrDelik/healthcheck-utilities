import { HealthcheckStatus } from "../../enums/HealthCheckStatus"
import type { CheckReadinessMetricContent } from "../../types/measurements/CheckReadinessMetrics"
import type { GenericCheckResponse } from "../../types/measurements/GenericCheckResponse"
import type { ResponseTimeCheckRequest } from "../../types/measurements/ResponseTime"
import { checkThresholds } from "../checkThresholds"

type MeasureCustomMetricParams = {
    request: ResponseTimeCheckRequest
    requestParts: Omit<CheckReadinessMetricContent, 'metrics'>
}

export async function measureCustomMetric({
    request,
    requestParts
}: MeasureCustomMetricParams): Promise<GenericCheckResponse[]> {
    try {
        const start = performance.now()
        const response = await request.query()
        const end = performance.now()
        const duration = end - start

        const status = request.thresholds ? 
            checkThresholds(duration, request.thresholds) :
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
            observedUnit: '',
            observedValue: '',
            status: HealthcheckStatus.fail,
            time: new Date().toISOString(),
            affectedEndpoints: requestParts?.affectedEndpoints,
            output: (e as Error).message
        }]
    }
}