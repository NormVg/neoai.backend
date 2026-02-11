<template>
  <div class="table-wrap">
    <div v-if="loading" class="loading-bar">
      <div class="loading-fill"></div>
    </div>
    <table v-if="entries.length > 0">
      <thead>
        <tr>
          <th class="col-question">Question</th>
          <th class="col-answer">Answer</th>
          <th class="col-confidence">Conf</th>
          <th class="col-hits">Hits</th>
          <th class="col-date">Last Used</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <td class="col-question">
            <div class="question-text">{{ truncate(entry.question, 80) }}</div>
            <div class="question-options">
              <span
                v-for="(opt, i) in entry.options"
                :key="i"
                class="option-pill"
                :class="{ selected: i === entry.answer }"
              >{{ opt }}</span>
            </div>
          </td>
          <td class="col-answer">
            <span class="answer-badge">{{ entry.selectedOption }}</span>
          </td>
          <td class="col-confidence">
            <span class="confidence" :class="confidenceClass(entry.confidence)">
              {{ (entry.confidence * 100).toFixed(0) }}%
            </span>
          </td>
          <td class="col-hits">{{ entry.requestCount }}</td>
          <td class="col-date">{{ formatDate(entry.lastAccessed) }}</td>
          <td class="col-actions">
            <div class="action-btns">
              <button class="action-btn" @click="$emit('edit', entry)" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="action-btn delete" @click="$emit('delete', entry)" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14H7L5 6m5 0V4h4v2" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  entries: any[]
  loading: boolean
}>()

defineEmits(['edit', 'delete'])

function truncate(text: string, len: number) {
  return text.length > len ? text.slice(0, len) + '...' : text
}

function confidenceClass(c: number) {
  if (c >= 0.8) return 'high'
  if (c >= 0.5) return 'medium'
  return 'low'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.table-wrap {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
}

.loading-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #111;
  overflow: hidden;
}

.loading-fill {
  height: 100%;
  width: 30%;
  background: #444;
  animation: slide 1s infinite ease-in-out;
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

thead tr {
  border-bottom: 1px solid #1a1a1a;
}

thead th {
  padding: 0.75rem 0.75rem;
  text-align: left;
  font-size: 0.65rem;
  font-weight: 500;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

tbody tr {
  border-bottom: 1px solid #111;
  transition: background 0.15s;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background: #0d0d0d;
}

tbody td {
  padding: 0.75rem 0.75rem;
  vertical-align: top;
}

.col-question { width: 40%; }
.col-answer { width: 15%; }
.col-confidence { width: 8%; }
.col-hits { width: 8%; text-align: center; }
.col-date { width: 12%; }
.col-actions { width: 10%; }

.question-text {
  color: #ccc;
  line-height: 1.4;
  margin-bottom: 0.35rem;
}

.question-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.option-pill {
  display: inline-block;
  padding: 0.15rem 0.4rem;
  background: #151515;
  border: 1px solid #222;
  border-radius: 0.25rem;
  font-size: 0.65rem;
  color: #555;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-pill.selected {
  background: #0f1f0f;
  border-color: #1a3a1a;
  color: #4ade80;
}

.answer-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #111;
  border: 1px solid #222;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #999;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.confidence {
  font-weight: 600;
  font-size: 0.75rem;
}

.confidence.high { color: #4ade80; }
.confidence.medium { color: #facc15; }
.confidence.low { color: #f87171; }

.col-hits {
  color: #555;
}

.col-date {
  color: #444;
  font-size: 0.7rem;
}

.action-btns {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: none;
  border: 1px solid #1a1a1a;
  border-radius: 0.375rem;
  color: #444;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: #151515;
  border-color: #333;
  color: #ccc;
}

.action-btn.delete:hover {
  background: #1a0a0a;
  border-color: #3a1a1a;
  color: #f87171;
}
</style>
