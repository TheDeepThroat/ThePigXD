<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #0ea5e9; /* Sky blue */
  --primary-hover: #0284c7;
  --bg-dark: #0f172a; /* Slate 900 */
  --bg-card: #1e293b; /* Slate 800 */
  --bg-card-hover: #334155;
  --text-main: #f8fafc; /* Slate 50 */
  --text-muted: #94a3b8; /* Slate 400 */
  --border: #334155; /* Slate 700 */
  --paper-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --accent-yellow: #eab308;
  --accent-blue: #0ea5e9;
  --accent-green: #10b981;
  --accent-red: #ef4444;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  background-image: radial-gradient(circle at top center, #1e293b 0%, #0f172a 100%);
  background-attachment: fixed;
}

h1, h2, h3, h4 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

/* Remove handwritten classes */
.handwritten {
  font-family: 'Inter', sans-serif;
}

.glass {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.glass:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #475569;
}

::selection {
  background: rgba(14, 165, 233, 0.3);
  color: var(--text-main);
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-dark);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Base button styles */
.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(14, 165, 233, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
