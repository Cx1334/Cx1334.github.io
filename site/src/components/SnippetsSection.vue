<script setup>
import snippetsData from '../../content/snippets.json';

const snippets = snippetsData.snippets ?? [];
</script>

<template>
  <div v-if="snippets.length" class="snippets">
    <div v-for="snippet in snippets" :key="snippet.id" class="snippet card">
      <div class="sn-head">
        <h3>{{ snippet.title }}</h3>
        <span class="lang">{{ snippet.language }}</span>
      </div>
      <p v-if="snippet.description" class="sn-desc">{{ snippet.description }}</p>
      <pre><code>{{ snippet.code }}</code></pre>
      <div v-if="snippet.tags?.length" class="sn-tags">
        <span v-for="tag in snippet.tags" :key="tag" class="sn-tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.snippets {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.snippet {
  padding: 18px;
}

.sn-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sn-head h3 {
  margin: 0;
  font-size: 15px;
}

.lang {
  font-family: var(--mono);
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 650;
}

.sn-desc {
  margin: 6px 0 10px;
  font-size: 12.5px;
  color: var(--ink-2);
}

pre {
  margin: 0;
  padding: 14px;
  border-radius: 10px;
  background: #101418;
  overflow-x: auto;
}

code {
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: #cfe3dc;
}

.sn-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.sn-tag {
  font-size: 11px;
  padding: 1px 9px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--ink-2);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
</style>
