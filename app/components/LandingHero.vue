<template>
  <div>
    <div class="top-links">
      <NuxtLink to="/pricing" class="signin-link">Pricing</NuxtLink>
      <NuxtLink v-if="isLoggedIn" to="/profile" class="signin-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {{ username }}
      </NuxtLink>
      <NuxtLink v-else to="/login" class="signin-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Sign in
      </NuxtLink>
    </div>

    <span class="badge">&#9679; Online</span>
    <h1>NeoAI</h1>
    <p class="subtitle">AI exam assistant for iamneo</p>
    <p class="tagline">Get the Chrome extension and use shortcuts on iamneo.</p>

    <div class="actions">
      <a v-if="hasActivePlan" href="https://github.com/NormVg/neoai.ext/releases/download/asd/neoai.ext.zip"
        class="btn btn-download" download>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download extension
      </a>
      <NuxtLink v-else to="/pricing" class="btn btn-download">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M2 12h20" />
        </svg>
        Get Access
      </NuxtLink>
      <TestButton />
    </div>

    <p class="support-tag">
      Support: <a href="mailto:support@neoai.projectkit.shop">support@neoai.projectkit.shop</a>
    </p>
  </div>
</template>

<script setup lang="ts">
const { userInfo, isLoggedIn, loadToken } = useUserAuth()

onMounted(() => {
  loadToken()
})

const username = computed(() => userInfo.value?.username || 'Profile')

const hasActivePlan = computed(() => {
  const plan = userInfo.value?.plan
  return plan === '2weeks' || plan === 'lifetime'
})
</script>

<style scoped>
.top-links {
  position: fixed;
  top: 1.25rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
}

.signin-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #333;
  border-radius: 0.5rem;
  color: #999;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.signin-link:hover {
  background: #fff;
  border-color: #fff;
  color: #000;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.tagline {
  color: #555;
  font-size: 0.875rem;
  margin-bottom: 2rem;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.support-tag {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #444;
}

.support-tag a {
  color: #666;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.support-tag a:hover {
  color: #fff;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.actions .btn,
.actions a.btn {
  width: 100%;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-download {
  background: #fff;
  color: #000;
  border: 1px solid transparent;
}

.btn-download:hover {
  background: #e5e5e5;
}

.btn svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
</style>
