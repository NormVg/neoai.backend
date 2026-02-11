<template>
  <div class="page-container">
    <div class="container">
      <LandingHero />
      <ApiEndpoints />
      <ShortcutsTable />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  padding: 2rem;
  max-width: 520px;
}
</style>
