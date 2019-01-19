# Common Service

**Composer**
 - Load all data schemas
 - Create schemas for all components
 - Create input, output schemas for all operations
 - Validate schemas
 - Initialize validator

**Router**
 - Auto-responds to OPTIONS / CORS requests
 - Injects CORS headers into response
 - Extacts operationId from URL
 - Parses request URL parameters into query object
 - Parses request body into mutation object
 - Matches operation for request
 - Executes operation
 - Stringify non-string result
 - Returns operation execution result

**Operation**
 - Sets operation context based on request
 - Normalizes parameters into query and mutation
 - Normalizes header names to lowercase
 - Authorizes request based on operation security
 - Validates input using input schema
 - Executes before action
 - Executes action
 - Executes after action
 - Validates output using output schema
 - Returns statusCode, headers and result to router
