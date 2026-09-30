<script setup>
import notesData from '../../content/notes.json';

const notes = notesData.notes ?? [];
</script>

<template>
  <section v-if="notes.length" class="section">
    <div class="container">
      <h2 class="section-title">技术笔记</h2>
      <p class="section-sub">调试与学习中的真实记录</p>
      <div class="notes">
        <div v-for="note in notes" :key="note.id" class="note card">
          <div class="note-head">
            <h3>{{ note.title }}</h3>
            <span class="note-date">{{ note.updatedAt?.slice(0, 10) }}</span>
          </div>
          <p class="note-content">{{ note.content }}</p>
          <div v-if="note.tags?.length" class="note-tags">
            <span v-for="tag in note.tags" :key="tag" class="note-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 64px 0;
}

.notes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.note {
  padding: 18px;
}

.note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.note-head h3 {
  margin: 0;
  font-size: 15px;
}

.note-date {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--ink-2);
}

.note-content {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.note-tag {
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
