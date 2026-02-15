/**
 * Dodo Payments – checkout session (POST).
 * Body: { product_cart: [{ product_id, quantity }], customer: { email, name }, return_url }.
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
    type: 'session',
  })

  return handler(event)
})
