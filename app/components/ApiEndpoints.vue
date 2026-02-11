<template>
  <div class="endpoints">
    <h3>API</h3>
    <div class="endpoint">
      <span class="method">POST</span>
      <span class="path">/api/solve-mcq</span>
    </div>
    <div class="endpoint">
      <span class="method">POST</span>
      <span class="path">/api/solve-code</span>
    </div>
    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/api/health</span>
    </div>
    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/api/cache/stats</span>
    </div>
  </div>
</template>

<style scoped>
.endpoints {
  margin-top: 3rem;
  padding: 1.25rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  text-align: left;
}

.endpoints h3 {
  font-size: 0.7rem;
  color: #555;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.endpoint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.8rem;
}

.method {
  padding: 0.125rem 0.5rem;
  background: #333;
  border-radius: 0.25rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: #999;
}

.path {
  color: #666;
}
</style>
