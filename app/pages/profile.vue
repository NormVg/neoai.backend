<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="profile-header">
        <NuxtLink to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1>Profile</h1>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Username</span>
          <span class="info-value">{{ userInfo?.username || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Member since</span>
          <span class="info-value">{{ formattedDate }}</span>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { userInfo, clearToken, loadToken } = useUserAuth()

onMounted(() => {
  loadToken()
})

const formattedDate = computed(() => {
  if (!userInfo.value?.createdAt) return '—'
  return new Date(userInfo.value.createdAt).toLocaleDateString('en-US', {
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
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #000;
  z-index: 100;
}

.profile-card {
  width: 100%;
  max-width: 380px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  color: #666;
  transition: all 0.2s;
}

.back-link:hover {
  background: #111;
  color: #fff;
}

.profile-header h1 {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Info section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid #1a1a1a;
}

.info-row:first-child {
  border-top: 1px solid #1a1a1a;
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
</style>
