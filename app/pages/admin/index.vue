<template>
  <div class="admin-page">
    <header class="admin-header">
      <div class="header-left">
        <NuxtLink to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1>Admin</h1>
        <span class="badge">Cache Manager</span>
      </div>
      <div class="header-right">
        <button class="btn-icon" @click="refreshAll" :disabled="loading">
          <svg :class="{ spinning: loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
        <button class="btn-logout" @click="logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </header>

    <AdminStats :stats="stats" :loading="statsLoading" :activeKeys="apiKeys.filter(k => k.active).length" :totalKeys="apiKeys.length" />

    <AdminKeysTable
      :keys="apiKeys"
      :loading="keysLoading"
      :adding="addingKey"
      :toggling="togglingKey"
      @add="addApiKey"
      @toggle="toggleApiKey"
      @delete="openDeleteKey"
    />

    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'mcq' }"
        @click="activeTab = 'mcq'"
      >
        MCQ Cache
        <span class="tab-count" v-if="mcqData.pagination.total">{{ mcqData.pagination.total }}</span>
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'code' }"
        @click="activeTab = 'code'"
      >
        Code Cache
        <span class="tab-count" v-if="codeData.pagination.total">{{ codeData.pagination.total }}</span>
      </button>
    </div>

    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="`Search ${activeTab === 'mcq' ? 'MCQ' : 'Code'} questions...`"
        @input="debouncedSearch"
      />
      <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="activeTab === 'mcq'">
      <AdminMcqTable
        :entries="mcqData.entries"
        :loading="loading"
        @edit="openEditMcq"
        @delete="openDeleteMcq"
      />
    </div>
    <div v-else>
      <AdminCodeTable
        :entries="codeData.entries"
        :loading="loading"
        @edit="openEditCode"
        @delete="openDeleteCode"
      />
    </div>

    <AdminPagination
      v-if="currentPagination.totalPages > 1"
      :pagination="currentPagination"
      @page="goToPage"
    />

    <div v-if="!loading && currentEntries.length === 0" class="empty-state">
      <p>{{ searchQuery ? 'No results found' : 'No cache entries yet' }}</p>
    </div>

    <!-- Edit MCQ Modal -->
    <AdminEditMcqModal
      v-if="editingMcq"
      :entry="editingMcq"
      @close="editingMcq = null"
      @save="saveMcq"
      :saving="saving"
    />

    <!-- Edit Code Modal -->
    <AdminEditCodeModal
      v-if="editingCode"
      :entry="editingCode"
      @close="editingCode = null"
      @save="saveCode"
      :saving="saving"
    />

    <!-- Delete Confirm Modal -->
    <AdminDeleteModal
      v-if="deletingEntry"
      :entry="deletingEntry"
      @close="deletingEntry = null"
      @confirm="confirmDelete"
      :deleting="deleting"
    />

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface ApiKeyEntry {
  id: string
  label: string
  key: string
  active: boolean
  createdAt: string
}

interface MCQEntry {
  id: string
  question: string
  options: string[]
  code: string | null
  cacheKey: string
  answer: number
  selectedOption: string
  explanation: string
  confidence: number
  createdAt: string
  requestCount: number
  lastAccessed: string
}

