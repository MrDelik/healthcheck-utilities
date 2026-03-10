import {expect, test, describe, spyOn} from 'bun:test'
import { runChecks } from '../../utilities/runChecks'
import type { ConnectionsCheckResponse } from '../../types/measurements/Connections'
import type { UptimeCheckResponse } from '../../types/measurements/Uptime'
import type { UtilizationCheckResponse } from '../../types/measurements/Utilization'
import { HealthcheckStatus } from '../../enums/HealthCheckStatus'
import type { GenericCheckQueryResponse, GenericCheckResponse } from '../../types/measurements'

const wait = (timer = 500) => new Promise(resolve => {
    setTimeout(() => resolve(null), timer)
})

describe('Given a call to runChecks', () => {
    const description = 'test simple check'
    test('When doing a simple check', async () => {
        const result = await runChecks({
            description
        })

        // Then the result should have field description with corresponding value
        expect(result.body).toHaveProperty('description', description);
    })

    test('When doing a test with dependencies', async () => {
        spyOn(global, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    fakeBody: 'test'
                })
        ));
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        responseTime: {
                            query: async () => {
                                const query = await fetch('http://fake.be')
                                const resp = await query.json()

                                return {
                                    observedUnit: 'ms',
                                    observedValue: 10
                                };
                            }
                        }
                    }
                }
            }
        })

        // Then the repsonse should have checks property
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty('externalService:responseTime')
        expect(result.body.checks!['externalService:responseTime']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:responseTime']![0]).toHaveProperty('observedValue', 10)
    })

    test('When doing a test with repsonse time and it throws an error', async () => {
        const errorMessage = 'error in repsonse time check'
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        responseTime: {
                            query: async () => {
                                throw new Error(errorMessage)
                            }
                        }
                    }
                }
            }
        })

        // Then the response should have responseTime check metric with an output key and status fail
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty('externalService:responseTime')
        expect(result.body.checks!['externalService:responseTime']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:responseTime']![0]).toHaveProperty('output', errorMessage)
        expect(result.body.checks!['externalService:responseTime']![0]).toHaveProperty('status', HealthcheckStatus.fail)
    })

    test('When doing a test with Connections check', async () => {
        const fakedBody: ConnectionsCheckResponse = {
            observedUnit: 'connections',
            observedValue: 5
        }

        spyOn(global, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify(fakedBody)
        ));
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        connections: {
                            query: async () => {
                                const query = await fetch('http://fake.be')
                                const resp = await query.json()

                                return resp as ConnectionsCheckResponse
                            }
                        }
                    }
                }
            }
        })

        // Then the repsonse should have checks property with connections mertric
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty('externalService:connections')
        expect(result.body.checks!['externalService:connections']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:connections']![0]).toHaveProperty('observedValue', fakedBody.observedValue)
        expect(result.body.checks!['externalService:connections']![0]).toHaveProperty('observedUnit', fakedBody.observedUnit)
    })

    test('When doing a test with Connections check and it throw an error', async () => {
        const errorMessage = 'Fake error'
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        connections: {
                            query: async () => {
                                throw new Error(errorMessage)
                            }
                        }
                    }
                }
            }
        })

        // Then the repsonse should have checks property with connections mertric wioth status fail and output key
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body).toHaveProperty('status', HealthcheckStatus.fail)
        expect(result.body.checks).toHaveProperty('externalService:connections')
        expect(result.body.checks!['externalService:connections']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:connections']![0]).toHaveProperty('output', errorMessage)
        expect(result.body.checks!['externalService:connections']![0]).toHaveProperty('status', HealthcheckStatus.fail)
    })

    test('When doing a test with Uptime check', async () => {
        const fakedBody: UptimeCheckResponse = {
            observedUnit: 'ms',
            observedValue: 100
        }

        spyOn(global, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify(fakedBody)
        ));
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        uptime: {
                            query: async () => {
                                const query = await fetch('http://fake.be')
                                const resp = await query.json()

                                return resp as UptimeCheckResponse
                            }
                        }
                    }
                }
            }
        })

        // Then the repsonse should have uptime checks property
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty('externalService:uptime')
        expect(result.body.checks!['externalService:uptime']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:uptime']![0]).toHaveProperty('observedValue', fakedBody.observedValue)
        expect(result.body.checks!['externalService:uptime']![0]).toHaveProperty('observedUnit', fakedBody.observedUnit)
    })

    test('When doing a test with Uptime check and it throws an error', async () => {
        const errorMessage = 'error for uptime check'
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        uptime: {
                            query: async () => {
                                throw new Error(errorMessage)
                            }
                        }
                    }
                }
            }
        })

        // Then the repsonse should have uptime checks property
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty('externalService:uptime')
        expect(result.body.checks!['externalService:uptime']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:uptime']![0]).toHaveProperty('output', errorMessage)
        expect(result.body.checks!['externalService:uptime']![0]).toHaveProperty('status', HealthcheckStatus.fail)
    })

    test('When doing a test with Utilization check', async () => {
        const fakedBody: UtilizationCheckResponse = {
            observedUnit: 'percent',
            observedValue: 50
        }

        spyOn(global, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify(fakedBody)
        ));
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        utilization: {
                            query: async () => {
                                const query = await fetch('http://fake.be')
                                const resp = await query.json()

                                return resp as UptimeCheckResponse
                            }
                        }
                    }
                }
            }
        })

        // Then the repsonse should have utilization check property
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty('externalService:utilization')
        expect(result.body.checks!['externalService:utilization']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:utilization']![0]).toHaveProperty('observedValue', fakedBody.observedValue)
        expect(result.body.checks!['externalService:utilization']![0]).toHaveProperty('observedUnit', fakedBody.observedUnit)
    })

    test('When doing a test with Utilization check and it throws an error', async () => {
        const errorMessage = 'error for utilization check'
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        utilization: {
                            query: async () => {
                                throw new Error(errorMessage)
                            }
                        }
                    }
                }
            }
        })

        // Then the repsonse should have utilization check property
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty('externalService:utilization')
        expect(result.body.checks!['externalService:utilization']).toBeArrayOfSize(1)
        expect(result.body.checks!['externalService:utilization']![0]).toHaveProperty('output', errorMessage)
        expect(result.body.checks!['externalService:utilization']![0]).toHaveProperty('status', HealthcheckStatus.fail)
    })
    
    test('When doing a test with check with thresholds but over the limit for fail', async () => {
        const fakedBody: UtilizationCheckResponse = {
            observedUnit: 'percent',
            observedValue: 50
        }
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        utilization: {
                            query: async () => {
                                await wait(2000)
                                return fakedBody
                            },
                            thresholds: {
                                fail: 500,
                                warn: 1000
                            },
                        }
                    }
                }
            }
        })

        // Then the response status should be fail if it's over fail thresholds
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body).toHaveProperty('status')
        expect(result.body.status).toEqual(HealthcheckStatus.fail)
    })
    
    test('When doing a test with check with thresholds but over the limit for warn', async () => {
        const fakedBody: UtilizationCheckResponse = {
            observedUnit: 'percent',
            observedValue: 50
        }
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        utilization: {
                            query: async () => {
                                await wait(600)
                                return fakedBody
                            },
                            thresholds: {
                                fail: 1500,
                                warn: 500
                            },
                        }
                    }
                }
            }
        })

        // Then the response status should be warn
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body).toHaveProperty('status')
        expect(result.body.checks!['externalService:utilization']![0]!.status).toEqual(HealthcheckStatus.warn)
    })

    test('When doing a test with custom checks', async () => {
        const fakedBody: GenericCheckQueryResponse = {
            observedUnit: 'customUnit',
            observedValue: 50
        }

        const customMetricName = 'customizedCheck'
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        [customMetricName]: {
                            query: async () => {
                                return fakedBody
                            },
                            thresholds: {
                                fail: 500,
                                warn: 1000
                            },
                        }
                    }
                }
            }
        })

        // Then the response should have metric key with the response
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty(`externalService:${customMetricName}`)
        expect(result.body.checks![`externalService:${customMetricName}`]).toBeArrayOfSize(1)
        expect(result.body.checks![`externalService:${customMetricName}`]![0]).toHaveProperty('observedValue', fakedBody.observedValue)
        expect(result.body.checks![`externalService:${customMetricName}`]![0]).toHaveProperty('observedUnit', fakedBody.observedUnit)
    })

    test('When doing a test with custom checks and it throws an error', async () => {
        const errorMessage = 'error for generic check'

        const customMetricName = 'customizedCheck'
    
        const result = await runChecks({
            description,
            externalServiceMetrics: {
                externalService: {
                    componentType: 'component',
                    metrics: {
                        [customMetricName]: {
                            query: async () => {
                                throw new Error(errorMessage)
                            },
                            thresholds: {
                                fail: 500,
                                warn: 1000
                            },
                        }
                    }
                }
            }
        })

        // Then the response should have metric key with the response
        expect(result).toHaveProperty('body')
        expect(result.body).toHaveProperty('checks')
        expect(result.body.checks).toHaveProperty(`externalService:${customMetricName}`)
        expect(result.body.checks![`externalService:${customMetricName}`]).toBeArrayOfSize(1)
        expect(result.body.checks![`externalService:${customMetricName}`]![0]).toHaveProperty('output', errorMessage)
        expect(result.body.checks![`externalService:${customMetricName}`]![0]).toHaveProperty('status', HealthcheckStatus.fail)
    })

    test('When doing a test with a specified cache value', async () => {
        const cacheValue = 5000
    
        const result = await runChecks({
            description,
            cache: cacheValue
        })

        // Then the response should have a cache header value in the http headers property
        expect(result).toHaveProperty('http')
        expect(result.http).toHaveProperty('headers')
        expect(result.http.headers.get('Cache-Control')).toEqual(`max-age=${cacheValue}`)
    })
})