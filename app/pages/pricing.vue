<template>
  <div class="pricing-page">
    <header class="page-header">
      <NuxtLink to="/" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Home
      </NuxtLink>
      <NuxtLink v-if="isLoggedIn" to="/profile" class="nav-link nav-profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {{ username }}
      </NuxtLink>
      <NuxtLink v-else to="/login" class="nav-link nav-profile">Sign in</NuxtLink>
    </header>

    <div class="page-container">
      <div class="pricing-intro">
        <h1>Pricing</h1>
        <p class="subtitle">Choose the plan that works for you. Get full access to NeoAI on iamneo.</p>
        <p v-if="!isLoggedIn" class="signin-required">Sign in to purchase so your plan is linked to your account.</p>
      </div>

      <div class="plans">
        <div class="plan-card">
          <div class="plan-header">
            <span class="plan-name">2 Weeks</span>
            <div class="plan-price">
              <span class="currency">₹</span>
              <span class="amount">100</span>
            </div>
            <p class="plan-desc">Full access for 14 days</p>
          </div>
          <ul class="plan-features">
            <li>Instant solve & human typing</li>
            <li>MCQ solving</li>
            <li>All keyboard shortcuts</li>
            <li>Email support</li>
          </ul>
          <button
            type="button"
            class="plan-cta outline"
            :disabled="loading || !productId2Weeks || !isLoggedIn"
            @click="selectPlan('2weeks')"
          >
            {{ loading ? 'Redirecting…' : 'Get 2 weeks' }}
          </button>
        </div>

        <div class="plan-card featured">
          <div class="plan-badge">Best value</div>
          <div class="plan-header">
            <span class="plan-name">Lifetime</span>
            <div class="plan-price">
              <span class="currency">₹</span>
              <span class="amount">555</span>
            </div>
            <p class="plan-desc">One-time payment, use forever</p>
          </div>
          <ul class="plan-features">
            <li>Everything in 2 Weeks</li>
            <li>Lifetime access</li>
            <li>Future updates included</li>
            <li>Priority support</li>
          </ul>
          <button
            type="button"
            class="plan-cta primary"
            :disabled="loading || !productIdLifetime || !isLoggedIn"
            @click="selectPlan('lifetime')"
          >
            {{ loading ? 'Redirecting…' : 'Get lifetime' }}
          </button>
        </div>
      </div>

      <p v-if="error" class="pricing-error">{{ error }}</p>
      <p v-if="!isLoggedIn && (productId2Weeks || productIdLifetime)" class="pricing-note">
        Sign in to purchase and link your plan to your account.
      </p>
      <p v-else-if="!productId2Weeks && !productIdLifetime" class="pricing-note">
        Payment products are being configured. Contact support for early access.
      </p>
      <p v-else class="pricing-note">All prices in Indian Rupees (INR). Secure checkout by Dodo Payments.</p>

      <p class="support-line">
        Questions? <a href="mailto:support@neoai.projectkit.shop">support@neoai.projectkit.shop</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { userInfo, isLoggedIn, loadToken } = useUserAuth()
const config = useRuntimeConfig()
const loading = ref(false)
const error = ref('')

const productId2Weeks = computed(() => (config.public as any).productId2Weeks || '')
const productIdLifetime = computed(() => (config.public as any).productIdLifetime || '')
const returnUrl = computed(() => (config.public as any).paymentReturnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/pricing?success=1` : ''))

onMounted(() => {
  loadToken()
})

const username = computed(() => userInfo.value?.username || 'Profile')

async function selectPlan(plan: '2weeks' | 'lifetime') {
  const productId = plan === '2weeks' ? productId2Weeks.value : productIdLifetime.value
  if (!productId) return
  error.value = ''
  loading.value = true
  try {
    const username = userInfo.value?.username || 'Customer'
    const email = (userInfo.value as any)?.email

    const customer: Record<string, string> = {
      name: username,
      email: email || `${username}@demo.neoai.projectkit.shop`,
    }

    const body: Record<string, unknown> = {
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer,
      return_url: returnUrl.value,
    }
    if (userInfo.value?.id) {
      body.metadata = { user_id: userInfo.value.id, plan }
    }

    // console.log('[Frontend Debug] Sending Checkout Payload:', JSON.stringify(body, null, 2))
    const res = await $fetch<{ checkout_url: string }>('/api/checkout', {
      method: 'POST',
      body,
    })
    if (res?.checkout_url) {
      window.location.href = res.checkout_url
    } else {
      error.value = 'Could not start checkout'
      loading.value = false
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Checkout failed'
    loading.value = false
  }
}
</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
  background: #000;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #1a1a1a;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  color: #888;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #fff;
  background: #111;
}

.page-container {
  padding: 2rem 1.5rem;
  max-width: 640px;
  margin: 0 auto;
}

.pricing-intro {
  text-align: center;
  margin-bottom: 2.5rem;
}

.pricing-intro h1 {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

.signin-required {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #888;
}

.plans {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 520px) {
  .plans {
    grid-template-columns: 1fr;
  }
}

.plan-card {
  position: relative;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.plan-card.featured {
  border-color: #333;
  background: #0d0d0d;
}

.plan-badge {
  position: absolute;
  top: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.2rem 0.6rem;
  background: #fff;
  color: #000;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
}

.plan-header {
  margin-bottom: 1.25rem;
}

.plan-name {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
}

.plan-price {
  margin-top: 0.35rem;
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
}

.currency {
  font-size: 1rem;
  color: #888;
}

.amount {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.plan-desc {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  flex: 1;
}

.plan-features li {
  font-size: 0.8rem;
  color: #888;
  padding: 0.35rem 0;
  padding-left: 1.25rem;
  position: relative;
}

.plan-features li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65rem;
  width: 4px;
  height: 4px;
  background: #444;
  border-radius: 50%;
}

.plan-cta {
  display: block;
  text-align: center;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: 0.5rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-cta.outline {
  background: transparent;
  border: 1px solid #333;
  color: #ccc;
}

.plan-cta.outline:hover {
  background: #111;
  border-color: #444;
  color: #fff;
}

.plan-cta.primary {
  background: #fff;
  border: none;
  color: #000;
}

.plan-cta.primary:hover {
  background: #e5e5e5;
}

.plan-cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pricing-error {
  text-align: center;
  font-size: 0.85rem;
  color: #f87171;
  margin-bottom: 0.5rem;
}

.pricing-note {
  text-align: center;
  font-size: 0.75rem;
  color: #444;
  margin-bottom: 1rem;
}

.support-line {
  text-align: center;
  font-size: 0.8rem;
  color: #555;
}

.support-line a {
  color: #888;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.support-line a:hover {
  color: #fff;
}
</style>
