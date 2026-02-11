<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <NuxtLink to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1>Admin Login</h1>
        <span class="badge">NeoAI</span>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter admin username"
            autocomplete="username"
            :disabled="submitting"
            required
          />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter admin password"
            autocomplete="current-password"
            :disabled="submitting"
            required
          />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="login-btn" :disabled="submitting || !username || !password">
          <span v-if="submitting" class="spinner"></span>
          {{ submitting ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

// If already authenticated, redirect to admin
onMounted(() => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    navigateTo('/admin')
  }
})

async function handleLogin() {
  error.value = ''
  submitting.value = true

  try {
    const data = await $fetch<{ success: boolean; token: string }>('/api/admin/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })

    if (data.token) {
      localStorage.setItem('admin_token', data.token)
      navigateTo('/admin')
    }
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    if (status === 401) {
      error.value = 'Invalid credentials'
    } else if (status === 500) {
      error.value = 'Server error — admin credentials may not be configured'
    } else {
      error.value = err?.data?.message || 'Login failed'
    }
  }

  submitting.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  padding: 2rem;
}

.login-header {
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

.login-header h1 {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-size: 0.65rem;
  color: #555;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.75rem;
  color: #555;
  font-weight: 500;
}

.field input {
  padding: 0.6rem 0.75rem;
  background: #000;
  border: 1px solid #1a1a1a;
  border-radius: 0.5rem;
  color: #ccc;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #333;
}

.field input::placeholder {
  color: #333;
}

.field input:disabled {
  opacity: 0.5;
}

.error-msg {
  color: #f87171;
  font-size: 0.8rem;
  margin: 0;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  background: #fff;
  border: none;
  border-radius: 0.5rem;
  color: #000;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #333;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
