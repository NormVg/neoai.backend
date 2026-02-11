<template>
  <div>
    <button class="btn outline" @click="testServer">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <circle cx="12" cy="12" r="6" fill="#22c55e" />
      </svg>
      Test Server
    </button>
    <p v-if="testResult" class="result" :class="{ error: isError }">
      {{ testResult }}
    </p>
  </div>
</template>

<script setup lang="ts">
const testResult = ref('')
const isError = ref(false)

async function testServer() {
  testResult.value = 'Testing...'
  isError.value = false

  try {
    const res = await fetch('/api/health')
    const data = await res.json()
    testResult.value = '\u2713 ' + JSON.stringify(data)
    isError.value = false
  } catch (e: any) {
    testResult.value = '\u2717 ' + e.message
    isError.value = true
  }
}
</script>

<style scoped>
.btn.outline {
  display: inline-flex;
  align-items: center;
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

.btn.outline:hover {
  background: #111;
  border-color: #444;
}

.btn svg {
  width: 1rem;
  height: 1rem;
}

.result {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.result.error {
  color: #f66;
}
</style>
