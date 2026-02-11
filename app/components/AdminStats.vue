<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">API Keys</div>
      <div class="stat-value">{{ activeKeys }}</div>
      <div class="stat-sub">{{ totalKeys }} total / {{ activeKeys }} active</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">MCQ Cached</div>
      <div class="stat-value">{{ loading ? '-' : stats?.mcq?.totalCachedQuestions ?? 0 }}</div>
      <div class="stat-sub">{{ stats?.mcq?.totalCacheHits ?? 0 }} total hits</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Code Cached</div>
      <div class="stat-value">{{ loading ? '-' : stats?.code?.totalCachedQuestions ?? 0 }}</div>
      <div class="stat-sub">{{ stats?.code?.totalCacheHits ?? 0 }} total hits</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">MCQ Avg Hits</div>
      <div class="stat-value">{{ loading ? '-' : stats?.mcq?.averageHitsPerQuestion ?? 0 }}</div>
      <div class="stat-sub">per question</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: any
  loading: boolean
  activeKeys: number
  totalKeys: number
}>()
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  padding: 1rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
}

.stat-label {
  font-size: 0.65rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #fff;
}

.stat-sub {
  font-size: 0.7rem;
  color: #333;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
