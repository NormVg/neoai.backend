<template>
  <div class="profile-page">
    <header class="page-header">
      <NuxtLink to="/" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Home
      </NuxtLink>
      <NuxtLink to="/pricing" class="nav-link">Pricing</NuxtLink>
    </header>

    <main class="profile-main">
      <div class="profile-content">
        <h1 class="profile-title">Profile</h1>

        <section class="info-section">
          <div class="info-row">
            <span class="info-label">Username</span>
            <span class="info-value">{{ userInfo?.username || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Member since</span>
            <span class="info-value">{{ formattedDate }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Current Plan</span>
            <span class="info-value plan-badge" :class="planClass">{{ planDisplay }}</span>
          </div>
          <div v-if="planExpires" class="info-row">
            <span class="info-label">Expires On</span>
            <span class="info-value">{{ planExpires }}</span>
          </div>
        </section>

        <button class="logout-btn" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>

        <p class="support-line">
          Support: <a href="mailto:support@neoai.projectkit.shop">support@neoai.projectkit.shop</a>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { userInfo, clearToken, loadToken } = useUserAuth()

onMounted(async () => {
  loadToken()
  try {
    // Refresh user data to get latest plan status
    const data = await $fetch<any>('/api/auth/me')
    console.log('[Profile] /api/auth/me response:', data)
    if (data) {
      // Update local state with fresh data
      userInfo.value = {
        ...userInfo.value!,
        plan: data.plan,
        planExpiresAt: data.planExpiresAt
      }
    }
  } catch (e) {
    // If auth fails, handleLogout will be called by user interaction or middleware
  }
})

const formattedDate = computed(() => {
  if (!userInfo.value?.createdAt) return '—'
  return new Date(userInfo.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const planDisplay = computed(() => {
  const plan = userInfo.value?.plan
  if (plan === 'lifetime') return 'Lifetime'
  if (plan === '2weeks') return '2 Weeks'
  return 'Free'
})

const planClass = computed(() => {
  return userInfo.value?.plan === 'free' ? 'plan-free' : 'plan-paid'
})

const planExpires = computed(() => {
  if (userInfo.value?.plan === 'lifetime') return 'Never'
  if (!userInfo.value?.planExpiresAt) return null
  return new Date(userInfo.value.planExpiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function handleLogout() {
  clearToken()
  navigateTo('/', { replace: true })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #000;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.profile-main {
  padding: 2rem 1.5rem;
  max-width: 560px;
  margin: 0 auto;
}

.profile-content {
  text-align: left;
}

.profile-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 1.5rem;
  padding: 0 0 0.5rem 0;
  border-bottom: 1px solid #1a1a1a;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #1a1a1a;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.8rem;
  color: #555;
  font-weight: 500;
}

.info-value {
  font-size: 0.85rem;
  color: #ccc;
}

/* Logout */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem;
  background: transparent;
  border: 1px solid #333;
  border-radius: 0.5rem;
  color: #888;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #1a1a1a;
  color: #fff;
  border-color: #444;
}

.support-line {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #1a1a1a;
  font-size: 0.75rem;
  color: #555;
  text-align: center;
}

.support-line a {
  color: #888;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.support-line a:hover {
  color: #fff;
}

.plan-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.plan-free {
  background: #1a1a1a;
  color: #888;
}

.plan-paid {
  background: #fff;
  color: #000;
}
</style>
