<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <h2>Delete Entry</h2>
      </div>

      <div class="modal-body">
        <p>Are you sure you want to delete this cache entry? This action cannot be undone.</p>
        <div class="preview">
          <span class="preview-label">{{ entry.type.toUpperCase() }}</span>
          <p class="preview-text">{{ truncate(entry.question, 120) }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-delete" @click="$emit('confirm')" :disabled="deleting">
          {{ deleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  entry: { id: string; type: string; question: string }
  deleting: boolean
}>()

defineEmits(['close', 'confirm'])

function truncate(text: string, len: number) {
  return text.length > len ? text.slice(0, len) + '...' : text
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 420px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.25rem 1.25rem 0;
}

.modal-header h2 {
  font-size: 0.9rem;
  font-weight: 600;
}

.warning-icon {
  color: #f87171;
}

.modal-body {
  padding: 1rem 1.25rem;
}

.modal-body p {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.5;
}

.preview {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #111;
  border: 1px solid #1a1a1a;
  border-radius: 0.5rem;
}

.preview-label {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  background: #1a1a1a;
  border-radius: 0.2rem;
  font-size: 0.6rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.35rem;
}

.preview-text {
  font-size: 0.75rem;
  color: #888;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #222;
  border-radius: 0.375rem;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  background: #111;
  border-color: #333;
  color: #ccc;
}

.btn-delete {
  padding: 0.5rem 1.25rem;
  background: #dc2626;
  border: none;
  border-radius: 0.375rem;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-delete:hover {
  background: #b91c1c;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
