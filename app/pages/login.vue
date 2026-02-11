<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <NuxtLink to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1>{{ isRegister ? 'Create Account' : 'Welcome back' }}</h1>
      </div>

      <div class="tabs">
        <button class="tab" :class="{ active: !isRegister }" @click="switchTo('login')">Sign in</button>
        <button class="tab" :class="{ active: isRegister }" @click="switchTo('register')">Register</button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            :placeholder="isRegister ? 'Choose a username' : 'Enter username'"
            autocomplete="username"
            :disabled="submitting"
            required
          />
          <span v-if="isRegister" class="hint">At least 3 characters, lowercase</span>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            :placeholder="isRegister ? 'Choose a password' : 'Enter password'"
            autocomplete="current-password"
            :disabled="submitting"
            required
          />
          <span v-if="isRegister" class="hint">At least 6 characters</span>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="submit-btn" :disabled="submitting || !username || !password">
          <span v-if="submitting" class="spinner"></span>
          {{ submitting ? (isRegister ? 'Creating...' : 'Signing in...') : (isRegister ? 'Create account' : 'Sign in') }}
        </button>
      </form>

      <p class="switch-text">
        {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
        <button class="switch-btn" @click="switchTo(isRegister ? 'login' : 'register')">
          {{ isRegister ? 'Sign in' : 'Register' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const isRegister = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

function switchTo(mode: 'login' | 'register') {
  isRegister.value = mode === 'register'
  error.value = ''
}

async function handleSubmit() {
  error.value = ''
  submitting.value = true

  const endpoint = isRegister.value ? '/api/auth/register' : '/api/auth/login'

  try {
    const data = await $fetch<{ success: boolean; token: string; user: any }>(endpoint, {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })

    if (data.token) {
      localStorage.setItem('user_token', data.token)
      localStorage.setItem('user_info', JSON.stringify(data.user))
      navigateTo('/', { replace: true })
    }
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    const msg = err?.data?.message

    if (status === 401) {
      error.value = 'Invalid username or password'
    } else if (status === 409) {
      error.value = 'Username already taken'
    } else if (status === 400) {
      error.value = msg || 'Please check your input'
    } else {
      error.value = msg || 'Something went wrong'
    }
  }

  submitting.value = false
}

// If already logged in, redirect home
onMounted(() => {
  const token = localStorage.getItem('user_token')
  if (token) {
    navigateTo('/', { replace: true })
  }
})
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #000;
  z-index: 100;
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
  margin-bottom: 1.5rem;
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

/* Tabs */
.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  background: #000;
  border: 1px solid #1a1a1a;
  border-radius: 0.5rem;
  padding: 0.2rem;
}

.tab {
  flex: 1;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 0.375rem;
  color: #555;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #888;
}

.tab.active {
  background: #1a1a1a;
  color: #fff;
}

/* Form */
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

.hint {
  font-size: 0.65rem;
  color: #444;
}

.error-msg {
  color: #f87171;
  font-size: 0.8rem;
  margin: 0;
}

.submit-btn {
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

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
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

/* Switch text */
.switch-text {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #555;
}

.switch-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.switch-btn:hover {
  color: #ccc;
}
</style>
