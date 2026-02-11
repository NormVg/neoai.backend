<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Code Entry</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label>Question</label>
          <textarea v-model="form.question" rows="3"></textarea>
        </div>

        <div class="field">
          <label>Language</label>
          <input v-model="form.language" type="text" />
        </div>

        <div class="field">
          <label>Code</label>
          <textarea v-model="form.code" rows="10" class="code-textarea"></textarea>
        </div>

        <div class="field">
          <label>Explanation</label>
          <textarea v-model="form.explanation" rows="4"></textarea>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Time Complexity</label>
            <input v-model="form.timeComplexity" type="text" />
          </div>
          <div class="field">
            <label>Space Complexity</label>
            <input v-model="form.spaceComplexity" type="text" />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-save" @click="handleSave" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  entry: any
  saving: boolean
}>()

const emit = defineEmits(['close', 'save'])

const form = reactive({
  question: props.entry.question,
  language: props.entry.language,
  code: props.entry.code,
  explanation: props.entry.explanation,
  timeComplexity: props.entry.timeComplexity,
  spaceComplexity: props.entry.spaceComplexity,
})

function handleSave() {
  emit('save', {
    question: form.question,
    language: form.language,
    code: form.code,
    explanation: form.explanation,
    timeComplexity: form.timeComplexity,
    spaceComplexity: form.spaceComplexity,
  })
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
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #1a1a1a;
}

.modal-header h2 {
  font-size: 0.9rem;
  font-weight: 600;
}

.close-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.close-btn:hover {
  color: #fff;
  background: #1a1a1a;
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-size: 0.65rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.4rem;
}

.field input,
.field textarea {
  width: 100%;
  padding: 0.5rem 0.65rem;
  background: #111;
  border: 1px solid #222;
  border-radius: 0.375rem;
  color: #ccc;
  font-size: 0.8rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus,
.field textarea:focus {
  border-color: #444;
}

.field textarea {
  resize: vertical;
}

.code-textarea {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  tab-size: 4;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.field-row .field {
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #1a1a1a;
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

.btn-save {
  padding: 0.5rem 1.25rem;
  background: #fff;
  border: none;
  border-radius: 0.375rem;
  color: #000;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover {
  background: #e5e5e5;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