interface CodeEntry {
  id: string
  question: string
  language: string
  inputFormat: string | null
  outputFormat: string | null
  testCases: string | null
  cacheKey: string
  code: string
  explanation: string
  timeComplexity: string
  spaceComplexity: string
  createdAt: string
  requestCount: number
  lastAccessed: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Auth
const adminToken = ref<string | null>(null)

function getAuthHeaders(): HeadersInit {
  return adminToken.value ? { Authorization: `Bearer ${adminToken.value}` } : {}
}

function handleAuthError(err: any) {
  const status = err?.response?.status || err?.statusCode
  if (status === 401 || status === 403) {
    localStorage.removeItem('admin_token')
    navigateTo('/admin/login')
  }
}

function logout() {
  localStorage.removeItem('admin_token')
  navigateTo('/admin/login')
}

const activeTab = ref<'mcq' | 'code'>('mcq')
const searchQuery = ref('')
const loading = ref(false)
const statsLoading = ref(false)
const saving = ref(false)
const deleting = ref(false)

// API Keys state
const apiKeys = ref<ApiKeyEntry[]>([])
const keysLoading = ref(false)
const addingKey = ref(false)
const togglingKey = ref<string | null>(null)

const editingMcq = ref<MCQEntry | null>(null)
const editingCode = ref<CodeEntry | null>(null)
const deletingEntry = ref<{ id: string; type: 'mcq' | 'code' | 'key'; question: string } | null>(null)

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const stats = ref<any>(null)

const mcqData = ref<{ entries: MCQEntry[]; pagination: Pagination }>({
  entries: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
})

const codeData = ref<{ entries: CodeEntry[]; pagination: Pagination }>({
  entries: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
})

const currentPagination = computed(() =>
  activeTab.value === 'mcq' ? mcqData.value.pagination : codeData.value.pagination
)

const currentEntries = computed(() =>
  activeTab.value === 'mcq' ? mcqData.value.entries : codeData.value.entries
)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (activeTab.value === 'mcq') {
      fetchMcq(1)
    } else {
      fetchCode(1)
    }
  }, 400)
}

function clearSearch() {
  searchQuery.value = ''
  if (activeTab.value === 'mcq') fetchMcq(1)
  else fetchCode(1)
}

async function fetchStats() {
  statsLoading.value = true
  try {
    stats.value = await $fetch('/api/cache/stats')
  } catch { /* silent */ }
  statsLoading.value = false
}

async function fetchMcq(page = 1) {
  loading.value = true
  try {
    const data = await $fetch<{ entries: MCQEntry[]; pagination: Pagination }>('/api/admin/mcq', {
      query: { page, limit: 20, search: searchQuery.value },
      headers: getAuthHeaders(),
    })
    mcqData.value = data
  } catch (err) {
    handleAuthError(err)
    showToast('Failed to fetch MCQ data', 'error')
  }
  loading.value = false
}

async function fetchCode(page = 1) {
  loading.value = true
  try {
    const data = await $fetch<{ entries: CodeEntry[]; pagination: Pagination }>('/api/admin/code', {
      query: { page, limit: 20, search: searchQuery.value },
      headers: getAuthHeaders(),
    })
    codeData.value = data
  } catch (err) {
    handleAuthError(err)
    showToast('Failed to fetch Code data', 'error')
  }
  loading.value = false
}

function goToPage(page: number) {
  if (activeTab.value === 'mcq') fetchMcq(page)
  else fetchCode(page)
}

function refreshAll() {
  fetchStats()
  fetchApiKeys()
  fetchMcq(1)
  fetchCode(1)
}

// API Keys handlers
async function fetchApiKeys() {
  keysLoading.value = true
  try {
    const data = await $fetch<{ keys: ApiKeyEntry[]; total: number }>('/api/admin/keys', {
      headers: getAuthHeaders(),
    })
    apiKeys.value = data.keys
  } catch (err) {
    handleAuthError(err)
    showToast('Failed to fetch API keys', 'error')
  }
  keysLoading.value = false
}

async function addApiKey(payload: { label: string; key: string }) {
  addingKey.value = true
  try {
    await $fetch('/api/admin/keys', {
      method: 'POST',
      body: payload,
      headers: getAuthHeaders(),
    })
    showToast('API key added')
    fetchApiKeys()
    fetchStats()
  } catch (error: any) {
    handleAuthError(error)
    const msg = error?.data?.message || 'Failed to add API key'
    showToast(msg, 'error')
  }
  addingKey.value = false
}

async function toggleApiKey(key: ApiKeyEntry) {
  togglingKey.value = key.id
  try {
    await $fetch(`/api/admin/keys/${key.id}`, {
      method: 'PUT',
      body: { active: !key.active },
      headers: getAuthHeaders(),
    })
    showToast(`Key "${key.label}" ${key.active ? 'disabled' : 'enabled'}`)
    fetchApiKeys()
    fetchStats()
  } catch (err) {
    handleAuthError(err)
    showToast('Failed to update key', 'error')
  }
  togglingKey.value = null
}

