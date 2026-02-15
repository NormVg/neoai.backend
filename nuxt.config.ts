// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@dodopayments/nuxt'],

  nitro: {
    preset: 'vercel',
  },

  runtimeConfig: {
    // Fallback API keys from env (used only if no keys in DB)
    googleApiKey1: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    googleApiKey2: process.env.GOOGLE_GENERATIVE_AI_API_KEY_2 || '',
    googleApiKey3: process.env.GOOGLE_GENERATIVE_AI_API_KEY_3 || '',
    googleApiKey4: process.env.GOOGLE_GENERATIVE_AI_API_KEY_4 || '',
    googleApiKey5: process.env.GOOGLE_GENERATIVE_AI_API_KEY_5 || '',
    databaseUrl: process.env.DATABASE_URL || '',

    // Admin credentials (single hardcoded admin account)
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || '',

    // JWT secret for signing auth tokens
    jwtSecret: process.env.JWT_SECRET || '',

    // Dodo Payments (server-only; module expects config.private)
    private: {
      bearerToken: process.env.NUXT_PRIVATE_BEARER_TOKEN || '',
      webhookKey: process.env.NUXT_PRIVATE_WEBHOOK_KEY || '',
      environment: process.env.NUXT_PRIVATE_ENVIRONMENT || 'test_mode',
      returnUrl: process.env.NUXT_PRIVATE_RETURNURL || '',
      productId2Weeks: process.env.NUXT_PRIVATE_PRODUCT_2WEEKS || '',
      productIdLifetime: process.env.NUXT_PRIVATE_PRODUCT_LIFETIME || '',
    },

    public: {
      // Product IDs for pricing page (build checkout links)
      productId2Weeks: process.env.NUXT_PUBLIC_PRODUCT_2WEEKS || '',
      productIdLifetime: process.env.NUXT_PUBLIC_PRODUCT_LIFETIME || '',
      paymentReturnUrl: process.env.NUXT_PUBLIC_PAYMENT_RETURN_URL || '',
    },
  },
})
