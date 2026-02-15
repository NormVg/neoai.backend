/**
 * Dodo Payments – static checkout (GET).
 * Query: productId (required), optional: email, fullName, quantity, etc.
 * Returns { checkout_url }.
 */
export default defineEventHandler((event) => {
  const {
    private: { bearerToken, environment, returnUrl },
  } = useRuntimeConfig()

  const handler = checkoutHandler({
    bearerToken,
    environment,
    returnUrl,
  })

  return handler(event)
})
