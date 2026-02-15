<template>
  <div class="test-wrap">
    <button class="btn outline" @click="testServer" :disabled="loading">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <circle cx="12" cy="12" r="6" fill="#22c55e" />
      </svg>
      {{ loading ? 'Testing...' : 'Test Server' }}
    </button>
    <div v-if="testResult && !loading" class="result-card" :class="{ error: isError }">
      <div class="result-card-header">
        <span class="result-label">{{ isError ? 'Error' : 'Response' }}</span>
      </div>
      <pre class="result-body">{{ displayResult }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const testResult = ref('')
const rawData = ref<Record<string, unknown> | null>(null)
const isError = ref(false)
const loading = ref(false)

const displayResult = computed(() => {
  if (rawData.value) return JSON.stringify(rawData.value, null, 2)
  return testResult.value
})

async function testServer() {
  testResult.value = ''
  rawData.value = null
  isError.value = false
  loading.value = true

  try {
    const res = await fetch('/api/health')
    const data = await res.json()
    rawData.value = data
    testResult.value = 'ok'
    isError.value = false
  } catch (e: any) {
    testResult.value = e?.message || 'Request failed'
    rawData.value = null
    isError.value = true
  }

  loading.value = false
}
</script>

<style scoped>
.test-wrap {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 0;
}

.btn.outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #888;
  border: 1px solid #333;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.outline:hover:not(:disabled) {
  background: #111;
  border-color: #444;
}

.btn.outline:disabled {
  opacity: 0.7;
  cursor: wait;
}

.btn svg {
  width: 1rem;
  height: 1rem;
}

.result-card {
  margin-top: 1rem;
  width: 100%;
  padding: 1rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  text-align: center;
}

.result-card.error {
  border-color: #3a1a1a;
  background: rgba(248, 113, 113, 0.05);
}

.result-card-header {
  margin-bottom: 0.5rem;
  text-align: center;
}

.result-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
}

.result-card.error .result-label {
  color: #f87171;
}

.result-body {
  margin: 0;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.75rem;
  color: #888;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
}

.result-card.error .result-body {
  color: #f87171;
}
</style>
