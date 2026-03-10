export class HealthcheckError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'HealthcheckError'
    }
}