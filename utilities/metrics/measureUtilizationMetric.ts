import { HealthcheckStatus } from "../../enums/HealthCheckStatus"
import type { UptimeCheck } from "../../types/measurements"
import type { CheckReadinessMetricContent } from "../../types/measurements/CheckReadinessMetrics"
import type { ConnectionsCheck, ConnectionsCheckRequest, ConnectionsCheckResponse } from "../../types/measurements/Connections"
import type { UtilizationCheck } from "../../types/measurements/Utilization"
import { checkThresholds } from "../checkThresholds"

type MeasureUtilizationMetricParams = {
    request: ConnectionsCheckRequest
    requestParts: Omit<CheckReadinessMetricContent, 'metrics'>
}

export async function measureUtilizationMetric({
    request,
    requestParts
}: MeasureUtilizationMetricParams): Promise<UtilizationCheck[]> {
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
            observedUnit: 'percent',
            observedValue: 0,
            status: HealthcheckStatus.fail,
            time: new Date().toISOString(),
            output: (e as Error).message
        }]
    }
}