# @kravc/dos

**DOS** (Document Operation Service) — convention-based, opinionated library for building API-driven serverless services. Inspired by Ruby on Rails.

## Installation

```bash
npm install @kravc/dos
```

## Quick Start

1. **Define a Document** — extend `MemoryDocument` and set a schema (YAML):

   See [`example/documents/Profile/`](example/documents/Profile/) — `Profile.ts`, `Profile.yaml`

2. **Define Operations** — use `Create`, `Read`, `Update`, `Delete`, `Index`:

   See [`example/operations/Profile/`](example/operations/Profile/) — full CRUD example

3. **Compose a Service** — pass modules and options:

   See [`example/index.ts`](example/index.ts)

## Run the Example

```bash
npm i --save-dev @kravc/http
npx http ./example/index.ts
```

Then open `http://localhost:3000` (Swagger UI) or `http://localhost:3000/Spec` (OpenAPI JSON).

## API Overview

| Concept | Purpose |
|---------|---------|
| **Document** | Data model with schema validation, default attributes (id, createdAt, updatedAt), lifecycle hooks |
| **Operation** | API endpoint: `Create`, `Read`, `Update`, `Delete`, `Index` + security, validation, errors |
| **Service** | Orchestrates operations, generates OpenAPI spec, handles HTTP/serverless requests |

## Learn More

- **Example service** — [`example/`](example/) — Profile CRUD with JWT/auth, Health endpoint
- **Tests** — [`src/**/__tests__/`](src/) — behavior and API surface for each module:
  - `Document/__tests__/MemoryDocument.test.ts` — document CRUD
  - `Operation/operations/__tests__/*.test.ts` — Create, Read, Update, Delete, Index
  - `Operation/security/__tests__/JwtAuthorization.test.ts`, `LambdaAuthorization.test.ts` — auth
  - `Service/__tests__/Service.test.ts` — request processing, validation, spec, errors

## License

ISC

---

Revision: February 11, 2026<br/>
By: Alex Kravets (@alexkravets)
