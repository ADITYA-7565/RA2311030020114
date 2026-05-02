# Vehicle Maintenance Notification System Design

## Architecture

- **Scheduler** computes the optimal maintenance plan per depot.
- **Logging Middleware** centralizes auth and log delivery to the evaluation service.
- **Notification Backend** consumes scheduler output and dispatches notifications to users.
- **External APIs** provide depot and vehicle data, authentication, and log ingestion.

## Components

### Logging Middleware
- `auth.js` obtains the `access_token` from the evaluation service.
- `logger.js` sends structured log entries to `/logs` with `Bearer` auth.
- `register.js` registers the service and prints the returned credentials.

### Vehicle Maintenance Scheduler
- `api/fetch.js` retrieves depot and vehicle data using the shared token.
- `utils/knapsack.js` computes maximum impact scores using 0/1 knapsack.
- `services/scheduler.js` runs scheduling logic for each depot.
- `src/index.js` orchestrates auth, data retrieval, scheduling, and output.

### Notification Backend
- Receives events or scheduled payloads.
- Dispatches messages via email/SMS or other channels.
- Logs each processing step through the logging middleware.

## Message Queue

- Optional asynchronous buffer between scheduler and notification service.
- Scheduler publishes schedule events to a queue.
- Notification workers consume events, allowing decoupling and retries.
- Supports back-pressure and horizontal scaling.

## Scalability

- **Horizontal scaling**: multiple scheduler instances can run concurrently.
- **Stateless services**: all inputs come from external APIs and requests.
- **Queue-based delivery**: decouple compute from notification dispatch.
- **Shard by depot**: partition workload across workers.

## Retry Mechanism

- **Logging and auth retries** should use backoff for transient HTTP failures.
- **Fetch retries** for depot/vehicle endpoints protect against API instability.
- **Notification retries** should attempt delivery multiple times before failing.
- **Dead-letter handling** preserves failed events for investigation.
