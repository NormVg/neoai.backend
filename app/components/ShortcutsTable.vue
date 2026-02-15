<template>
  <div class="shortcuts">
    <h3>SHORTCUTS</h3>
    <table>
      <thead>
        <tr>
          <th>Action</th>
          <th>Mac</th>
          <th>Windows</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Instant Solve</td>
          <td><code>&#8997;+Shift+.</code></td>
          <td><code>Ctrl+Shift+.</code></td>
        </tr>
        <tr>
          <td>Human Typing</td>
          <td><code>&#8997;+Shift+,</code></td>
          <td><code>Ctrl+Shift+,</code></td>
        </tr>
        <tr>
          <td>Custom Paste</td>
          <td><code>&#8997;+Shift+V</code></td>
          <td><code>Alt+Shift+V</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.shortcuts {
  margin-top: 1rem;
  padding: 1.25rem;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0.75rem;
  text-align: left;
}

.shortcuts h3 {
  font-size: 0.7rem;
  color: #555;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  table-layout: fixed;
}

thead tr {
  color: #555;
  text-align: left;
}

thead th {
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid #222;
}

thead th:first-child {
  width: 45%;
}

thead th:nth-child(2) {
  width: 27%;
}

thead th:nth-child(3) {
  width: 28%;
}

tbody {
  color: #888;
}

tbody td {
  padding: 0.5rem 0.5rem;
}

code {
  background: #222;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
