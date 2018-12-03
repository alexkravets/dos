# Common Service

Architecture:
=============

### TRANSPORT

**HTTP Server**
 - Receives HTTP(s) requests
 - Reads stream into body string
 - Passes request to operation router for execution
 - Gets string result and status code from router
 - Sends response to client

### EXECUTION

**Router**
 - Auto-responds to OPTIONS / CORS requests
 - Injects CORS headers into response
 - Extacts operationId from URL
 - Parses request URL parameters into query object
 - Parses request body into mutation object
 - Matches operation to request
 - Executes operation
 - Stringify non-string result
 - Returns operation execution result

**Operation**
 - Normalizes parameters into query and mutation
 - Sets operation context based on request
 - Normalizes header names to lowercase
 - Authorizes request based on operation security configuration/implementation
 - Validates parameters based on input schema
 - Executes before action
 - Executes action
 - Executes after action
 - Wraps unhandled exceptions into OperationError
 - Normalizes results JSON object
 - Validates result based on output schema
 - Returns statusCode, headers and result to router