function openDeleteKey(key: ApiKeyEntry) {
  deletingEntry.value = { id: key.id, type: 'key' as any, question: `API Key: ${key.label}` }
}

// Edit handlers
function openEditMcq(entry: MCQEntry) {
  editingMcq.value = { ...entry }
}

function openEditCode(entry: CodeEntry) {
  editingCode.value = { ...entry }
}

async function saveMcq(data: Partial<MCQEntry>) {
  if (!editingMcq.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/mcq/${editingMcq.value.id}`, {
      method: 'PUT',
      body: data,
      headers: getAuthHeaders(),
    })
    showToast('MCQ entry updated')
    editingMcq.value = null
    fetchMcq(mcqData.value.pagination.page)
  } catch (err) {
    handleAuthError(err)
    showToast('Failed to update entry', 'error')
  }
  saving.value = false
}

async function saveCode(data: Partial<CodeEntry>) {
  if (!editingCode.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/code/${editingCode.value.id}`, {
      method: 'PUT',
      body: data,
      headers: getAuthHeaders(),
    })
    showToast('Code entry updated')
    editingCode.value = null
    fetchCode(codeData.value.pagination.page)
  } catch (err) {
    handleAuthError(err)
    showToast('Failed to update entry', 'error')
  }
  saving.value = false
}

// Delete handlers
function openDeleteMcq(entry: MCQEntry) {
  deletingEntry.value = { id: entry.id, type: 'mcq', question: entry.question }
}

function openDeleteCode(entry: CodeEntry) {
  deletingEntry.value = { id: entry.id, type: 'code', question: entry.question }
}

async function confirmDelete() {
  if (!deletingEntry.value) return
  deleting.value = true
  const { id, type } = deletingEntry.value
  try {
    if (type === 'key') {
      await $fetch(`/api/admin/keys/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      showToast('API key deleted')
      deletingEntry.value = null
      fetchApiKeys()
    } else {
      await $fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      showToast(`${type.toUpperCase()} entry deleted`)
      deletingEntry.value = null
      if (type === 'mcq') fetchMcq(mcqData.value.pagination.page)
      else fetchCode(codeData.value.pagination.page)
    }
    fetchStats()
  } catch (err) {
    handleAuthError(err)
    showToast('Failed to delete entry', 'error')
  }
  deleting.value = false
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// Watch tab changes to refetch
watch(activeTab, (tab) => {
  searchQuery.value = ''
  if (tab === 'mcq') fetchMcq(1)
  else fetchCode(1)
})

// Initial load (middleware already guards access)
onMounted(() => {
  adminToken.value = localStorage.getItem('admin_token')
  fetchStats()
  fetchApiKeys()
  fetchMcq(1)
  fetchCode(1)
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.admin-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-size: 0.65rem;
  color: #555;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  border: 1px solid #222;
  border-radius: 0.5rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #111;
  border-color: #333;
  color: #fff;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  background: transparent;
  border: 1px solid #222;
  border-radius: 0.5rem;
  color: #666;
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #1a0a0a;
  border-color: #3a1a1a;
  color: #f87171;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #1a1a1a;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #555;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #888;
}

.tab.active {
  color: #fff;
  border-bottom-color: #fff;
}

.tab-count {
  padding: 0.1rem 0.45rem;
  background: #1a1a1a;
  border-radius: 9999px;
  font-size: 0.65rem;
  color: #666;
}

.tab.active .tab-count {
  background: #222;
  color: #999;
}

/* Search */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.search-bar svg {
  color: #444;
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #ccc;
  font-size: 0.8rem;
  font-family: inherit;
}

.search-bar input::placeholder {
  color: #333;
}

.clear-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  padding: 0;
}

.clear-btn:hover {
  color: #888;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #333;
  font-size: 0.85rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6rem 1.25rem;
  background: #111;
  border: 1px solid #222;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  color: #ccc;
  z-index: 1000;
}

.toast.success {
  border-color: #1a3a1a;
  color: #4ade80;
}

.toast.error {
  border-color: #3a1a1a;
  color: #f87171;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}
</style>
