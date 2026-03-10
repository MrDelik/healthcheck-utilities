import { HealthcheckStatus } from "../enums/HealthCheckStatus";
import type { HealthcheckThresholds } from "../types";

export function checkThresholds(duration: number, thresholds: HealthcheckThresholds): HealthcheckStatus {
    let status = HealthcheckStatus.pass
        
    if (thresholds.fail < duration) {
        status = HealthcheckStatus.fail
    }
    else if(thresholds.warn < duration) {
        status = HealthcheckStatus.warn
    }

    return status
}