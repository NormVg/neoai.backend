<template>
  <div class="page-container">
    <div class="container">
      <LandingHero />
      <section class="content-section">
        <ApiEndpoints />
        <ShortcutsTable />
      </section>
      <footer class="site-footer">
        Support: <a href="mailto:support@neoai.projectkit.shop">support@neoai.projectkit.shop</a>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 0 3rem 0;
}

.container {
  text-align: center;
  padding: 2.5rem 1.5rem 2rem;
  max-width: 560px;
  width: 100%;
}

.content-section {
  margin-top: 2rem;
  text-align: left;
}

.site-footer {
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #1a1a1a;
  font-size: 0.8rem;
  color: #555;
}

.site-footer a {
  color: #888;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.site-footer a:hover {
  color: #fff;
}
</style>
