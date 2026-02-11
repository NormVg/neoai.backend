/**
 * CORS middleware — handles preflight OPTIONS requests
 * and adds Access-Control headers to all responses.
 */
export default defineEventHandler((event) => {
  // Set CORS headers on every response
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  })

  // Handle preflight
  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }
})
