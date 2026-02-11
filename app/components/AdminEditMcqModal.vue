<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Edit MCQ Entry</h2>
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
          <label>Options</label>
          <div class="options-list">
            <div v-for="(opt, i) in form.options" :key="i" class="option-row">
              <span class="option-index" :class="{ selected: i === form.answer }">{{ i + 1 }}</span>
              <input v-model="form.options[i]" type="text" />
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Answer Index</label>
            <select v-model.number="form.answer">
              <option v-for="(opt, i) in form.options" :key="i" :value="i">
                {{ i + 1 }}. {{ opt }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Confidence</label>
            <input v-model.number="form.confidence" type="number" min="0" max="1" step="0.05" />
          </div>
        </div>

        <div class="field">
          <label>Selected Option</label>
          <input v-model="form.selectedOption" type="text" />
        </div>

        <div class="field">
          <label>Explanation</label>
          <textarea v-model="form.explanation" rows="4"></textarea>
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
  options: [...props.entry.options],
  answer: props.entry.answer,
  selectedOption: props.entry.selectedOption,
  explanation: props.entry.explanation,
  confidence: props.entry.confidence,
})

function handleSave() {
  emit('save', {
    question: form.question,
    options: form.options,
    answer: form.answer,
    selectedOption: form.selectedOption,
    explanation: form.explanation,
    confidence: form.confidence,
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
  max-width: 560px;
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
.field textarea,
.field select {
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
.field textarea:focus,
.field select:focus {
  border-color: #444;
}

.field textarea {
  resize: vertical;
}

.field select {
  cursor: pointer;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.field-row .field {
  flex: 1;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: #151515;
  border: 1px solid #222;
  border-radius: 0.25rem;
  font-size: 0.65rem;
  color: #555;
  flex-shrink: 0;
}

.option-index.selected {
  background: #0f1f0f;
  border-color: #1a3a1a;
  color: #4ade80;
}

.option-row input {
  flex: 1;
  padding: 0.4rem 0.5rem;
  background: #111;
  border: 1px solid #222;
  border-radius: 0.375rem;
  color: #ccc;
  font-size: 0.75rem;
  font-family: inherit;
  outline: none;
}

.option-row input:focus {
  border-color: #444;
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
