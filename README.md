# @kravc/dos

**DOS** (`D`document `O`peration `S`ervice) — convention-based, easy-to-use library for building API-driven serverless services. Inspired by **Ruby on Rails**.

## Content

- [Usage](#usage)
  - [1. Define a Document](#1-define-a-document)
  - [2. Create a Schema](#2-create-a-schema)
  - [3. Create Operations](#3-create-operations)
  - [4. Initialize the Service](#4-initialize-the-service)
  - [5. Making Requests](#5-making-requests)
  - [6. Accessing the OpenAPI Specification](#6-accessing-the-openapi-specification)
- [Document](#document)
  - [Component](#component)
  - [Schema](#schema)
  - [Attributes](#attributes)
  - [Default Attributes](#default-attributes)
  - [Methods](#methods)
    - [Static Methods (Class-level operations)](#static-methods-class-level-operations)
    - [Instance Methods](#instance-methods)
    - [Lifecycle Hooks](#lifecycle-hooks)
  - [Storage](#storage)
- [Operation](#operation)
  - [Base Operations](#base-operations)
  - [Query Schema](#query-schema)
  - [Mutation Schema](#mutation-schema)
  - [Output Schema](#output-schema)
  - [Before, Action, After](#before-action-after)
  - [Errors](#errors)
  - [Security](#security)
  - [Default Pagination Interface](#default-pagination-interface)
  - [Default Update Interface](#default-update-interface)
  - [Activities](#activities)
- [Service](#service)
  - [Specification](#specification)
  - [Parameters Validation](#parameters-validation)
  - [Execution Context](#execution-context)
  - [Identity](#identity)
  - [Output Validation](#output-validation)
  - [Errors](#errors-1)
  - [HTTP](#http)
  - [Kafka](#kafka)

## Usage

This section provides a complete example of building an API service with DOS. We'll create a Profile service with full CRUD operations.

### 1. Define a Document

First, create a Document class that represents your data model:

```javascript
// Profile.js
const { Document } = require('@kravc/dos')

class Profile extends Document {}

module.exports = Profile
```

### 2. Create a Schema

Define the schema for your document (typically in a YAML file):

```yaml
# Profile.yaml
id:
  required: true

name:
  type: string
  required: true

email:
  type: string
  format: email
  required: true
```

### 3. Create Operations

Define operations for each CRUD action:

```javascript
// CreateProfile.js
const { Create } = require('@kravc/dos')
const Profile = require('./Profile')
const JwtAuthorization = require('@kravc/dos/security/JwtAuthorization')

class CreateProfile extends Create(Profile) {
  static get tags() {
    return ['Profiles']
  }

  static get security() {
    return [
      JwtAuthorization.createRequirement({
        publicKey: process.env.PUBLIC_KEY,
        algorithm: 'RS256'
      })
    ]
  }
}

module.exports = CreateProfile
```

```javascript
// ReadProfile.js
const { Read } = require('@kravc/dos')
const Profile = require('./Profile')

class ReadProfile extends Read(Profile) {
  static get query() {
    return {
      id: {
        description: 'Profile ID',
        required: true,
        example: 'Profile_01ARZ3NDEKTSV4RRFFQ69G5FAV'
      }
    }
  }
}

module.exports = ReadProfile
```

```javascript
// UpdateProfile.js
const { Update } = require('@kravc/dos')
const Profile = require('./Profile')

class UpdateProfile extends Update(Profile) {}

module.exports = UpdateProfile
```

```javascript
// DeleteProfile.js
const { Delete } = require('@kravc/dos')
const Profile = require('./Profile')

class DeleteProfile extends Delete(Profile) {}

module.exports = DeleteProfile
```

```javascript
// IndexProfiles.js
const { Index } = require('@kravc/dos')
const Profile = require('./Profile')

class IndexProfiles extends Index(Profile) {}

module.exports = IndexProfiles
```

### 4. Initialize the Service

Create a Service instance that brings together all your operations:

```javascript
// index.js
const { Service, handler } = require('@kravc/dos')
const Profile = require('./Profile')
const CreateProfile = require('./CreateProfile')
const ReadProfile = require('./ReadProfile')
const UpdateProfile = require('./UpdateProfile')
const DeleteProfile = require('./DeleteProfile')
const IndexProfiles = require('./IndexProfiles')

const modules = [
  Profile,
  CreateProfile,
  ReadProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfiles
]

const service = new Service(modules, {
  url: 'https://api.example.com/',
  path: `${process.cwd()}/src`
})

// Export handler for serverless platforms
exports.handler = handler(service)
```

### 5. Making Requests

Once deployed, you can make HTTP requests to your service:

**Create a Profile:**
```bash
POST /CreateProfile
Content-Type: application/json
Authorization: Bearer <token>

{
  "mutation": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Read a Profile:**
```bash
GET /ReadProfile?id=Profile_01ARZ3NDEKTSV4RRFFQ69G5FAV
Authorization: Bearer <token>
```

**Update a Profile:**
```bash
PATCH /UpdateProfile?id=Profile_01ARZ3NDEKTSV4RRFFQ69G5FAV
Content-Type: application/json
Authorization: Bearer <token>

{
  "mutation": {
    "name": "Jane Doe"
  }
}
```

**Delete a Profile:**
```bash
DELETE /DeleteProfile?id=Profile_01ARZ3NDEKTSV4RRFFQ69G5FAV
Authorization: Bearer <token>
```

**List Profiles:**
```bash
GET /IndexProfiles?limit=20&sort=desc
Authorization: Bearer <token>
```

### 6. Accessing the OpenAPI Specification

The service automatically generates an OpenAPI 2.0 specification:

```bash
GET /Spec
```

This returns the complete API specification that can be used with Swagger UI or other OpenAPI tools.

## Document

Document is the core class for modeling data entities. It extends Component and provides CRUD operations with automatic validation, timestamps, and identity tracking.

### Component

Every Document is a Component, which provides:
- **Component ID**: The class name (via `Component.id`) used to identify the component type
- **Context**: Execution context passed to each document instance, containing validator, identity, and other runtime information
- **Schema Validation**: Built-in validation using the component's schema via `validate()`
- **JSON Serialization**: Automatic conversion via `toJSON()` method that returns the document attributes

```javascript
class Profile extends Document {}

// Component ID is automatically set to "Profile"
Profile.id  // => "Profile"
```

### Schema

Documents use schemas for validation and normalization. The schema is set as a class property and is automatically extended with default attributes.

```javascript
class Profile extends Document {}

// Set schema (typically from a YAML file)
Profile.schema = loadSchema('Profile.yaml')

// Schema is extended with default attributes (id, createdAt, updatedAt, etc.)
Profile.schema        // Extended schema (includes defaults)
Profile.bodySchema    // Original schema (without defaults)
```

When a schema is set on a Document, it's automatically extended with default attributes to create the full schema, while the original body schema is preserved separately.

### Attributes

Attributes are the data fields of a document instance. They are stored in the `_attributes` property and accessed via the `attributes` getter.

```javascript
const profile = new Profile(context, {
  id: 'profile_abc123',
  name: 'John Doe',
  email: 'john@example.com'
})

profile.attributes  // => { id: 'profile_abc123', name: 'John Doe', email: 'john@example.com' }
profile.id          // => 'profile_abc123'
```

Attributes are validated against the document's schema when using the `validate()` method or during CRUD operations.

### Default Attributes

Documents automatically include default schema attributes that are added to every schema:

- **`id`** (required): Unique identifier for the document. Automatically generated using ULID format with prefix (e.g., `Profile_01ARZ3NDEKTSV4RRFFQ69G5FAV`)
- **`createdAt`** (required): ISO 8601 timestamp when the document was created
- **`createdBy`**: ID of the user who created the document (from `context.identity.sub`)
- **`updatedAt`**: ISO 8601 timestamp when the document was last updated
- **`updatedBy`**: ID of the user who last updated the document (from `context.identity.sub`)

These attributes are automatically managed during create and update operations and cannot be directly mutated through mutation parameters.

### Methods

#### Static Methods (Class-level operations)

- **`create(context, query, mutation)`**: Create a new document. Automatically adds `id`, `createdAt`, and `createdBy`. Supports `beforeCreate` and `afterCreate` hooks.
- **`read(context, query, options)`**: Read a single document by query. Throws `DocumentNotFoundError` if not found.
- **`index(context, query, options)`**: List documents matching the query. Returns `{ objects, count, ...rest }`. Supports partition filtering.
- **`indexAll(context, query, options)`**: List all documents matching the query (alias for `index`).
- **`update(context, query, mutation, originalDocument)`**: Update a document. Automatically adds `updatedAt` and `updatedBy`. Supports `beforeUpdate` and `afterUpdate` hooks. Preserves `id`, `createdAt`, and `createdBy`.
- **`delete(context, query)`**: Delete a document. Supports `beforeDelete` and `afterDelete` hooks.
- **`createId(attributes)`**: Generate a unique ID for the document (format: `{prefix}_{ulid}`)
- **`reset()`**: Reset/clear the document storage (testing utility)

#### Instance Methods

- **`update(mutation, shouldMutate)`**: Update this document instance. If `shouldMutate` is `true`, updates the instance in-place.
- **`delete()`**: Delete this document instance.
- **`hasAttributeChanged(attributePath)`**: Check if an attribute changed during update (requires `originalDocument`).
- **`validate()`**: Validate the document attributes against its schema.
- **`toJSON()`**: Serialize the document to plain JSON (returns attributes).

#### Lifecycle Hooks

- **`beforeCreate(context, query, mutation)`**: Called before document creation
- **`afterCreate(context, query, mutation, document)`**: Called after document creation
- **`beforeUpdate(context, query, mutation)`**: Called before document update
- **`afterUpdate(context, query, mutation, document)`**: Called after document update
- **`beforeDelete(context, query, originalDocument)`**: Called before document deletion
- **`afterDelete(context, query, originalDocument)`**: Called after document deletion

### Storage

Documents use an in-memory storage system by default. The storage is implemented as a class-level `STORE` object indexed by document class name and document ID.

```javascript
// Storage structure
STORE = {
  Profile: {
    'profile_abc123': { /* document attributes */ },
    'profile_def456': { /* document attributes */ }
  },
  User: {
    'user_xyz789': { /* document attributes */ }
  }
}
```

To use a custom storage backend (e.g., database, DynamoDB, etc.), override the private static methods:
- **`_create(attributes)`**: Implement custom creation logic
- **`_read(query, options)`**: Implement custom read logic
- **`_index(query, options)`**: Implement custom indexing logic
- **`_update(query, mutation)`**: Implement custom update logic
- **`_delete(context, query)`**: Implement custom deletion logic

The public methods (`create`, `read`, `index`, `update`, `delete`) handle validation, timestamps, partitioning, and lifecycle hooks, then delegate to these private storage methods.

## Operation

Operations define the API endpoints for interacting with Documents. They encapsulate the business logic, validation, security, and lifecycle hooks for each operation type.

### Base Operations

Operations are created using factory functions that take a Component class and optional component action name. The library provides five base operation types:

- **`Create(Component, componentAction = 'create')`**: Creates a new document instance
- **`Read(Component, componentAction = 'read')`**: Retrieves a single document by ID
- **`Update(Component, componentAction = 'update')`**: Updates an existing document
- **`Delete(Component, componentAction = 'delete')`**: Deletes a document
- **`Index(Component, componentAction = 'index')`**: Lists documents with pagination support

```javascript
const { Create, Read, Update, Delete, Index } = require('@kravc/dos')
const Profile = require('./Profile')

// Create operation classes
class CreateProfile extends Create(Profile) {}
class ReadProfile extends Read(Profile) {}
class UpdateProfile extends Update(Profile) {}
class DeleteProfile extends Delete(Profile) {}
class IndexProfile extends Index(Profile) {}
```

Each operation automatically derives metadata (ID, summary, tags, schemas) from the Component class.

### Query Schema

The query schema defines the input parameters used to identify or filter documents. It's defined via the static `query` getter and becomes part of the operation's `inputSchema`.

```javascript
class ReadProfile extends Read(Profile) {
  static get query() {
    return {
      id: {
        description: 'Profile ID',
        required: true,
        example: 'PRO_1'
      }
    }
  }
}
```

**Default Query Schemas:**
- **Read/Update/Delete**: Automatically includes `id` (required) based on component name
- **Index**: Automatically includes pagination parameters (`limit`, `sort`, `exclusiveStartKey`)

The query schema is merged with the mutation schema (if present) to create the complete `inputSchema` for the operation.

### Mutation Schema

The mutation schema defines the data structure for creating or updating documents. It's automatically derived from the Component's `bodySchema` (or `schema` if `bodySchema` is not available).

```javascript
// Component defines bodySchema
Profile.bodySchema = loadSchema('Profile.yaml')  // { name: {}, email: {} }

// CREATE operation: Uses cloned schema (all fields as-is)
CreateProfile.mutationSchema  // => { name: {}, email: {} }

// UPDATE operation: Uses pure schema (all fields optional, removes defaults)
UpdateProfile.mutationSchema  // => { name: {}, email: {} } (all optional)
```

**Schema Transformation:**
- **CREATE**: Uses `bodySchema.clone()` - preserves all schema definitions
- **UPDATE**: Uses `bodySchema.pure()` - makes all fields optional and removes default values

The mutation schema is embedded in the input schema as a `mutation` property (required for CREATE/UPDATE operations).

### Output Schema

The output schema defines the structure of the operation's response. It's automatically derived from the Component's schema and wrapped in a `data` property.

```javascript
// Output schema for operations with Component
{
  data: {
    $ref: 'Profile',  // References Component.schema.id
    required: true
  }
}
```

**Special Cases:**
- **Delete**: Returns `null` output schema (204 No Content response)
- **Index**: Returns paginated output with `data` (array) and `pageInfo` object

The output schema is validated after the action executes to ensure the response conforms to the specification.

### Before, Action, After

Operations support three lifecycle hooks that are executed in sequence during the `exec()` method:

1. **`before(parameters)`**: Called before the action. Can modify parameters by returning a new parameter object, or return `undefined` to keep original parameters.

2. **`action(parameters)`**: The main operation logic. Receives normalized parameters and calls the Component's action method (e.g., `Component.create()`, `Component.read()`). Returns `{ data }` object.

3. **`after(parameters, data)`**: Called after the action. Receives parameters and the data result. Can modify the result by returning a new value, or return `undefined` to keep original result.

```javascript
class CreateProfile extends Create(Profile) {
  async before(parameters) {
    // Pre-process parameters
    const { mutation } = parameters
    mutation.normalizedField = normalize(mutation.field)
    
    return parameters  // Return modified parameters, or undefined to keep original
  }

  async action(parameters) {
    // Default action calls Component.create(context, query, mutation)
    // Override if custom logic needed
    return super.action(parameters)
  }

  async after(parameters, data) {
    // Post-process result
    data.enriched = true
    
    return data  // Return modified data, or undefined to keep original
  }
}
```

The execution flow is: `before()` → `action()` → `after()`, with each hook able to modify the data passed to the next stage.

### Errors

Operations automatically collect errors from multiple sources:

1. **Security Errors**: Errors from all security requirements (UnauthorizedError, AccessDeniedError, etc.)
2. **Input Validation Errors**: `InvalidInputError` (400) and `InvalidParametersError` (400) if `inputSchema` is defined
3. **Output Validation Errors**: `InvalidOutputError` (500) if `outputSchema` is defined
4. **Operation-Specific Errors**: Each operation type adds component-specific errors:
   - **Create**: `DocumentExistsError` (422)
   - **Read/Update/Delete**: `DocumentNotFoundError` (404)
5. **Default Error**: `UnprocessibleConditionError` (422) - always included

```javascript
class CreateProfile extends Create(Profile) {
  static get errors() {
    return {
      ...super.errors,  // Includes base errors
      // Custom errors can be added here
      CustomError: {
        statusCode: 400,
        description: 'Custom error description'
      }
    }
  }
}
```

Errors are mapped to HTTP status codes and included in the OpenAPI specification. When an operation throws an error, the Service maps it to the appropriate status code using the error's `code` property.

### Security

Security is defined via the static `security` getter, which returns an array of security requirement objects. Each requirement object represents an OR condition, and within each object, properties represent AND conditions.

```javascript
class CreateProfile extends Create(Profile) {
  static get security() {
    const algorithm = 'RS256'
    
    const accessVerificationMethod = (context, { group }) => {
      const isAccessGranted = [ 'Administrators' ].includes(group)
      return [ isAccessGranted, 'Access denied' ]
    }
    
    const tokenVerificationMethod = (...args) => verifyToken(...args)
    
    return [
      // OR requirement 1: JWT with Admin access
      JwtAuthorization.createRequirement({
        publicKey,
        algorithm,
        tokenVerificationMethod,
        accessVerificationMethod
      }),
      // OR requirement 2: System authorization
      SystemAuthorization.createRequirement({
        accessVerificationMethod: verifySystemAccess
      })
    ]
  }
}
```

**Security Evaluation:**
- Operations with empty `security` array (`[]`) are public (no authorization required)
- Security requirements are evaluated as: `(req1 AND req2) OR (req3 AND req4)`
- First matching requirement grants access
- If no requirements match, an `UnauthorizedError` or `AccessDeniedError` is thrown

Security classes must implement a `verify(context)` method that returns `{ isAuthorized, error, ...rest }`. The `rest` properties are merged into the context as `context.identity`.

### Default Pagination Interface

The `Index` operation provides built-in pagination support with the following interface:

**Query Parameters:**
- **`limit`** (integer, default: 20): Maximum number of items to return
- **`sort`** (enum: 'asc' | 'desc', default: 'desc'): Sort direction
- **`exclusiveStartKey`** (string, optional): Pagination token to start from

**Output Structure:**
```javascript
{
  data: [ /* array of documents */ ],
  pageInfo: {
    count: 10,                    // Number of items in current page
    limit: 20,                    // Limit used
    sort: 'desc',                 // Sort direction used
    exclusiveStartKey: 'token1',  // Start key used (if any)
    lastEvaluatedKey: 'token2'    // Token for next page (if more results exist)
  }
}
```

**Customization:**
```javascript
class IndexProfile extends Index(Profile) {
  static get defaultLimit() {
    return 50  // Override default limit
  }
  
  static get defaultSort() {
    return 'asc'  // Override default sort
  }
  
  static get query() {
    return {
      ...super.query,  // Includes default pagination params
      // Add custom query parameters
      status: {
        enum: [ 'active', 'inactive' ],
        default: 'active'
      }
    }
  }
}
```

Pagination tokens (exclusiveStartKey/lastEvaluatedKey) are typically opaque strings that encode the position in the result set, allowing efficient cursor-based pagination.

### Default Update Interface

The Update operation uses a "pure" mutation schema that makes all fields optional and removes default values. This allows partial updates where only specified fields are modified.

```javascript
// Component bodySchema
Profile.bodySchema = {
  name: { required: true, default: 'Unknown' },
  email: { required: true },
  age: { type: 'integer' }
}

// Update mutation schema (pure)
UpdateProfile.mutationSchema = {
  name: {},                 // Optional, no default
  email: {},                // Optional
  age: { type: 'integer' }  // Optional
}
```

**Update Behavior:**
- Only fields present in the mutation are updated
- Fields not included remain unchanged
- The `id`, `createdAt`, and `createdBy` fields are automatically omitted from mutations
- `updatedAt` and `updatedBy` are automatically added by the Document class

**Example:**
```javascript
// Update only the name field
await UpdateProfile.exec({ id: 'profile_1', mutation: { name: 'New Name' } })

// Email and age remain unchanged
// updatedAt and updatedBy are automatically set
```

This interface follows the PATCH semantics where partial updates are the default behavior.

### Activities

Activities represent a potential extension point for operation lifecycle tracking and logging. While not currently implemented in the core library, the operation's lifecycle hooks (`before`, `action`, `after`) provide the foundation for implementing activity tracking.

Potential use cases for activities:
- **Audit Logging**: Track all operations performed with context (who, what, when, parameters)
- **Activity Feed**: Generate user-visible activity streams
- **Analytics**: Collect metrics on operation usage and performance
- **Notifications**: Trigger side effects based on operation completion

Activities could be implemented by:
- Extending the `after()` hook to record activities
- Adding an `activities` static getter to define which operations should be tracked
- Integrating with external services (logging, analytics, event streaming)

This is a placeholder for future functionality that could enhance observability and auditing capabilities.

## Service

Service is the central orchestrator that brings together Documents, Operations, and Schemas to create a complete API service. It handles request routing, validation, authorization, execution, and response generation.

### Specification

Service automatically generates an OpenAPI 2.0 (Swagger) specification from all registered operations and components. The specification is created during Service initialization and includes:

- **API Metadata**: Title and version from `package.json`
- **Base URL**: Derived from the `url` option (default: `http://localhost:3000/`)
- **Paths**: Each operation becomes a path (`/{OperationId}`) with its HTTP method
- **Schemas**: All component schemas, operation input/output schemas, and error schemas
- **Security Definitions**: Security schemes from operation requirements
- **Tags**: Automatically extracted from operation tags

```javascript
const { Service } = require('@kravc/dos')

const modules = [
  Profile,
  CreateProfile,
  ReadProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfile
]

const service = new Service(modules, {
  url: 'https://api.example.com/',
  path: `${ROOT_PATH}/src`
})

// Access the generated specification
service.spec        // OpenAPI 2.0 JSON specification
service.baseUrl     // 'https://api.example.com/'
service.basePath    // '/'
```

**Specification Endpoints:**
- **GET `/`**: Returns Swagger UI HTML (development mode) or 'healthy' (production)
- **GET `/Spec`**: Returns the full OpenAPI specification JSON (development) or minimal info (production)
- **GET `/Schemas.yaml`, `/Operations.yaml`, etc.**: Returns composer specification files (development only)

The specification is validated against the OpenAPI 2.0 schema during initialization to ensure correctness.

### Parameters Validation

All operation parameters are validated against the operation's `inputSchema` before execution. The validation process:

1. **Extracts Input**: Combines `context.query` and `context.mutation` into a single input object
2. **Normalizes Values**: Converts query string values, decodes URLs, parses JSON arrays in query strings
3. **Validates Schema**: Uses the operation's `inputSchema` to validate structure and types
4. **Handles UPDATE Special Case**: For UPDATE operations, empty values are nullified (to support partial updates)

```javascript
// Inside Service.process()
const parameters = this._getParameters(Operation.inputSchema, context, isUpdate)

// Validation errors throw InvalidInputError (400) or InvalidParametersError (400)
try {
  result = this._validator.validate(input, inputSchema.id, shouldNullifyEmptyValues)
} catch (validationError) {
  throw new InvalidInputError(validationError, context)
}
```

**Query Parameter Handling:**
- Query string parameters are automatically decoded
- JSON arrays in query strings are parsed: `?ids=["id1","id2"]` → `['id1', 'id2']`
- Body (mutation) is parsed as JSON if it's a string

**Validation Errors:**
- **InvalidInputError** (400): Schema validation failed (structure, types, required fields)
- **InvalidParametersError** (400): Syntax is correct but values are invalid (e.g., enum mismatch)

### Execution Context

The execution context is created from the incoming request and contains all information needed for operation execution. The context is built by `createContext()` helper:

```javascript
{
  // Request identification
  requestId: string,              // UUID generated or from requestContext
  operationId: string,            // Operation ID from path/method mapping
  httpMethod: string,             // Lowercase HTTP method (get, post, patch, delete)
  httpPath: string,               // Normalized path relative to basePath
  requestReceivedAt: string,      // ISO 8601 timestamp
  
  // Request data
  headers: object,                // Normalized (lowercase keys) request headers
  query: object,                  // Parsed query string parameters
  mutation: object,               // Parsed request body (for POST/PATCH)
  bodyJson: string,               // Raw JSON body (if provided)
  
  // Service infrastructure
  baseUrl: string,                // Service base URL
  validator: Validator,           // Schema validator instance
  logger: object,                 // Logger instance (from extraContext, default: console)
  
  // Security
  identity: object,               // Set by authorize() - contains authenticated user info
  
  // Custom context
  ...extraContext                 // Additional context passed to handler()
}
```

**Context Creation Flow:**
1. Extract or determine `operationId` from request path and HTTP method
2. Parse and normalize headers (all lowercase keys)
3. Extract query parameters from URL or `queryStringParameters`
4. Parse request body as JSON (if present)
5. Merge with `extraContext` provided to handler

The context is passed to all operations and is available throughout the execution lifecycle.

### Identity

Identity is established through the authorization process and represents the authenticated entity making the request. The `identity` object is added to the context after successful authorization:

```javascript
// Inside Service.process()
context.identity = await authorize(Operation, context)
```

**Identity Structure:**
The identity object is built from the security requirement's `verify()` method return value. All properties except `isAuthorized` and `error` are merged into the context as `identity`:

```javascript
// Example: JWT Authorization
const { isAuthorized, error, sub, group, permissions } = await security.verify(context)

// If authorized:
context.identity = {
  sub: 'user_123',
  group: 'Administrators',
  permissions: ['read', 'write']
}
```

**Identity Usage:**
- Document operations automatically use `identity.sub` for `createdBy` and `updatedBy`
- Operations can access `context.identity` to make authorization decisions
- Custom authorization logic can read identity properties

**No Identity (Public Operations):**
Operations with empty `security` array (`[]`) skip authorization and `context.identity` remains undefined. Document operations default to `'SYSTEM'` for identity-related fields.

### Output Validation

Operation outputs are validated against the operation's `outputSchema` after successful execution. This ensures the response conforms to the specification:

```javascript
// Inside Service.process()
response.output = this._getOutput(Operation.outputSchema, response.result)

// Validation throws InvalidOutputError (500) if output doesn't match schema
try {
  output = this._validator.validate(object, outputSchema.id, false, true)
} catch (validationError) {
  throw new InvalidOutputError(object, validationError)
}
```

**Validation Behavior:**
- Validates the entire output structure against the `outputSchema`
- Throws `InvalidOutputError` (500) if validation fails (indicates a bug in the operation)
- Operations without `outputSchema` (e.g., Delete) return `null` output (204 No Content)

**Output Structure:**
Operations should return `{ data, headers, multiValueHeaders }` from their `exec()` method:
- **data**: The main response data (validated against `outputSchema`)
- **headers**: Standard HTTP headers object
- **multiValueHeaders**: Multi-value headers (for some serverless platforms)

### Errors

Service provides comprehensive error handling that maps errors to appropriate HTTP status codes and formats error responses consistently:

**Error Processing Flow:**
1. Errors thrown during execution are caught by `Service.process()`
2. Error's `code` property is used to look up status code in `Operation.errors`
3. If no matching error definition, status code 500 is used
4. Error is wrapped in `OperationError` component for consistent formatting
5. `OperationError` is validated against its schema before returning

```javascript
catch (error) {
  const { code } = error
  const errorStatusCode = Operation
    ? get(Operation.errors, `${code}.statusCode`, 500)
    : get(error, 'statusCode', 500)
  
  response.output = new OperationError(context, errorStatusCode, error).validate()
  response.statusCode = errorStatusCode
}
```

**Error Response Format:**
```javascript
{
  error: {
    code: string,                 // Error code (e.g., 'DocumentNotFoundError')
    message: string,              // Human-readable error message
    statusCode: number,           // HTTP status code
    validationErrors?: object     // Schema validation errors (if applicable)
  }
}
```

**Error Types:**
- **400**: `InvalidInputError`, `InvalidParametersError`
- **401**: `UnauthorizedError` (from security)
- **403**: `AccessDeniedError` (from security)
- **404**: `DocumentNotFoundError`, `OperationNotFoundError`
- **422**: `DocumentExistsError`, `UnprocessibleConditionError`
- **500**: `InvalidOutputError`, `OperationError` (unexpected errors)

**Error Logging:**
- 500 errors are automatically logged with full context (masked for secrets)
- Other errors are not logged (expected business logic errors)
- Context includes: `query`, `mutation`, `identity`, `requestId`, `operationId`, `requestReceivedAt`

### HTTP

Service is designed to work with HTTP-based serverless platforms (AWS Lambda, Azure Functions, Google Cloud Functions, etc.). The `handler()` function creates a request handler that processes HTTP requests:

```javascript
const { Service, handler } = require('@kravc/dos')

const service = new Service(modules, { url: 'https://api.example.com/' })
exports.handler = handler(service)
```

**Request Format:**
The handler accepts requests in a standardized format that works across platforms:

```javascript
{
  // HTTP method (required)
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',  // or httpMethod
  
  // Path information (one of these)
  url: '/CreateProfile?id=123',      // Full URL
  path: '/CreateProfile',             // Path only
  
  // Query parameters (one of these)
  queryStringParameters: { id: '123' },
  // or parsed from url
  
  // Request body (for POST/PATCH)
  body: '{"name":"John"}',           // JSON string
  // or already parsed object
  
  // Headers
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  
  // Request context (optional)
  requestContext: {
    requestId: 'uuid-here'
  }
}
```

**Response Format:**
```javascript
{
  statusCode: number,              // HTTP status code (200, 201, 204, 400, etc.)
  body: string,                    // JSON stringified output (if present)
  headers: object,                 // HTTP headers (lowercase keys)
  multiValueHeaders: object        // Multi-value headers (if needed)
}
```

**HTTP Method Mapping:**
Operations are automatically mapped to HTTP methods:
- **CREATE** → `POST`
- **READ** → `GET`
- **UPDATE** → `PATCH`
- **DELETE** → `DELETE`
- **INDEX** → `GET`

**Path Structure:**
Each operation is exposed at `/{OperationId}` (e.g., `/CreateProfile`, `/ReadProfile`).

**Request Processing:**
1. `handler()` receives request
2. `createContext()` builds execution context
3. `specMiddleware()` handles special paths (`/`, `/Spec`, composer specs)
4. `logRequest()` logs request metadata
5. `service.process()` executes operation
6. Returns HTTP response

**CORS and Headers:**
Operations can set custom headers via `setHeader()`:
```javascript
async action(parameters) {
  this.setHeader('X-Custom-Header', 'value')
  return super.action(parameters)
}
```

Headers set by operations are included in the HTTP response.

### Kafka

Kafka integration is a planned feature for event-driven architectures. While not currently implemented in the core library, the Service architecture supports extension for Kafka message processing.

**Potential Implementation:**
The Service's `process(context)` method can be invoked directly with a context object, making it possible to create Kafka consumers that:

1. **Receive Messages**: Kafka consumer receives messages from topics
2. **Create Context**: Transform Kafka message into execution context format
3. **Process Operation**: Call `service.process(context)` with the operation context
4. **Handle Response**: Process the result (ack/nack message, publish to output topic, etc.)

**Kafka Context Structure:**
```javascript
{
  // Kafka-specific
  topic: string,
  partition: number,
  offset: number,
  key: string,
  
  // Standard context
  operationId: string,
  mutation: object,        // Message payload
  query: object,           // Message headers/metadata
  ...
}
```

**Event-Driven Patterns:**
- **Command Pattern**: Kafka messages trigger operations (Create, Update, Delete)
- **Event Sourcing**: Operations produce events that are published to Kafka
- **CQRS**: Separate read and write operations via Kafka topics
- **Saga Pattern**: Coordinate distributed transactions via Kafka events

This integration point allows the Service to participate in event-driven microservices architectures while maintaining the same operation, validation, and error handling logic.

---

Revision: January 9, 2026<br/>
By: Alex Kravets (@alexkravets)
