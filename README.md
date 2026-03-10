# healthcheck-utilities

TypeScript library for building standardized health check endpoints following the [Health Check Response Format for HTTP APIs](https://inadarei.github.io/rfc-healthcheck/) (`application/health+json`).

## Installation

```bash
bun add healthcheck-utilities
# or
npm install healthcheck-utilities
```

## Quick Start

```typescript
import { runChecks } from 'healthcheck-utilities'

// Minimal liveness check
const result = await runChecks({
    version: '1.0.0',
    description: 'My service'
})

// Use in any HTTP handler
return new Response(JSON.stringify(result.body), {
    status: result.http.status,
    headers: result.http.headers // sets Content-Type: application/health+json
})
```

## API

### `runChecks(options)`

Runs all configured health checks and returns a formatted response.

```typescript
const result = await runChecks({
    version?: string,
    description?: string,
    notes?: string[],
    releaseId?: string,
    serviceId?: string,
    links?: Record<string, string>,
    externalServiceMetrics?: Record<string, CheckReadinessMetricContent>,
    cache?: number  // adds Cache-Control: max-age=<n> header
})
```

**Returns:**
```typescript
{
    http: {
        status: number,   // always 200
        headers: Headers  // Content-Type: application/health+json
    },
    body: HealthcheckResponse  // ready to serialize
}
```

The overall `body.status` is `pass` unless any check returns `warn` (→ `warn`) or `fail` (→ `fail`).

### Metric checks

Each entry in `externalServiceMetrics` maps a service name to a `CheckReadinessMetricContent`:

```typescript
{
    componentType: 'component' | 'datastore' | 'system' | string,
    componentId?: string,
    affectedEndpoints?: string[],
    metrics: {
        responseTime?: ResponseTimeCheckRequest,
        connections?: ConnectionsCheckRequest,
        uptime?: UptimeCheckRequest,
        utilization?: UtilizationCheckRequest,
        [customKey: string]: GenericCheckRequest  // any custom metric
    }
}
```

Each metric requires a `query` function and an optional `thresholds` object:

```typescript
{
    query: () => Promise<{ observedValue: string | number, observedUnit: string }>,
    thresholds?: {
        warn: number,  // ms elapsed before the query resolves
        fail: number
    }
}
```

Thresholds are evaluated against the **wall-clock time** the `query` function takes to resolve, not against `observedValue`.

If `query` throws, the check is automatically marked as `fail` with the error message in `output`.

Result keys in `body.checks` follow the pattern `<serviceName>:<metricKey>`.

## Examples

### Readiness check with response time and threshold

```typescript
import { runChecks } from 'healthcheck-utilities'

const result = await runChecks({
    version: '2.0.0',
    description: 'Readiness check',
    externalServiceMetrics: {
        database: {
            componentType: 'datastore',
            metrics: {
                responseTime: {
                    query: async () => {
                        const start = performance.now()
                        await db.ping()
                        return {
                            observedUnit: 'ms',
                            observedValue: performance.now() - start
                        }
                    },
                    thresholds: { warn: 200, fail: 1000 }
                }
            }
        }
    }
})

// body.checks['database:responseTime'][0].status → 'pass' | 'warn' | 'fail'
```

### Multiple services

```typescript
const result = await runChecks({
    externalServiceMetrics: {
        keycloak: {
            componentType: 'component',
            metrics: {
                responseTime: {
                    query: async () => {
                        const t = performance.now()
                        await fetch('http://auth-service/health')
                        return { observedUnit: 'ms', observedValue: performance.now() - t }
                    }
                }
            }
        },
        redis: {
            componentType: 'datastore',
            metrics: {
                connections: {
                    query: async () => ({
                        observedUnit: 'connections',
                        observedValue: await redis.clientCount()
                    })
                }
            }
        }
    }
})
```

### Custom metric

```typescript
const result = await runChecks({
    externalServiceMetrics: {
        queue: {
            componentType: 'system',
            metrics: {
                pendingJobs: {
                    query: async () => ({
                        observedUnit: 'jobs',
                        observedValue: await queue.size()
                    }),
                    thresholds: { warn: 500, fail: 1000 }
                }
            }
        }
    }
})

// body.checks['queue:pendingJobs'][0]
```

### Next.js route handler

```typescript
// app/health/readiness/route.ts
import { runChecks } from 'healthcheck-utilities'
import { NextResponse } from 'next/server'

export async function GET() {
    const resp = await runChecks({
        version: '1.0.0',
        description: 'My Next.js app',
        externalServiceMetrics: { /* ... */ }
    })

    return NextResponse.json(resp.body, { status: resp.http.status })
}
```

### With cache header

```typescript
const result = await runChecks({
    description: 'Liveness',
    cache: 5000  // Cache-Control: max-age=5000
})
```

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `runChecks` | function | Main entry point |
| `HealthcheckStatus` | enum | `pass` \| `warn` \| `fail` |
| `HealthcheckError` | class | Custom error type |
| `HealthcheckResponse` | type | Full response body shape |

## Response format

```json
{
    "status": "pass",
    "version": "1.0.0",
    "description": "My service",
    "checks": {
        "database:responseTime": [{
            "componentType": "datastore",
            "status": "pass",
            "observedValue": 42,
            "observedUnit": "ms",
            "time": "2024-01-01T00:00:00.000Z"
        }]
    }
}
```

## Development

```bash
bun test
bun test --coverage --coverage-reporter=text
```
