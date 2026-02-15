/**
 * Dodo Payments – checkout session (POST).
 * Body: { product_cart: [{ product_id, quantity }], customer: { email, name }, return_url }.
 * Returns { checkout_url }.
 */
export default defineEventHandler(async (event) => {
  const {
    private: { bearerToken, environment, returnUrl },
  } = useRuntimeConfig()

  /*
  const body = await readBody(event)
  console.log('[Checkout Debug] Body:', JSON.stringify(body, null, 2))
  */


  const handler = checkoutHandler({
    bearerToken,
    environment,
    returnUrl,
    type: 'session',
  })

  return handler(event)
})
