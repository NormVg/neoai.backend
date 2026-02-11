<template>
  <div class="page-container">
    <div class="container">
      <LandingHero />
      <ApiEndpoints />
      <ShortcutsTable />
    </div>
    <NuxtLink to="/admin/login" class="admin-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Admin
    </NuxtLink>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.container {
  text-align: center;
  padding: 2rem;
  max-width: 520px;
}

.admin-link {
  position: fixed;
  bottom: 1.25rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  font-size: 0.7rem;
  color: #444;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.admin-link:hover {
  color: #888;
  border-color: #222;
  background: #0a0a0a;
}
</style>
