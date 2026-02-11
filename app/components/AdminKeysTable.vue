<template>
  <div class="keys-section">
    <div class="keys-header">
      <h3>API Keys</h3>
      <span class="keys-count">{{ keys.length }} key{{ keys.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Add new key form -->
    <div class="add-key-form">
      <div class="form-row">
        <input
          v-model="newLabel"
          type="text"
          placeholder="Label (e.g. Key 1)"
          class="input-label"
        />
        <input
          v-model="newKey"
          type="text"
          placeholder="Paste Google AI API key..."
          class="input-key"
        />
        <button class="btn-add" @click="addKey" :disabled="adding || !newLabel.trim() || !newKey.trim()">
          {{ adding ? '...' : 'Add' }}
        </button>
      </div>
    </div>

    <!-- Keys list -->
    <div v-if="loading" class="keys-loading">Loading keys...</div>
    <div v-else-if="keys.length === 0" class="keys-empty">
      No API keys configured. Add one above.
    </div>
    <div v-else class="keys-list">
      <div
        v-for="k in keys"
        :key="k.id"
        class="key-row"
        :class="{ inactive: !k.active }"
      >
        <div class="key-info">
          <div class="key-label-row">
            <span class="key-label">{{ k.label }}</span>
            <span class="key-status" :class="k.active ? 'active' : 'disabled'">
              {{ k.active ? 'Active' : 'Disabled' }}
            </span>
          </div>
          <span class="key-value">{{ k.key }}</span>
        </div>
        <div class="key-actions">
          <button
            class="btn-toggle"
            :class="k.active ? 'btn-disable' : 'btn-enable'"
            @click="$emit('toggle', k)"
            :disabled="toggling === k.id"
          >
            {{ k.active ? 'Disable' : 'Enable' }}
          </button>
          <button
            class="btn-delete-key"
            @click="$emit('delete', k)"
            :disabled="toggling === k.id"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ApiKey {
  id: string
  label: string
  key: string
  active: boolean
  createdAt: string
}

defineProps<{
  keys: ApiKey[]
  loading: boolean
  adding: boolean
  toggling: string | null
}>()

const emit = defineEmits<{
  add: [data: { label: string; key: string }]
  toggle: [key: ApiKey]
  delete: [key: ApiKey]
}>()

const newLabel = ref('')
const newKey = ref('')

function addKey() {
  if (!newLabel.value.trim() || !newKey.value.trim()) return
  emit('add', { label: newLabel.value.trim(), key: newKey.value.trim() })
  newLabel.value = ''
  newKey.value = ''
}
</script>

<style scoped>
.keys-section {
  margin-bottom: 1.5rem;
}

.keys-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.keys-header h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.keys-count {
  padding: 0.1rem 0.45rem;
  background: #1a1a1a;
  border-radius: 9999px;
  font-size: 0.6rem;
  color: #666;
}

/* Add form */
.add-key-form {
  margin-bottom: 0.75rem;
}

.form-row {
  display: flex;
  gap: 0.5rem;
}

.input-label {
  width: 160px;
  flex-shrink: 0;
  padding: 0.5rem 0.65rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.375rem;
  color: #ccc;
  font-size: 0.75rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.input-label:focus {
  border-color: #333;
}

.input-key {
  flex: 1;
  padding: 0.5rem 0.65rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.375rem;
  color: #ccc;
  font-size: 0.75rem;
  font-family: 'SF Mono', Monaco, monospace;
  outline: none;
  transition: border-color 0.2s;
}

.input-key:focus {
  border-color: #333;
}

.input-label::placeholder,
.input-key::placeholder {
  color: #333;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-add:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-add:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Keys list */
.keys-loading,
.keys-empty {
  text-align: center;
  padding: 1.5rem;
  color: #333;
  font-size: 0.8rem;
}

.keys-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.key-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.5rem;
  transition: opacity 0.2s;
}

.key-row.inactive {
  opacity: 0.45;
}

.key-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.key-label-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.key-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #ccc;
}

.key-status {
  font-size: 0.6rem;
  padding: 0.1rem 0.35rem;
  border-radius: 9999px;
  font-weight: 500;
}

.key-status.active {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}

.key-status.disabled {
  background: rgba(255, 255, 255, 0.05);
  color: #555;
}

.key-value {
  font-size: 0.65rem;
  color: #444;
  font-family: 'SF Mono', Monaco, monospace;
}

.key-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.btn-toggle {
  padding: 0.3rem 0.6rem;
  border: 1px solid #222;
  border-radius: 0.375rem;
  font-size: 0.65rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.btn-disable {
  color: #facc15;
  border-color: #332e0a;
}

.btn-disable:hover:not(:disabled) {
  background: rgba(250, 204, 21, 0.08);
}

.btn-enable {
  color: #4ade80;
  border-color: #0a3320;
}

.btn-enable:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.08);
}

.btn-toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-delete-key {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: 1px solid #222;
  border-radius: 0.375rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-key:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.08);
  border-color: #3a1a1a;
  color: #f87171;
}

.btn-delete-key:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
  }

  .input-label {
    width: 100%;
  }
}
</style>
