<template>
  <div class="pagination">
    <button
      class="page-btn"
      :disabled="pagination.page <= 1"
      @click="$emit('page', pagination.page - 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <template v-for="p in visiblePages" :key="p">
      <span v-if="p === '...'" class="page-ellipsis">...</span>
      <button
        v-else
        class="page-btn"
        :class="{ active: p === pagination.page }"
        @click="$emit('page', p)"
      >{{ p }}</button>
    </template>

    <button
      class="page-btn"
      :disabled="pagination.page >= pagination.totalPages"
      @click="$emit('page', pagination.page + 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>

    <span class="page-info">{{ pagination.page }} of {{ pagination.totalPages }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}>()

defineEmits(['page'])

const visiblePages = computed(() => {
  const { page, totalPages } = props.pagination
  const pages: (number | string)[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (page > 3) pages.push('...')

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (page < totalPages - 2) pages.push('...')
  pages.push(totalPages)

  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 1rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background: none;
  border: 1px solid #1a1a1a;
  border-radius: 0.375rem;
  color: #666;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: #111;
  border-color: #333;
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-btn.active {
  background: #fff;
  border-color: #fff;
  color: #000;
}

.page-ellipsis {
  color: #333;
  padding: 0 0.25rem;
  font-size: 0.75rem;
}

.page-info {
  margin-left: 0.75rem;
  font-size: 0.7rem;
  color: #333;
}
</style>
